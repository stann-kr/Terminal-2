'use client';

import { useRef, useLayoutEffect } from 'react';

interface AnimatedHeightProps {
  children: React.ReactNode;
  /**
   * false: height → 0, opacity → 0 (숨김 애니메이션)
   * true(기본값): 내부 content 높이를 ResizeObserver로 추적하며 부드럽게 전환
   */
  show?: boolean;
  /** CSS transition 지속 시간 (ms). 기본 350 */
  duration?: number;
  className?: string;
}

/**
 * ResizeObserver + CSS transition 기반 height 애니메이터.
 *
 * framer-motion의 `height: 'auto'`는 측정 시점에 DecodeText(pretext)가 아직
 * RAF를 실행하기 전이라 잘못된 높이를 캡처하는 문제가 있음.
 * 이 컴포넌트는 ResizeObserver로 내부 div의 높이 변화를 감지 → CSS transition으로
 * 외부 컨테이너 높이를 부드럽게 추적하여 pretext RAF 타이밍과 자연스럽게 협력함.
 */
export default function AnimatedHeight({
  children,
  show = true,
  duration = 350,
  className,
}: AnimatedHeightProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const sync = () => {
      outer.style.height = show ? `${inner.offsetHeight}px` : '0px';
    };

    const observer = new ResizeObserver(sync);
    observer.observe(inner);
    sync(); // 초기 동기화

    return () => observer.disconnect();
  }, [show]);

  return (
    <div
      ref={outerRef}
      style={{
        overflow: 'hidden',
        height: '0px',
        opacity: show ? 1 : 0,
        transition: `height ${duration}ms ease-out, opacity ${duration}ms ease-out`,
      }}
    >
      <div ref={innerRef} className={className}>
        {children}
      </div>
    </div>
  );
}
