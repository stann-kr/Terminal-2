# 변경 이력 (Change Log)

## [2026-04-17] use-scramble innerHTML → textContent 패치 (프로덕션 렌더링 버그 수정)

### 문제
* `use-scramble` 라이브러리가 내부적으로 `nodeRef.current.innerHTML = result` 사용.
* 스크램블 문자 범위 `[48, 102]`에 ASCII `<`(60), `>`(62) 포함 → innerHTML이 이를 HTML 태그로 파싱.
* 결과: 프로덕션 빌드에서 텍스트(예: `KERNEL 2.2.0-heliopause_build`)가 이중으로 나타나거나 누락되는 DOM 오염 현상.

### 수정
* **`node_modules/use-scramble/dist/use-scramble.esm.js` L175:** `innerHTML` → `textContent`
* **`node_modules/use-scramble/dist/use-scramble.cjs.development.js` L179:** `innerHTML` → `textContent`
* **`node_modules/use-scramble/dist/use-scramble.cjs.production.min.js`:** `O.current.innerHTML=r` → `O.current.textContent=r`
* **`patches/use-scramble+2.2.15.patch`:** 위 변경을 patch-package 형식으로 저장 — `npm install` 후 자동 재적용.
* **`package.json`:** `scripts.postinstall: "patch-package"` 추가 — 의존성 재설치 시 패치 자동 적용 보장.

---

## [2026-04-17] BootSequence · SleepScreen 레이아웃 정렬 수정

### 이중 CRTWrapper 제거
* **`app/page.tsx`:**
    * `EntryController`에서 불필요하게 감싸던 `CRTWrapper` 제거.
    * `app/layout.tsx`의 전역 CRTWrapper로 통합되어 CRT 이펙트(스캔라인·비네팅)가 이중으로 렌더링되던 성능 오버헤드 해소.

### 컨테이너 폭 및 패딩 PageLayout 기준 통일
* **`components/BootSequence.tsx`:**
    * 외부 패딩 `px-4 sm:px-8 md:px-16` → `px-4 sm:px-6` (md 과도한 여백 제거).
    * 내부 컨테이너 `w-full max-w-3xl` → `w-full sm:w-[700px] md:w-[800px]` — PageLayout 컨테이너 폭과 통일.
* **`components/SleepScreen.tsx`:**
    * 외부 패딩 동일하게 `px-4 sm:px-6`으로 조정.
    * 내부 컨테이너 `w-full max-w-xl` → `w-full sm:w-[700px] md:w-[800px]` — PageLayout 컨테이너 폭과 통일.

### 결과
* 부트·슬립 화면의 콘텐츠 폭이 `/home` 등 실제 페이지들과 동일하게 중앙 정렬되어 레이아웃 일관성 확보.

---

## [2026-04-17] 모바일(iOS) 레이아웃 최적화 — 전 페이지 반응형 개선

### 정렬 불일치 수정
* **ArtistRow 모바일 정렬 (`app/lineup/ArtistRow.tsx`):**
    * `flex items-start` → `items-baseline`: 이름과 status 텍스트 기준선 정렬.
    * 좌측 span에 `min-w-0` 추가하여 flex 과도 압축 방지.
    * `LabelText`/`MetaText` 전체에 `autoHeight` 적용 — 높이 측정 컨테이너가 flex 내 좌/우 정렬 경합하던 근본 원인 해소.
* **Status 릴레이 행 정렬 (`app/status/page.tsx`):**
    * 동일 패턴 적용(`items-baseline` + `autoHeight`).
    * `SubtitleText`(12px) → `MetaText`(10px) 교체로 동일 행 내 폰트 크기 혼용 제거.
    * 우측 status span에 `whitespace-nowrap shrink-0` 추가.

### Lineup 텍스트 크기 상향
* **ArtistRow 폰트 크기 (`app/lineup/ArtistRow.tsx`):**
    * 아티스트 이름: `text-[10px]` → `text-xs`(12px), 타 페이지와 통일.
    * status/id/origin/time/dock: `text-[10px]` → `text-[11px]`(모바일), 데스크톱 기존 유지.

