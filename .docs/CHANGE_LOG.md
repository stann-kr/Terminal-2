# 변경 이력 (Change Log)

## [2026-04-09] Cloudflare D1 DB 연동 및 Workers 배포 구현

* **DB 범위 확정:** Transmit(방명록), Gate(이벤트), Lineup(아티스트) 3개 섹션을 D1으로 전환 결정. About/Home/Status 텍스트는 정적 유지.
* **DB 명세 문서 작성:** `.docs/DB_DEPLOYMENT_PLAN.md` 신규 작성. 스키마 ERD, API 엔드포인트 명세, 배포 절차 포함.
* **환경변수 템플릿 생성:** `.env.example` 신규 추가 (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN).
* **패키지 설치:** `@opennextjs/cloudflare`, `wrangler` 설치 완료.
* **wrangler.toml 업데이트:** `main = ".open-next/worker.js"`, `assets`, `nodejs_compat_v2` 플래그 적용.
* **Drizzle 스키마 작성:** `lib/db/schema.ts` (events, artists, transmit_logs 3개 테이블), `lib/db/client.ts`, `drizzle.config.ts` 생성.
* **마이그레이션 생성:** `drizzle/migrations/0000_special_legion.sql` 자동 생성 완료.
* **초기 시드 SQL:** `migrations/seed.sql` 생성 (기존 eventData.ts 데이터 기반).
* **API Routes 신규 작성:** `app/api/events/route.ts`, `app/api/artists/route.ts`, `app/api/transmit/route.ts` (GET/POST).
* **클라이언트 마이그레이션:** `app/transmit/page.tsx` (localStorage 제거 → API), `app/gate/page.tsx`, `app/lineup/page.tsx`, `app/home/page.tsx` (하드코딩 제거 → API fetch).
* **CI/CD:** `.github/workflows/deploy.yml` 작성 (main 브랜치 push → Cloudflare Workers 자동 배포).
* **gitignore 업데이트:** `.open-next/` 추가.
* **미완료 (수동 작업 필요):**
  - `wrangler d1 create terminal-db` 실행 후 `wrangler.toml` database_id 입력
  - D1 마이그레이션 & 시드 실행 (`--remote`)
  - GitHub Secrets (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID) 등록

프로젝트에 적용된 주요 변경 사항을 기록함. Git 커밋 내역 외에도 의미 있는 아키텍처 변화 등을 요약함.

## [2026-04-08] 초기 프로젝트 셋팅 (AI 개발 환경 및 Docker)
* **환경 셋팅:** Apple Silicon에 최적화된 Docker 컨테이너 셋팅 (Node 20 기반) 완료.
* **DB 셋팅 준비:** Cloudflare D1 연동을 위한 Drizzle ORM 도입 계획, `wrangler.toml` 기초 설정.
* **애니메이션/레이아웃:** `@chenglou/pretext` 라이브러리를 도입하여 리플로우 없는 빠른 텍스트 애니메이션 및 페이지 전환 기반 마련.
* **문서화 구조:** 전역 지침에 따라 `.docs/` 폴더 구성 및 AI 도구(Claude Code, Antigravity Gemini) 통합 지침용 스킬 파일 추가 완료.
* **페이지 전환 시각화 (Cipher / Decode):** 각 컴포넌트에 적용되어 있던 기존의 페이드 애니메이션을 제거하고, `use-scramble` 기반의 `<DecodeText>` 인라인 컴포넌트를 설계/적용하여 텍스트 복호화(Ciper/Decode) 시각 연출 및 레이아웃 유지 구현.

## [2026-04-08] DecodeText 버그 수정 및 페이지 전환 안정화

* **DecodeText 구조 리팩토링:** `measureRef` 분리(`scrambleRef` 독립), `scrambleOnUpdate=false` 초기 애니메이션 복원, `delay` prop 구현(stagger 효과 정상화), `className` 이중 적용 제거.
* **홈/게이트 카운트다운 수정:** border·padding을 부모 div로 이동하여 이중 적용 해소, `display:flex` 숫자 중앙 정렬 복원.
* **페이지 전환 스크롤 점프 해결:** `PageTransition.tsx`에 pathname 변경 시 `window.scrollTo({ top:0, behavior:'instant' })` 추가.
* **Lineup 이중 효과 제거:** `containerVariants`에서 `opacity 0→1` fade 제거, 각 `DecodeText`의 decode 효과만 유지.
* **의존성 추가:** `use-scramble` 패키지 설치 및 Docker 이미지 리빌드 완료.

