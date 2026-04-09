'use client';
import type { CSSProperties } from 'react';
import DecodeText from '@/components/DecodeText';
import { decode } from '@/lib/animationTokens';

// ─── 공통 Props ───────────────────────────────────────────────────────────────

interface TextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  /** stagger 등에 활용 — 단위: ms */
  delay?: number;
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3';
  onComplete?: () => void;
}

// ─── Semantic Text 컴포넌트 ───────────────────────────────────────────────────
// 내부적으로 DecodeText + animationTokens.decode 프리셋을 결합.
// 추후 구현체를 교체해도 소비자 코드는 무변경.

/** 메인 히어로 제목 (TERMINAL 타이틀 등) */
export function TitleText({ as = 'span', ...props }: TextProps) {
  return <DecodeText {...decode.title} as={as} {...props} />;
}

/** 페이지/섹션 제목 (PageHeader, 이벤트명 등) */
export function HeadingText({ as = 'h1', ...props }: TextProps) {
  return <DecodeText {...decode.heading} as={as} {...props} />;
}

/** 부제목/설명 (이벤트 부제, 설명 텍스트 등) */
export function SubtitleText(props: TextProps) {
  return <DecodeText {...decode.subtitle} {...props} />;
}

/** 본문 텍스트 (Manifesto 등 긴 문단) — animateTextLength 프리셋 적용 */
export function BodyText(props: TextProps) {
  return <DecodeText {...decode.body} {...props} />;
}

/** 라벨/경로/코드 (메뉴명, 경로, 짧은 식별자) */
export function LabelText(props: TextProps) {
  return <DecodeText {...decode.label} {...props} />;
}

/** 메타 정보 (날짜, ID, 하단 상태) */
export function MetaText(props: TextProps) {
  return <DecodeText {...decode.meta} {...props} />;
}

/** 실시간 데이터 (카운트다운, 메트릭 수치) — 초기 1회 스크램블 후 직접 DOM 업데이트 */
export function DataText(props: TextProps) {
  return <DecodeText {...decode.data} {...props} />;
}