### HOME 타이틀-ASCII 박스 여백
* **TERMINAL 타이틀 여백 (`app/home/page.tsx`):**
    * `leading-none` 추가: font-pixie의 line-height가 만들던 과도한 불가시 여백 제거.
    * 상단 ASCII 박스 `mb-3` → `mb-1 sm:mb-3`, 하단 `mt-3` → `mt-1 sm:mt-3`.
    * `TitleText` 및 ASCII 박스 `LabelText`에 `autoHeight` 적용 — 단일 라인 요소의 불필요한 측정 컨테이너 제거.

### 추가 최적화
* **CountdownBlock 라벨 (`components/ui/CountdownBlock.tsx`):**
    * `text-xs` → `text-[9px] sm:text-xs`, `tracking-widest` → `tracking-wider sm:tracking-widest`.
    * 좁은 모바일 셀에서 "MINUTES"/"SECONDS" 라벨이 잘리던 위험 해소.
* **Gate 이벤트 헤더 (`app/gate/page.tsx`):**
    * gap `gap-4` → `gap-2 sm:gap-4`.
    * UPCOMING 배지 `text-[10px] sm:text-xs` 반응형 크기 적용.
* **SleepScreen 시계 오버플로우 (`components/SleepScreen.tsx`):**
    * 패딩 `px-8 md:px-16` → `px-4 sm:px-8 md:px-16`.
    * 시계 크기 `text-6xl md:text-8xl` → `text-5xl sm:text-6xl md:text-8xl`.
    * 320px 기기에서 "00:00:00" 시계(~293px)가 가용 너비(256px)를 초과하던 오버플로우 수정.
* **BootSequence 여백 (`components/BootSequence.tsx`):**
    * 패딩 `px-8 md:px-16` → `px-4 sm:px-8 md:px-16`.
    * em-dash 분리선이 좁은 화면에서 줄바꿈되어 깨지던 현상 개선.

---

## [2026-04-15] 코드 검증 — 보안·버그·타입 안전성·접근성·성능 개선 및 빌드 오류 수정

### 보안 (P0)
* **XSS 취약점 수정 (`components/DecodeText.tsx`):**
    * `measureRef.current.innerHTML = text` → `textContent` 3개소 교체.
    * DB 로드 아티스트 description 등 외부 문자열이 `text`로 유입될 때 HTML 삽입 공격 차단.

### 버그 수정 (P0)
* **SleepScreen 하이드레이션 불일치 수정 (`components/SleepScreen.tsx`):**
    * 모듈 레벨의 `new Date()` 호출 → `useState` + `useEffect`로 이전하여 SSR/CSR 날짜 불일치 제거.
* **SleepScreen `setTimeout` 메모리 누수 수정:**
    * `wakeTimerRef`로 타이머 ID를 보존하고, 언마운트 cleanup `useEffect`에서 `clearTimeout` 처리.

### 타입 안전성 (P1)
* **CountdownBlock `any` 타입 제거 (`components/ui/CountdownBlock.tsx`):**
    * `Record<string, any>` → `AccentStyle` 인터페이스 정의. `amber`/`cyan` 레거시 별칭을 참조 방식으로 통합, 코드 중복 제거.
* **PageHeader `accentClassMap` 타입 강화 (`components/ui/PageHeader.tsx`):**
    * `Record<string, string>` → `Record<NonNullable<PageHeaderProps['accent']>, string>` — 누락 키를 컴파일 타임에 감지 가능.

### 날짜 처리 (P2)
* **KST 타임존 오프셋 명시 (`app/home/page.tsx`, `app/gate/EventDetail.tsx`):**
    * 날짜 문자열 파싱 시 `+09:00` 오프셋 미지정으로 인한 해외 사용자 카운트다운 오류 수정 (3개소).

### 접근성 (P2)
* **ArtistRow 아코디언 키보드 접근성 (`app/lineup/ArtistRow.tsx`):**
    * `role="button"`, `aria-expanded`, `tabIndex`, `onKeyDown` (Enter/Space) 추가.

