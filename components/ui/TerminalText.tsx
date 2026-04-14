"use client";
import type { CSSProperties } from "react";
import DecodeText from "@/components/DecodeText";
import { decode } from "@/lib/animationTokens";

// ─── 공통 Props ───────────────────────────────────────────────────────────────

interface TextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  /** stagger 등에 활용 — 단위: ms */
  delay?: number;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3";
  onComplete?: () => void;
  /** height 측정 컨테이너 없이 직접 렌더 (고정 레이아웃 컨텍스트용) */
  autoHeight?: boolean;
}

// ─── Semantic Text 컴포넌트 ───────────────────────────────────────────────────
// 내부적으로 DecodeText + animationTokens.decode 프리셋을 결합.
// 추후 구현체를 교체해도 소비자 코드는 무변경.

/** 메인 히어로 제목 (TERMINAL 타이틀 등) */
export function TitleText({
  as = "span",
  className = "",
  ...props
}: TextProps) {
  return (
    <DecodeText
      {...decode.title}
      as={as}
      className={`text-2xl md:text-3xl ${className}`}
      {...props}
    />
  );
}

/** 페이지/섹션 제목 (PageHeader, 이벤트명 등) */
export function HeadingText({
  as = "h1",
  className = "",
  ...props
}: TextProps) {
  return (
    <DecodeText
      {...decode.heading}
      as={as}
      className={`text-sm md:text-base ${className}`}
      {...props}
    />
  );
}

/** 부제목/설명 (이벤트 부제, 설명 텍스트 등) */
export function SubtitleText({ className = "", ...props }: TextProps) {
  return (
    <DecodeText
      {...decode.subtitle}
      className={`text-xs md:text-sm ${className}`}
      {...props}
    />
  );
}

/** 본문 텍스트 (Manifesto 등 긴 문단) — animateTextLength 프리셋 적용 */
export function BodyText({ className = "", ...props }: TextProps) {
  return (
    <DecodeText
      {...decode.body}
      className={`text-xs md:text-sm leading-relaxed ${className}`}
      {...props}
    />
  );
}

/** 라벨/경로/코드 (메뉴명, 경로, 짧은 식별자) */
export function LabelText({ className = "", ...props }: TextProps) {
  return (
    <DecodeText
      {...decode.label}
      className={`text-[10px] md:text-xs ${className}`}
      {...props}
    />
  );
}

/** 메타 정보 (날짜, ID, 하단 상태) */
export function MetaText({ className = "", ...props }: TextProps) {
  return (
    <DecodeText
      {...decode.meta}
      className={`text-[10px] md:text-xs ${className}`}
      {...props}
    />
  );
}

/** 실시간 데이터 (카운트다운, 메트릭 수치) — 초기 1회 스크램블 후 직접 DOM 업데이트 */
export function DataText({ className = "", ...props }: TextProps) {
  return (
    <DecodeText
      {...decode.data}
      className={`text-xs md:text-sm ${className}`}
      {...props}
    />
  );
}