## [2026-04-09] R3F 배경 개선 (Postprocessing 및 CameraRig)
* **후처리 효과 추가 (`ParticleField.tsx`):** `@react-three/postprocessing`을 도입하여 `EffectComposer` 기반으로 Bloom, Noise, ChromaticAberration, Scanline, Vignette 효과를 일괄 적용. 디지털 노이즈 및 아날로그 터미널 질감 강화.
* **패럴랙스 인터랙션 추가 (`ParticleField.tsx`):** `CameraRig` 컴포넌트를 신규 작성하여 마우스/포인터 움직임에 따라 카메라가 자연스럽게 이동(lerp)하는 3D 패럴랙스 효과 구현.

## [2026-04-09] 폰트 최적화, ParticleField 리디자인, 전환 효과 개선

* **Google Fonts 직접 import 제거 (`crt.css`, `layout.tsx`):** `@import url(...)` 방식 제거, Next.js `Space_Mono` 폰트 최적화 적용. CSS 변수 `--font-mono`에 `var(--font-space-mono)` 참조 추가로 폰트 로딩 일관성 확보.
* **ParticleFieldDynamic 전역 배치 (`layout.tsx`):** `RootLayout`에 `ParticleFieldDynamic` 추가하여 모든 페이지에서 배경 파티클 유지.
* **ParticleField TERMINAL 글자 파티클 렌더링 (`ParticleField.tsx`):** 기존 랜덤 부유 파티클에서 "TERMINAL" 글자 윤곽선(`LineCurve3` 기반 세그먼트)을 따라 파티클이 분포하는 방식으로 전면 재작성. 외곽 박스 포함 글자별 세그먼트 정의.
* **DecodeText 측정 안정화 (`DecodeText.tsx`):** `useEffect` → `useLayoutEffect` 전환으로 첫 페인트 전 `minHeight` 확정, 플래시 방지. 초기 너비가 좁은(1ch) 컨테이너의 조상 탐색 로직 추가. 초기 측정을 RAF 없이 즉시 microtask로 처리.
* **페이지 전환 효과 개선 (`PageTransition.tsx`):** 진입 시 `opacity 0→1` fade-in(0.3s) 추가. exit를 즉시(`duration: 0`)로 처리하여 이전 페이지 잔상 제거. Suspense fallback에서 `min-h-screen` 제거.
* **ParticleFieldDynamic loading fallback 처리 (`ParticleFieldDynamic.tsx`):** `loading: () => null` 추가로 동적 import 로딩 중 빈 공간 노출 방지.

## [2026-04-09] v2.2.0-Heliopause 업데이트 및 컨텐츠 리팩토링
* **전역 빌드 버전 하향 조정:** 시스템 전반의 빌드 버전을 `4.2.0`에서 `2.2.0`으로 변경. Home, About, BootSequence, SleepScreen 등 모든 UI 반영 완료.
* **데이터 구조 및 라인업 리팩토링:** `Artist` 인터페이스의 `genre` 필드를 `dock`으로 변경. 아티스트 데이터를 도크 번호(`1`, `2`) 기반으로 재편하고 `TRACKLIST` 필드 제거.
* **컨텐츠 보안 및 필터링:** `Gate` 상세 정보에서 `DRESS_CODE`, `ENTRY_AGE` 항목 삭제. `About` 페이지 `SYSTEM_INFO`에서 `AUDIO_SPECTRUM` 항목 제거.
* **텍스트 순화 및 경로 간소화:** `Transmit` 페이지의 `Cloudflare D1` 기술 명칭을 `NODE_SYNC` 및 일반 데이터베이스 명칭으로 변경. 홈 페이지 루트 경로를 `/terminal/`로 간소화.
* **마스터 가이드 업데이트:** `.docs/private/TEXT_CONTENT.md`를 최신 리팩토링 서사 및 데이터 구조에 맞춰 전면 현행화.

## [2026-04-09] 레이아웃 버그 수정 및 UX 개선

