# 변경 이력 (Change Change Log)

## [2026-04-14] 라인업 페이지 아티스트 소개글 아코디언 기능 추가

* **데이터 모델 확장 (`lib/eventData.ts`):** `Artist` 인터페이스에 선택적 필드 `description` 추가. 기존 단일 문자열 외에 `{ en: string | string[], ko: string | string[] }` 형태의 이중 언어(Bilingual) 객체 구조를 지원하도록 설계 변경.
* **아코디언 UI 적용 (`app/lineup/ArtistRow.tsx`):**
    * 아티스트 행(Row) 클릭 이벤트를 감지하여 아코디언 형태로 열리고 닫히는 `isOpen` 상태 추가.
    * 기존 `AnimatedHeight` 컴포넌트를 활용하여 부드러운 전개 애니메이션 구현.
    * `DecodeText` 컴포넌트를 사용하여 소개글 텍스트 출력 시 터미널 타이핑 이펙트 적용.
    * 전역 언어 설정(`useLang` Context)에 따라 `description.ko` 또는 `description.en`을 동적으로 렌더링. (단일 문자열 데이터와도 하위 호환 유지)
    * `hasDescription` 여부에 따라 Hover 스타일(cursor-pointer 및 배경색) 및 토글 지시자(`[+]`/`[-]`) 조건부 렌더링을 추가하여 시각적 인지성(Discoverability) 강화.
* **로컬 DB 시딩 스크립트 작성 (`migrations/seed_artist_description_bilingual.sql`):** 테스트를 위해 로컬 D1 데이터베이스의 아티스트 테이블에 한/영 분리형 더미 데이터를 주입.

## [2026-04-13] 심우주 모노크롬 블루프린트 테마(Deep Space Monochrome Blueprint) 리팩토링 및 디자인 토큰 통합

* **전역 테마 색상 재설계 (`app/globals.css`, `tailwind.config.js`):** 기존의 다채로운 레트로 터미널 색상을 폐기하고, 포스터 미감에 맞춘 단색 쿨톤(Icy Blue: `#D6E5ED`) 기반의 시맨틱 색상 체계(`primary`, `secondary`, `tertiary`, `alert`, `warn`)로 개편.
* **디자인 토큰 시스템 강화:** 
    * 하드코딩된 오버레이 색상(`bg-[#0c0c10]`)을 전역 디자인 토큰(`--color-bg-overlay`, `terminal-bg-overlay`)으로 통합하여 유지보수성 향상.
    * 레거시 색상 이름(`amber`, `green` 등)에 대한 시맨틱 매핑을 프로젝트 전반에서 일관되게 통일 (`amber`/`green` -> `primary` 등).
* **UI/UX 일관성 및 몰입감 강화:**
    * 테마 베이스 컬러(`bg-terminal-bg-base`, `#05060A`) 통일로 화면 전환 시 이질감 해결 및 시각적 정돈감 향상.
    * `CRTWrapper.tsx` 내 이동 주사선(Scanline Beam) 색상을 시맨틱 토큰(`via-terminal-bg-base/30`)으로 교체.
* **3D 파티클 및 WebGL 그래픽 동기화:** 3D 파티클 및 별빛 렌더링 수식을 메인 톤(Icy Blue) 기반 모노크롬으로 재작성하고 후처리 효과(Bloom, Scanline) 최적화.

## [2026-04-13] 전송 로그 페이지네이션 UX 개선

* **로딩 상태 분리 (`isInitialLoad`, `isFetching`):** 최초 화면 진입 시의 전체 로딩 상태와 페이지 이동 시의 데이터 패칭 상태를 분리하여 UX를 개선함.
* **Framer Motion `popLayout` 모드 적용:** `AnimatePresence`의 모드를 `wait`에서 `popLayout`으로 변경하여 자연스러운 레이아웃 트랜지션 구현.

... (이하 생략) ...