### 성능 (P2)
* **CRTWrapper 스캔라인 CSS 전환 (`components/CRTWrapper.tsx`, `app/crt.css`):**
    * framer-motion 무한 루프 JS 애니메이션 → CSS `@keyframes scanline-beam` + `will-change: transform`으로 교체, GPU 오프로드.
    * 장식용 div 5개에 `aria-hidden="true"` 추가.

### 빌드 오류 수정
* **`_global-error` / `_not-found` SSG 프리렌더링 실패 수정:**
    * **근본 원인:** `docker-compose.yml`에 `NODE_ENV=development`가 설정된 상태로 `next build` 실행 시, Next.js + React 19가 개발 빌드의 dispatcher 초기화 코드를 사용하여 특수 페이지(`_global-error`, `_not-found`) SSG prerendering 실패.
    * **수정:** `package.json`의 `build` 스크립트를 `cross-env NODE_ENV=production next build`로 변경하여 빌드 환경을 항상 production으로 강제.
    * **`global-error.tsx` 보강:** `<head>` 내 `<title>/<style>` JSX 자식 렌더 시 React 19 metadata hoisting context 경유로 인한 이차 실패 방지 — `<head dangerouslySetInnerHTML>` 방식으로 교체.
    * **`not-found.tsx` 보강:** `dynamic = 'force-dynamic'` 적용 및 외부 컴포넌트 의존성 완전 제거 (self-contained 구현).

---

## [2026-04-15] 전역 타이포그래피 시스템 구축 및 반응형 레이아웃 최적화

* **시맨틱 타이포그래피 스케일 표준화 (`components/ui/TerminalText.tsx`):**
    * `TitleText`, `HeadingText`, `SubtitleText` 등 모든 시맨틱 텍스트 컴포넌트 내부에 터미널 테마에 최적화된 기본 텍스트 크기(Typography Scale)를 내장함.
    * `xs`, `sm`, `10px` 등 파편화되어 사용되던 크기 지정을 컴포넌트 수준에서 추상화하여 프로젝트 전반의 시각적 위계(Hierarchy)와 유지보수성을 극대화함.
    * `MetaText`의 데스크톱 가독성을 위해 `md:text-xs` 스케일을 보강하고, 긴 문단용 `BodyText` 가독성 최적화.
* **`tailwind-merge` 및 `clsx` 도입을 통한 클래스 충돌 방지:**
    * `lib/utils.ts`에 `cn()` (classNames) 유틸리티 함수를 신규 구축하여 업계 표준 방식의 클래스 병합 로직 도입.
    * 컴포넌트 내장 기본 클래스와 부모로부터 전달된 오버라이드 클래스가 충돌할 때, Tailwind CSS 우선순위에 따라 지능적으로 병합되도록 `TerminalText.tsx` 전체를 리팩토링함.
* **반응형 레이아웃 버그 및 텍스트 렌더링 수정:**
    * **CSS 상속 문제 해결**: 홈 페이지 및 게이트 페이지에서 래퍼(`div`)에 적용된 스타일이 자식 시맨틱 컴포넌트에 상속되지 않던 현상을 수정. 모든 스타일 속성을 컴포넌트의 `className`으로 직접 전달하도록 구조를 개선함.
    * **카운트다운 스케일 안정화**: `CountdownBlock.tsx`의 4단계로 쪼개진 불안정한 반응형 스케일을 2~3단계로 통합하여 화면 크기 조절 시 UI 출렁임 현상 제거.
    * **데스크톱 사이즈 점프 해결**: 특정 Breakpoint에서 기본값이 살아나 텍스트가 갑자기 커지던 현상을 명시적 Override(`md:text-[11px]` 등)를 통해 차단함.
