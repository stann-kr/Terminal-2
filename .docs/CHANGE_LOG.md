# 변경 이력 (Change Log)

## [2026-04-14] 라인업 페이지 아티스트 소개글 아코디언 기능 추가

* **데이터 모델 확장 (`lib/eventData.ts`):** `Artist` 인터페이스에 선택적 필드 `description` 추가. 기존 단일 문자열 외에 `{ en: string | string[], ko: string | string[] }` 형태의 이중 언어(Bilingual) 객체 구조를 지원하도록 설계 변경.
* **아코디언 UI 적용 (`app/lineup/ArtistRow.tsx`):**
    * 아티스트 행(Row) 클릭 이벤트를 감지하여 아코디언 형태로 열리고 닫히는 `isOpen` 상태 추가.
    * 기존 `AnimatedHeight` 컴포넌트를 활용하여 부드러운 전개 애니메이션 구현.
    * `DecodeText` 컴포넌트를 사용하여 소개글 텍스트 출력 시 터미널 타이핑 이펙트 적용.
    * 전역 언어 설정(`useLang` Context)에 따라 `description.ko` 또는 `description.en`을 동적으로 렌더링. (단일 문자열 데이터와도 하위 호환 유지)
    * `hasDescription` 여부에 따라 Hover 스타일(cursor-pointer 및 배경색) 및 토글 지시자(`[+]`/`[-]`) 조건부 렌더링을 추가하여 시각적 인지성(Discoverability) 강화.
* **로컬 DB 시딩 스크립트 작성 (`migrations/seed_artist_description_bilingual.sql`):** 테스트를 위해 로컬 D1 데이터베이스의 아티스트 테이블에 한/영 분리형 더미 데이터를 주입.

## [2026-04-13] 심우주 모노크롬 블루프린트 테마(Deep Space Monochrome Blueprint) 리팩토링

* **전역 테마 색상 재설계 (`app/globals.css`, `tailwind.config.js`):** 기존의 다채로운 레트로 터미널 색상(amber, cyan, hot, gold, purple)을 폐기하고, 포스터 미감에 맞춘 극도로 절제된 단색 쿨톤(Icy Blue: `#D6E5ED`) 기반의 시맨틱 색상 체계(`primary`, `secondary`, `tertiary`, `alert`, `warn`)로 전면 개편함.
* **UI/UX 일관성 및 몰입감 강화:**
    * 전체 화면을 덮는 강제 `bg-black` 오버레이를 제거하고, 테마 베이스 컬러인 딥 네이비 블랙(`bg-terminal-bg-base`, `#05060A`)으로 통일하여 화면 전환 시의 색상 이질감을 해결함.
    * 투명도 오버레이를 `bg-black/40`에서 약간 푸른빛이 도는 `bg-[#0c0c10]/40` 계열로 미세 조정하여 자연스러운 그림자와 톤 앤 매너를 유지함.
    * 메인 네비게이션(홈 메뉴, 외부 링크) 항목들의 강조 색상을 모두 `primary`로 통일하여 시각적 정돈감을 높임.
* **3D 파티클 및 WebGL 그래픽 동기화 (`GlobeMap.tsx`, `ParticleField.tsx`):**
    * 하드코딩된 무작위 RGB 혼합 로직을 수정하여, 은하의 소용돌이(Galaxy Disk)와 별빛(Starfield), 배경 파티클들이 모두 메인 톤(Icy Blue) 안에서 명도와 투명도 차이만 갖도록 모노크롬 렌더링 수식을 재작성함.
    * `ParticleField.tsx`에서 이질감을 주던 색수차(`ChromaticAberration`) 후처리 효과를 제거하고, 대신 `Bloom` 강도 증가 및 `Scanline` 텍스처를 강화하여 색상 번짐 없이 몽환적이고 건조한 공간감을 극대화함.

## [2026-04-13] 전송 로그 페이지네이션 UX 개선

