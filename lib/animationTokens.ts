import type { Variants } from "framer-motion";

// ─── Motion Variants ─────────────────────────────────────────────────────────
// 페이지 레이아웃 waterfall 진입 애니메이션
// (PageLayout.tsx에서 re-export되어 하위 호환 유지)

export const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const itemVariants: Variants = {
  hidden: { y: 8 },
  visible: { y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

// ─── DecodeText 프리셋 ────────────────────────────────────────────────────────
// 색상 시스템(globals.css)과 병렬하는 애니메이션 토큰.
// speed: 텍스트가 디코딩되는 속도 (높을수록 빠름)
// scramble: 스크램블 문자 수 (텍스트 길이에 반비례)
// animateTextLength: 빈 값에서 텍스트 길이가 채워지는 방식 (페이지 전환 플래시 방지)

export const decode = {
  /** 메인 히어로 제목 — TERMINAL 타이틀 등 */
  title: { speed: 0.7, scramble: 10, animateTextLength: true },
  /** 페이지/섹션 제목 — PageHeader, 이벤트명 등 */
  heading: { speed: 0.65, scramble: 8, animateTextLength: true },
  /** 부제목/설명 — 이벤트 부제, 설명 텍스트 */
  subtitle: { speed: 0.5, scramble: 8, animateTextLength: true },
  /** 본문 텍스트 — Manifesto 등 긴 문단 */
  body: { speed: 0.8, scramble: 4, animateTextLength: true },
  /** 라벨/경로/코드 — 메뉴명, 경로, 짧은 식별자 */
  label: { speed: 0.6, scramble: 4, animateTextLength: true },
  /** 메타 정보 — 날짜, ID, 하단 상태 */
  meta: { speed: 0.4, scramble: 4, animateTextLength: true },
  /** 실시간 데이터 — 카운트다운, 메트릭 수치 (매초 업데이트, 타자기 효과 제외) */
  data: { speed: 0.3, scramble: 2, scrambleOnUpdate: false as const, autoHeight: true as const },
} as const;

export type DecodePreset = keyof typeof decode;