* **`SleepScreen` 리뉴얼 및 시각 효과 고도화 (`components/SleepScreen.tsx`):**
    * `BootSequence`의 세련된 터미널 미학을 슬립 모드에도 적용.
    * 실시간으로 미세하게 변동하는 동적 프로그래시브 바(`SIGNAL STRENGTH`, `DSP ENGINE LOAD`)와 `use-scramble` 기반의 텍스트 효과 도입.
    * 'RESUME SESSION' 클릭 시 시스템 모듈을 복구하는 짧은 로딩 애니메이션 시퀀스 추가.
* **시스템 명명 규칙 및 일관성 강화:**
    * **GATE.SEC 통일**: 다른 페이지(`STATUS.SYS`, `LINEUP.DAT`)와의 시각적 통일성을 위해 `GATE` 페이지 타이틀을 `GATE.SEC` (Secure)로 변경함.
    * **카운트다운 형식 통합**: 게이트 페이지의 카운트다운 섹션을 홈 페이지와 동일한 블록 레이아웃 및 컬러 시스템(`primary`)으로 통합하여 브랜드 일관성 확보.
* **페이지 헤더 최적화 (`components/ui/PageHeader.tsx`):**
    * 전체적인 "작은 텍스트" 미학에 맞춰 페이지 헤더 타이틀 크기를 축소(`text-3xl` -> `text-xl md:text-2xl`).

## [2026-04-14] CRT 스캔라인 및 텍스트 디코딩 애니메이션 최적화

* **CRT 스캔라인 이펙트 개선 (`components/CRTWrapper.tsx`):**
    * 기존 Icy Blue 색상으로 하얗게 내려오던 `Moving scanline beam`을 검은색 그림자가 지나가는 듯한 어두운 띠(`via-black/30`)로 변경.
    * `mix-blend-multiply` 속성을 추가하여 아래에 깔린 화면 요소들의 밝기를 자연스럽게 누르면서, 낡은 모니터의 묵직한 흑백 CRT 스캔 효과를 연출하도록 모노크롬 테마와 일치시킴.
* **디코딩 애니메이션 깜빡임 현상 제거 (`components/DecodeText.tsx`):**
    * `delay` 속성이 부여되었을 때 대기 시간 동안 원본 텍스트가 DOM에 미리 렌더링되어 번쩍이는(Flash) 버그 해결.
    * `isDelaying` 상태 변수를 도입하여, 지연 시간 중에는 `useScramble` 모듈에 빈 문자열(`''`)을 강제로 전달해 사전 노출을 완벽히 차단.
    * 지연 종료 후 실제 텍스트가 주입되면서 빈 문자열부터 글자가 하나씩 늘어나는 타자기(Typewriter) + 복호화 효과가 자연스럽게 동작하도록 수정.
* **아티스트 라인업 폭포수 디코딩 적용 (`app/lineup/ArtistRow.tsx`):**
    * 단일 텍스트 덩어리로 디코딩되던 아코디언 본문 렌더링을 배열 순회(`descLines.map`) 방식으로 변경.
    * 각 줄마다 미세한 `delay` 격차(`i * 30`)를 주어 여러 줄의 텍스트가 위에서부터 아래로 동시에 폭포수처럼 쏟아지며 빠르게 디코딩되도록 속도감 개선.

## [2026-04-14] ACCESS.REQUEST 초대 메시지(INVITATION_BRIEF) DB 이관 및 다국어 지원

* **데이터 모델 확장 (`lib/eventData.ts`):** `TerminalEvent` 인터페이스의 `invitationLines` 속성을 `{ en: string[], ko: string[] }` 구조의 다국어 객체로 변경. 이를 통해 이벤트별로 서로 다른 초대 메시지를 DB에서 관리할 수 있도록 개선.
* **UI 데이터 연동 고도화 (`app/gate/request/page.tsx`):**
    * 전역 언어 설정(`lang`)에 따라 `event.invitationLines.ko` 또는 `event.invitationLines.en`을 동적으로 선택하여 렌더링하도록 로직 수정.
    * DB에 데이터가 없을 경우 기존의 기본값(`DEFAULT_INVITATION_LINES`, `requestKo.invitationLines`)으로 안전하게 Fallback 처리하는 로직 유지.