* **로딩 상태 분리 (`isInitialLoad`, `isFetching`):** 최초 화면 진입 시의 전체 로딩 상태와 페이지 이동 시의 데이터 패칭 상태를 분리하여 UX를 개선함.
* **Framer Motion `popLayout` 모드 적용:** `AnimatePresence`의 모드를 `wait`에서 `popLayout`으로 변경하여, 페이지 전환 시 이전 콘텐츠가 즉시 레이아웃에서 빠지고 새 콘텐츠가 자리를 차지하도록 수정함. 이를 통해 `AnimatedHeight` 컴포넌트가 높이 0을 거치지 않고 자연스럽게 다음 높이로 트랜지션되도록 구현함.
* **페이지 이동 시 시각적 피드백 강화:** 데이터를 불러오는 동안 기존 로그 목록의 `opacity`를 0.5로 조절하여 로딩 중임을 나타내고, 데이터 패칭 및 메시지 전송 중(`isSubmitting`)에 페이지네이션 버튼을 비활성화하여 중복 요청 및 레이스 컨디션을 방지함.
* **애니메이션 타이밍 최적화:** 로그 리스트 진입/이탈 애니메이션의 `duration` 및 `opacity` 트랜지션을 조정하여 더 부드러운 전환 효과를 제공함.

## [2026-04-13] 전송 버튼 중복 클릭 방지 및 컴포넌트화

* **SubmitButton 컴포넌트 신규 생성 (`components/SubmitButton.tsx`):** 전송 중 상태(`isSubmitting`)를 Prop으로 받아 버튼 비활성화 및 로딩 텍스트(`▸ 전송 중...`) 표시를 자동 처리하는 전용 제출 버튼 구현.
* **중복 제출 방지 로직 적용:**
    * `app/transmit/page.tsx`: `isSubmitting` 상태 추가 및 `handleSubmit` 함수 내 실행 가드 로직 구현.
    * `app/gate/request/page.tsx`: 기존 `submitting` 상태를 활용하여 `handleSubmit` 최상단에 중복 실행 방지 가드 추가.
* **TerminalButton UI 개선:** 버튼 비활성화(`disabled`) 시 `cursor-not-allowed` 스타일을 추가하여 시각적 피드백 강화.
* **i18n 번역 추가:** `lib/i18n.ts` 내 `transmitKo` 객체에 `submitting` ("▸ 전송 중...") 필드 추가.

## [2026-04-13] 모바일 환경 버튼 레이아웃 안정화

* **TerminalButton UI 수정 (`TerminalButton.tsx`):** `LabelText` 호출 시 `autoHeight={true}` 속성 적용.
* **성능 및 UX 개선:** 버튼 내부의 불필요한 높이 측정 래퍼를 제거하여 모바일 환경에서 텍스트 디코딩 시 발생하는 버튼 높이 튕김(Jitter) 현상 해결. 브라우저 기본 레이아웃 엔진이 버튼 패딩에 맞춰 높이를 직접 제어하도록 최적화.

## [2026-04-11] KO/EN 언어 선택 기능

### 추가
- `lib/lang.ts`: localStorage 기반 언어 설정 유틸
- `lib/langContext.tsx`: Lang React Context + `useLang()` 훅
- `lib/i18n.ts`: 홈 DIRS 설명 및 About 매니페스토 KO 번역
- `components/ui/LangToggle.tsx`: `[ KO ] / [ EN ]` 브래킷 토글 컴포넌트

### 변경
- `components/BootSequence.tsx`: 3단계 부팅 (Phase1 로그+프로그레스 바 → 언어 선택 프롬프트 → Phase3 로그)
- `app/layout.tsx`: LangProvider 전역 래핑 추가
- `app/home/page.tsx`: 푸터 STATUS:ACTIVE → LangToggle, DIRS 설명 번역 분기
- `app/about/page.tsx`: MANIFESTO KO/EN 분기

### 번역 범위
- 번역 대상: 홈 디렉토리 설명 6개, About 매니페스토 본문
- 영어 유지: 서브타이틀, 시스템 로그, 터미널 명령어 스타일 텍스트

---

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
