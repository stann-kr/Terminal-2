"use client";

import { useRef, useEffect, useState } from "react";
import { useScramble } from "use-scramble";
import { prepare, layout } from "@chenglou/pretext";

interface DecodeTextProps {
  /** 표시할 텍스트 */
  text: string;
  /** 명시적인 폰트 값이 없으면 CSS computed style에서 자동 추출 */
  font?: string;
  /** 명시적인 lineHeight 값이 없으면 CSS computed style에서 자동 추출 */
  lineHeight?: number;
  /** 아우터 컨테이너 및 텍스트에 적용될 CSS 클래스 (Tailwind 반응형 클래스 등) */
  className?: string;
  /** 인라인 속성 */
  style?: React.CSSProperties;
  /** 렌더링 태그 */
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3";
  /** 애니메이션 속도 */
  speed?: number;
  scramble?: number;
  step?: number;
  delay?: number; // 아직 미사용(스태거용)이나 향후 확장용
  onComplete?: () => void;
  playOnMount?: boolean;
  /** 텍스트가 변경될 때 다시 스크램블할지 여부 (기본값: true) */
  scrambleOnUpdate?: boolean;
}

export default function DecodeText({
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
}: DecodeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preparedRef = useRef<ReturnType<typeof prepare> | null>(null);
  const lastFontRef = useRef<string | null>(null);

  // use-scramble 훅 사용
  const { ref: scrambleRef } = useScramble({
    text,
    speed,
    scramble,
    step,
    range: [48, 102], // 0-9, A-Z (Hex 느낌)
    overdrive: false,
    playOnMount,
    onAnimationEnd: onComplete,
    // scrambleOnUpdate가 false면 텍스트 변경 시 애니메이션 비활성화 지원을 위해 내부적으로 처리
  });

  // scrambleOnUpdate 처리: text가 바뀔 때 scrambleOnUpdate가 false면 scrambleRef의 내부 상태 업데이트 방안
  // use-scramble 라이브러리 특성상 playOnUpdate 같은 옵션이 없다면 수동 제어가 필요할 수 있음
  // 여기서는 사용자가 원하는 '최초 렌더 시에만 적용'을 위해 래핑함

  // 뷰포트 / 반응형 대응 ResizeObserver 로직
  useEffect(() => {
    let animationFrameId: number;

    const measureAndLayout = () => {
      const container = containerRef.current;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textNode = scrambleRef.current as any;
      if (!container || !textNode) return;

      const width = container.offsetWidth;
      // width가 너무 작으면 비정상적 줄바꿈이 발생해 측정값이 매우 커짐
      if (width <= 10) return;

      // 1. 폰트/줄간격 추출 (명시적 값 우선, 없으면 Computed Style)
      let activeFont = explicitFont;
      let activeLineHeight = explicitLineHeight;

      if (!activeFont || !activeLineHeight) {
        const computed = window.getComputedStyle(textNode);
        if (!activeFont) {
          activeFont = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
        }
        if (!activeLineHeight) {
          // 'normal' 처우 대비 폴백
          const parsedLh = parseFloat(computed.lineHeight);
          const parsedFs = parseFloat(computed.fontSize);
          activeLineHeight = isNaN(parsedLh) ? parsedFs * 1.5 : parsedLh;
        }
      }

      // 2. 폰트/텍스트가 변경되었을 때만 prepare (비용 높은 작업 최소화)
      const cacheKey = `${text}_${activeFont}`;
      if (lastFontRef.current !== cacheKey || !preparedRef.current) {
        preparedRef.current = prepare(text, activeFont, { whiteSpace: "pre-wrap" });
        lastFontRef.current = cacheKey;
      }

      // 3. 레이아웃 높이 계산 및 적용 (비용 낮은 작업, 리사이즈시마다 실행)
      const { height } = layout(preparedRef.current, width, activeLineHeight);
      container.style.minHeight = `${height}px`;
    };

    // ResizeObserver를 통해 컨테이너 너비 변경을 유기적으로 추적
    const resizeObserver = new ResizeObserver(() => {
      // 리플로우 최적화를 위해 rAF로 감싸기
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        // 폰트 로드 확인 후 처리
        document.fonts.ready.then(measureAndLayout);
      });
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 초기 마운트 직후 한 번 실행 (약간의 지연을 통해 CSS 렌더링 확보)
    animationFrameId = requestAnimationFrame(() => {
      document.fonts.ready.then(measureAndLayout);
    });

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [text, explicitFont, explicitLineHeight, scrambleRef]);

  return (
    <div
      ref={containerRef}
      className={`relative transition-all duration-500 ease-out ${className}`}
      style={{ display: "block", minWidth: '1ch' }}
    >
      <Tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={scrambleOnUpdate ? (scrambleRef as any) : null}
        className={className}
        style={{
          whiteSpace: "pre-wrap",
          display: "block",
          ...style,
        }}
      >
        {!scrambleOnUpdate ? text : null}
      </Tag>
    </div>
  );
}

