"use client";

import { useRef, useEffect, useLayoutEffect, useCallback, memo, type CSSProperties } from "react";
import { useScramble } from "use-scramble";
import { prepare, layout } from "@chenglou/pretext";

interface DecodeTextProps {
  /** 표시할 텍스트 */
  text: string;
  /** 명시적인 폰트 값이 없으면 CSS computed style에서 자동 추출 */
  font?: string;
  /** 명시적인 lineHeight 값이 없으면 CSS computed style에서 자동 추출 */
  lineHeight?: number;
  /** Tag에 적용될 CSS 클래스 */
  className?: string;
  /** 인라인 스타일 */
  style?: CSSProperties;
  /** 렌더링 태그 */
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3";
  /** 애니메이션 속도 */
  speed?: number;
  scramble?: number;
  step?: number;
  /** 애니메이션 시작 지연 시간 (ms). 스태거 효과에 사용 */
  delay?: number;
  onComplete?: () => void;
  playOnMount?: boolean;
  /**
   * true(기본값): 텍스트 변경 시마다 스크램블 재실행 — 동적 텍스트용.
   * false: 마운트 시 1회만 스크램블, 이후 텍스트 변경은 직접 업데이트 — 카운트다운 등 빈번한 업데이트용.
   */
  scrambleOnUpdate?: boolean;
  /**
   * 텍스트의 길이를 빈 문자열부터 점진적으로 나타냅니다 (타자기를 치는 듯한 효과).
   * 텍스트 레이아웃 점프 방지에 매우 효과적입니다.
   */
  animateTextLength?: boolean;
  /**
   * true: height 측정 컨테이너 없이 Tag를 직접 렌더링.
   * 높이가 고정되거나 부모가 레이아웃을 제어하는 경우 사용 (카운트다운 숫자 등).
   */
  autoHeight?: boolean;
}

/**
 * 터미널 Decode/Cipher 텍스트 애니메이션 컴포넌트.
 * - memo: 부모 재렌더 시 props 변경이 없으면 재렌더 방지 → use-scramble 애니메이션 보호
 * - scrambleOnUpdate=false: 초기 1회 스크램블 후 직접 DOM 업데이트로 전환
 * - minHeight transition: 내용이 채워지며 자연스럽게 커지는 grow 효과
 */