* **`[]` 제목 위아래 배치 버그 수정 (`DirectoryLink.tsx`):** `DecodeText` 외부 `<div>`(block 요소)가 `[`와 `]` 사이에 삽입되어 위아래 배치되던 문제 해결. `[${label}]`을 text 내부로 통합하여 한 줄 렌더링.
* **Status 페이지 데스크탑 레이아웃 수정 (`status/page.tsx`):** `grid-cols-12` col-span 재분배(name 3→2, sector 4→3, status 1→3)로 ONLINE/STANDBY 텍스트 overflow 해소. status 셀을 `flex items-center gap-1` 구조로 변경하여 `●` 아이콘과 텍스트 수평 정렬.
* **모바일 가로 스크롤 방지 (`PageLayout.tsx`):** 루트 div에 `overflow-x-hidden` 추가. 좌우 패딩 `px-4 sm:px-6` 반응형 적용.
* **PageLayout 상하 패딩 균형 조정 (`PageLayout.tsx`):** 모바일 `pt-14 pb-14`, 데스크탑 `pt-20 pb-20`으로 통일.
* **홈 로고 박스 라인 모바일 대응 (`home/page.tsx`):** `╔══╗`/`╚══╝` 박스 문자를 모바일에서 `text-[8px]`로 축소 표시, `overflow-hidden` 클리핑 제거로 전체 박스 라인 노출.
* **TERMINAL 로고 letter-spacing 반응형 (`home/page.tsx`):** `tracking-[0.3em]` 고정 → `tracking-[0.15em] sm:tracking-[0.3em]`으로 모바일 overflow 방지.
* **BootSequence 진입 방식 변경 (`BootSequence.tsx`):** 부팅 완료 후 자동 진입 및 "PRESS ANY KEY" 텍스트 제거. `[ ENTER TERMINAL ]` 버튼으로 대체, 호버 글로우 효과 적용.

## [2026-04-09] DecodeText 텍스트 길이 애니메이션 도입 및 레이아웃 안정화

* **`animateTextLength` 기능 추가 (`DecodeText.tsx`):** 텍스트를 빈 문자열부터 점진적으로 채워나가는 타자기형 애니메이션 프롭 추가. `use-scramble`의 `overflow` 옵션과 연동하여 페이지 전환 시 시각적 연속성 확보.
* **레이아웃 점프(Jittering) 방지 (`DecodeText.tsx`):** 컨테이너에 `overflow: hidden` 및 `height`, `min-height` 트랜지션 동시 적용. 텍스트의 동적 줄바꿈이 부모 박스 레이아웃을 급격하게 미는 현상을 마스킹 처리하여 부드러운 확장 연출.
* **본문 가독성 개선 (`about/page.tsx`):** MANIFESTO 영역의 긴 문단에 `animateTextLength={true}`를 적용하여 텍스트가 쏟아져 나오는 듯한 연출 구현.
## [2026-04-09] 대규모 리팩토링: 전역 디자인 시스템 통합 및 하드코딩 제거 (최종 완료)

* **Tailwind RGB 디자인 토큰 도입:** 투명도 제어를 위해 `globals.css`를 RGB 공백 포맷(`R G B`)으로 전환하고 `tailwind.config.js` 연동 완료.
* **디자인 시스템 브릿지 구축:** `crt.css`가 전역 변수를 참조하도록 통일하여 보더 및 글로우 색상 이슈 원천 해결.
* **GlobeMap Three.js 최적화:** 3D 매테리얼의 하드코딩 헥사코드를 `THEME_COLORS` 상수로 통합 관리.
* **UI 전역 안정화:** `layout.tsx`, `CRTWrapper.tsx`, `PageTransition.tsx` 등 핵심 레이아웃 기저의 하드코딩된 배경 및 보더 색상을 토큰화.
* **빌드/린트 시스템 복구:** ESLint v9 다운그레이드로 Next.js 15 호환성 확보 및 `output: "export"` 제거로 빌드 안정화.
* **UI 버그 수정:** `StatusMetric.tsx` 색상 토큰 오류 수정 및 `globals.css` 내 `text-shadow-glow` 유틸리티 디자인 토큰화.

## [2026-04-09] 시맨틱 TerminalText 컴포넌트 도입 및 애니메이션 토큰화 적용

* **`TerminalText.tsx` 신규 컴포넌트 세트 도입:** `TitleText`, `HeadingText`, `SubtitleText`, `BodyText`, `LabelText`, `MetaText`, `DataText`를 통해 텍스트 렌더링 의미론적 추상화 및 유지보수성 향상.
* **`animationTokens.ts` 토큰화:** `DecodeText`의 속도, 스크램블 강도, 타자기 효과 여부 등을 시맨틱 프리셋으로 분리하여 전역에서 스타일 일관성 관리.
* **전역 `DecodeText` 사용처 리팩토링:** 각 페이지 및 컴포넌트의 하드코딩된 애니메이션 props를 제거하고 `TerminalText` 계열 컴포넌트로 전면 교체.
* **`DecodeText.tsx` 안정화 및 기능 확장:** `animateTextLength`와 `delay` 조합 시 초기 렌더링 노출 방지 로직 추가. 페이지 전환 시 텍스트 플래시 현상 해결.
* **불필요한 레거시 코드 정리:** `DecodeText` 고도화로 대체된 `lib/hooks/usePretextLayout.ts` 삭제 및 관련 참조 제거.