* **D1 데이터베이스 마이그레이션 (`migrations/0004_event_invitation_lines.sql`):**
    * SQLite의 `json_set` 함수를 활용하여 기존 `TRM-02` 이벤트의 JSON 데이터(`data` 컬럼) 내부에 한/영 초대 메시지 객체를 주입.
    * 하드코딩된 메시지를 DB 데이터로 점진적으로 대체하기 위한 기반 마련.

## [2026-04-14] 라인업 페이지 아티스트 소개글 아코디언 기능 추가

* **데이터 모델 확장 (`lib/eventData.ts`):** `Artist` 인터페이스에 선택적 필드 `description` 추가. 기존 단일 문자열 외에 `{ en: string | string[], ko: string | string[] }` 형태의 이중 언어(Bilingual) 객체 구조를 지원하도록 설계 변경.
* **아코디언 UI 적용 (`app/lineup/ArtistRow.tsx`):**
    * 아티스트 행(Row) 클릭 이벤트를 감지하여 아코디언 형태로 열리고 닫히는 `isOpen` 상태 추가.
    * 기존 `AnimatedHeight` 컴포넌트를 활용하여 부드러운 전개 애니메이션 구현.
    * `DecodeText` 컴포넌트를 사용하여 소개글 텍스트 출력 시 터미널 타이핑 이펙트 적용.
    * 전역 언어 설정(`useLang` Context)에 따라 `description.ko` 또는 `description.en`을 동적으로 렌더링.
    * `hasDescription` 여부에 따라 Hover 스타일 및 토글 지시자(`[+]`/`[-]`) 조건부 렌더링 추가.
* **리뷰 반영 및 리팩토링:** `ArtistRow.tsx` 내의 설명 처리 로직을 타입 가드 방식으로 단순화하여 가독성 및 안전성 향상.
* **로컬 DB 시딩 스크립트 작성 (`migrations/seed_artist_description_bilingual.sql`):** 테스트를 위해 한/영 분리형 더미 데이터를 주입.

## [2026-04-13] 심우주 모노크롬 블루프린트 테마(Deep Space Monochrome Blueprint) 리팩토링 및 디자인 토큰 통합

* **전역 테마 색상 재설계 (`app/globals.css`, `tailwind.config.js`):** 기존의 다채로운 레트로 터미널 색상을 폐기하고, 포스터 미감에 맞춘 극도로 절제된 단색 쿨톤(Icy Blue: `#D6E5ED`) 기반의 시맨틱 색상 체계(`primary`, `secondary`, `tertiary`, `alert`, `warn`)로 전면 개편.
* **디자인 토큰 시스템 강화:** 
    * 하드코딩된 오버레이 색상(`bg-[#0c0c10]`)을 전역 디자인 토큰(`--color-bg-overlay`, `terminal-bg-overlay`)으로 통합하여 유지보수성 향상.
    * 레거시 색상 이름(`amber`, `green` 등)에 대한 시맨틱 매핑을 프로젝트 전반에서 일관되게 통일 (`amber`/`green` -> `primary`, `cyan` -> `secondary` 등).
* **UI/UX 일관성 및 몰입감 강화:**
    * 테마 베이스 컬러(`bg-terminal-bg-base`, `#05060A`) 통일로 화면 전환 시 이질감 해결 및 시각적 정돈감 향상.
    * `CRTWrapper.tsx` 내 이동 주사선(Scanline Beam) 색상을 시맨틱 토큰(`via-terminal-bg-base/30`)으로 교체 및 하드코딩 제거.
* **3D 파티클 및 WebGL 그래픽 동기화 (`GlobeMap.tsx`, `ParticleField.tsx`):**
    * 은하의 소용돌이, 별빛, 배경 파티클들이 모두 메인 톤(Icy Blue) 안에서 명도와 투명도 차이만 갖도록 모노크롬 렌더링 수식 재작성.
    * `ParticleField.tsx`에서 색수차 효과를 제거하고 Bloom 강도 및 Scanline 텍스처를 강화하여 건조한 공간감 극대화.

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