const DecodeText = memo(function DecodeText({
  text,
  font: explicitFont,
  lineHeight: explicitLineHeight,
  className = "",
  style,
  as: Tag = "span",
  speed = 0.5,
  scramble = 8,
  step = 1,
  delay = 0,
  onComplete,
  playOnMount = true,
  scrambleOnUpdate = true,
  animateTextLength = false,
  autoHeight = false,
}: DecodeTextProps) {
  // 외부 div: minHeight 측정/적용 전용
  const containerRef = useRef<HTMLDivElement>(null);
  // measureRef: 항상 Tag에 연결 — 폰트 측정 및 DOM 업데이트용
  const measureRef = useRef<HTMLElement | null>(null);
  const preparedRef = useRef<ReturnType<typeof prepare> | null>(null);
  const lastFontRef = useRef<string | null>(null);

  // scrambleOnUpdate=false: 초기 애니메이션 완료 후 settled 상태
  const animationSettledRef = useRef(false);
  // scrambleOnUpdate=false: use-scramble에 전달하는 텍스트를 초기값으로 고정 → 텍스트 변경 시 재스크램블 방지
  const frozenTextRef = useRef(text);

  // delay > 0이면 마운트 후 비활성, setTimeout으로 replay
  const effectivePlayOnMount = delay > 0 ? false : playOnMount;

  const { ref: scrambleRef, replay } = useScramble({
    // scrambleOnUpdate=false: 고정된 초기 텍스트 전달 → text 변경 시 use-scramble 재트리거 방지
    text: scrambleOnUpdate ? text : frozenTextRef.current,
    speed,
    scramble,
    step,
    range: [48, 102], // 0-9, A-Z (Hex 느낌)
    overdrive: false,
    playOnMount: effectivePlayOnMount,
    overflow: animateTextLength, // 빈 문자열부터 길이가 늘어나는 애니메이션 (타자기 효과)
    onAnimationEnd: () => {
      if (!scrambleOnUpdate) {
        // 초기 애니메이션 완료: scramble ref 해제 → 이후 재트리거 시 draw() 무시
        animationSettledRef.current = true;
        (scrambleRef as any).current = null; // eslint-disable-line @typescript-eslint/no-explicit-any
        // 현재 실제 텍스트로 즉시 업데이트 (frozenText와 다를 수 있음)
        if (measureRef.current) {
          measureRef.current.innerHTML = text;
        }
      }
      onComplete?.();
    },
  });

  // delay 구현: 마운트 시 1회, delay ms 후 replay()
  useEffect(() => {
    if (delay <= 0) return;
    const timer = setTimeout(() => {
      if (!animationSettledRef.current) replay();
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // animateTextLength + delay: use-scramble이 playOnMount=false일 때 전체 텍스트를
  // DOM에 즉시 써버리는 것을 방지. replay() 이전까지 빈 상태 유지.
  useEffect(() => {
    if (!animateTextLength || delay <= 0) return;
    if (measureRef.current) {
      measureRef.current.innerHTML = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scrambleOnUpdate=false + settled: 텍스트 변경 시 직접 DOM 업데이트 (애니메이션 없이)
  useEffect(() => {
    if (scrambleOnUpdate || !animationSettledRef.current) return;
    const node = measureRef.current;
    if (!node) return;
    node.innerHTML = text;
  }, [text, scrambleOnUpdate]);

  // pretext 레이아웃 측정: measureRef 사용 (scrambleRef 독립)
  // autoHeight=true이면 측정 불필요 — 부모 레이아웃이 높이를 제어함
  useLayoutEffect(() => {
    if (autoHeight) return;
    let animationFrameId: number;

    const measureAndLayout = () => {
      const container = containerRef.current;
      const textNode = measureRef.current;
      if (!container || !textNode || text === undefined || text === null) return;

      let width = container.offsetWidth;
      // 컨테이너가 auto-sizing span 안에 있어 초기 너비가 매우 좁은 경우(1ch 등),
      // DOM 조상을 탐색하여 실제 레이아웃 너비를 가진 첫 번째 조상 사용
      if (width < 50) {
        let el: HTMLElement | null = container.parentElement;
        while (el && el.tagName !== 'BODY') {
          if (el.offsetWidth > 100) {
            width = el.offsetWidth;
            break;
          }
          el = el.parentElement;
        }
      }
      if (width <= 10) return;

      let activeFont = explicitFont;
      let activeLineHeight = explicitLineHeight;

      if (!activeFont || !activeLineHeight) {
        const computed = window.getComputedStyle(textNode);
        if (!activeFont) {
          activeFont = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
        }
        if (!activeLineHeight) {
          const parsedLh = parseFloat(computed.lineHeight);
          const parsedFs = parseFloat(computed.fontSize);
          activeLineHeight = isNaN(parsedLh) ? parsedFs * 1.5 : parsedLh;
        }
      }

      const cacheKey = `${text}_${activeFont}`;
      if (lastFontRef.current !== cacheKey || !preparedRef.current) {
        preparedRef.current = prepare(text, activeFont, { whiteSpace: "pre-wrap" });
        lastFontRef.current = cacheKey;
      }

      const { height } = layout(preparedRef.current, width, activeLineHeight);
      container.style.height = `${height}px`;
      container.style.minHeight = `${height}px`;
    };

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        document.fonts.ready.then(measureAndLayout);
      });
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 초기 측정: RAF 후 처리 — 레이아웃 안정화 후 너비를 측정하여 높이 오측정 방지
    // (즉시 측정 시 flex/grid 레이아웃이 확정되기 전 너비를 읽어 과도한 높이가 설정됨)
    animationFrameId = requestAnimationFrame(() => {
      document.fonts.ready.then(measureAndLayout);
    });

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [text, explicitFont, explicitLineHeight, autoHeight]);

  /**
   * 안정적인 callback ref: useCallback([])으로 마운트 시 1회만 생성.
   * - 매 렌더마다 새 함수가 생성되면 React가 null → node 사이클 호출
   *   → scrambleRef.current 순간 null → use-scramble 애니메이션 중단
   * - 고정된 함수 참조 → React가 재호출하지 않음 → 애니메이션 안정
   */
  const setTagRef = useCallback((node: HTMLElement | null) => {
    measureRef.current = node;
    // settled가 아닌 경우에만 scramble ref 연결
    // (scrambleOnUpdate=true는 settled 상태가 되지 않으므로 항상 연결됨)
    if (!animationSettledRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (scrambleRef as any).current = node;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 deps: scrambleRef(stable RefObject)와 animationSettledRef(ref)는 안정적

  // autoHeight: 측정 컨테이너 없이 Tag 직접 렌더 (카운트다운 숫자 등 고정 레이아웃용)
  if (autoHeight) {
    return (
      <Tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={setTagRef as any}
        className={className}
        style={{ whiteSpace: "pre-wrap", display: "block", ...style }}
      >
        {null}
      </Tag>
    );
  }

  return (
    // transition: height, min-height — 내용이 채워지며 점진적으로 높이가 커지는 grow 효과
    // overflow: hidden — 텍스트 라인이 도중에 wrapping하며 레이아웃을 밀어내는 끊김 현상(jitter)을 마스킹
    <div
      ref={containerRef}
      style={{
        overflow: "hidden",
        minWidth: "1ch",
        height: "0px",
        transition: "height 0.25s ease-out, min-height 0.25s ease-out"
      }}
    >
      <Tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={setTagRef as any}
        className={className}
        style={{ whiteSpace: "pre-wrap", display: "block", ...style }}
      >
        {null}
      </Tag>
    </div>
  );
});

export default DecodeText;
