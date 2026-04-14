# 기술 명세서 (Technical Specification)

본 문서는 타 에이전트(AI 어시스턴트)가 개발 컨텍스트를 즉시 인계받아 작업을 이어갈 수 있도록, 프로젝트의 핵심 아키텍처 및 커스텀 컴포넌트 설계 명세를 기술함.

## 1. 전역 아키텍처 및 렌더링 원칙

- **프레임워크:** Next.js 15 (App Router 기반), React 19
- **런타임 및 개발 환경:** Docker 호스트 컨테이너 내 구동됨 (Apple Silicon 환경의 `linux/arm64` 기반)
- **UI/UX 미학(Aesthetics):** 심우주(Deep Space) 및 모노크롬 블루프린트(Monochrome Blueprint) 테마 수립. 차갑고 건조한 단색(Icy Blue, `#D6E5ED`) 기반의 시맨틱 색상 체계를 사용하며, 색수차를 배제하고 빛 번짐(Bloom)과 주사선(Scanline) 텍스처를 활용해 몰입감을 극대화함.
- **명명 규칙 및 코드 스타일:** 명확한 시맨틱 네이밍, 하드 코딩 지양. CSS 스타일링 시 Tailwind를 기본으로 하되, 복잡한 인라인 동적 속성은 `style` 객체로 관리함.

## 2. Page Transition 및 `DecodeText` 렌더링 (Cipher Decode 시스템)

이전의 보편적 페이드인/아웃 전환 효과를 버려 완전히 터미널 특화형 텍스트 기반 Cipher(난수 복호화) 아키텍처로 통일됨.

### 2.1 통합 컴포넌트 `<DecodeText>` 및 `<TerminalText>` 분석

- **위치:** `components/DecodeText.tsx`, `components/ui/TerminalText.tsx`
- **핵심 역할:** 전달받은 단순 문자열(`text` Prop)을 초기 렌더링 시 난수 헥사코드(Hex)로 뒤섞어 보여주다가 본래 문자열 수준으로 디코딩(복호화)됨.
- **시맨틱 추상화 (`TerminalText.tsx`):**
  - `DecodeText`의 복잡한 애니메이션 props(`speed`, `scramble` 등)를 직접 다루는 대신, 사전에 정의된 시맨틱 컴포넌트를 사용하여 스타일 일관성을 유지함.
  - 제공 컴포넌트: `TitleText` (히어로), `HeadingText` (섹션 제목), `SubtitleText` (부제), `BodyText` (본문), `LabelText` (시스템 라벨), `MetaText` (메타데이터), `DataText` (실시간 데이터).
- **주요 동적 속성 및 토큰화 (`lib/animationTokens.ts`):**
  - 각 시맨틱 컴포넌트는 `animationTokens.ts`에 정의된 프리셋을 참조하여 동작함.
  - `animateTextLength`: 타자기 효과 애니메이션 활성화 여부. 빈 문자열부터 길이가 늘어나는 연출로 레이아웃 점프 방지 기능을 보강함.
  - `delay` 및 `animateTextLength` 연동: 페이지 전환 시 텍스트가 즉시 노출되어 번쩍이는(Flash) 현상을 방지하기 위해 재생 시작 전까지 빈 상태를 유지함.
- **레이아웃 보존 기술 (Layout Shift 방지):**
  - 텍스트 길이가 시시각각 변동하면 줄바꿈이 빈번히 발생하여 브라우저의 전역 레이아웃 점프가 야기됨. 이를 원천 차단하기 위해 `@chenglou/pretext` 라이브러리의 DOM-less 텍스트 사이즈 측정을 `ResizeObserver` 및 `requestAnimationFrame`과 연계해 구동함.
  - 컨테이너에 `overflow: hidden` 및 `height`, `min-height` 트랜지션을 동시 적용하여 텍스트의 동적 줄바꿈이 박스 크기를 급격하게 확장시키는 현상을 마스킹 처리함.

### 2.2 페이지 구조 (PageLayout & Transition)

- **페이지 공통 래퍼:** `components/PageLayout.tsx` 및 `components/PageTransition.tsx`
- **동작 원리:**
  - 페이지 진입(Entry) 시에는 `framer-motion`의 `opacity` 전환 애니메이션을 주지 않음 (모든 진입은 `<DecodeText>`의 각 컴포넌트 스태거링 동작이 독점).
  - 페이지 퇴장(Exit) 시에만 짧은 마이크로 애니메이션(`150ms opacity: 0`)을 통해 화면의 잔상을 즉시 차단함.

## 3. 타 에이전트를 위한 개발 가이드라인

1. **신규 페이지 혹은 컴포넌트 개발 시 규칙:**
   - 정적으로 고정되는 텍스트(예: 헤더, 라벨, 탭 이름, 로그 등)는 반드시 `<TerminalText>` 계열 컴포넌트(`TitleText`, `HeadingText` 등)로 감싸서 렌더링할 것. `DecodeText`를 직접 사용하는 것은 지양함.
   - `framer-motion`의 `variants` 내 애니메이션을 사용할 때는 `transition.ease` 배열 타입 충돌 여부(`Type 'number[]' is not assignable to type 'Easing...'`)를 주의하고, 반드시 기본 제공 문자열 네이밍 에셋(`ease: 'easeOut'`)으로 완화하여 기재함.
2. **Typescript 무결성 확보 규칙:**
   - 렌더링 컴포넌트는 `use client` 디렉티브 선언을 엄수함.
   - 3D 표현을 다루는 `@react-three/fiber` 환경에서 `THREE.Line` 등 WebGL 객체를 넣을 때 DOM 태그(`<line>`)와 충돌하는 것을 막기 위하여 항상 `<primitive object={}>`로 캐스팅하여 주입함.
3. **환경 관리 가이드 (Docker):**
   - 로컬 시스템 명령어 제안을 일절 배제함. 모듈 패키지는 `docker compose exec web npm install <패키지>`로 호스트-컨테이너 간 `node_modules` 변이를 제어할 것.

## 4. 통합 디자인 시스템 및 테마 관리

프로젝트의 시각적 일관성과 유지보수성 확보를 위해 하드코딩된 색상 및 수치를 배제하고 전역 디자인 토큰 시스템으로 전환됨.

### 4.1 Tailwind 테마 확장 (Design Tokens)

- **위치:** `tailwind.config.js`, `app/globals.css`
- **핵심 테마 변수:**
  - `terminal-primary`: 시스템 기본 텍스트 색상 (밝은 미색/화이트 계열)
  - `terminal-accent-*`: 강조색 토큰 (`amber`, `cyan`, `hot`, `gold`)
  - `terminal-bg-*`: 배경색 토큰 (`panel`, `panel-border`)
  - `terminal-muted`, `terminal-subdued`: 보조 및 비활성 텍스트 테마
- **커스텀 유틸리티:**
  - `.text-shadow-glow-*`: 각 테마 강조색에 대응하는 텍스트 글로우 효과 유틸리티 제공.

### 4.2 컴포넌트 표준화 원칙

- 모든 페이지는 `<PageLayout>`을 최상위 랩퍼로 사용하며, 내부 요소는 `<motion.div variants={itemVariants}>`를 사용하여 스태거 애니메이션을 일관되게 적용함.
- 공통 UI 요소(`ReturnLink`, `PageHeader`, `TerminalPanel`, `TerminalButton`)를 적극 활용하여 인라인 스타일 및 중복 마크업을 최소화함.

## 5. 알려진 미해결 과제

- **Next.js 15 빌드 경고:** `NODE_ENV` 관련 비표준 값 경고 및 `output: "export"` 환경에서의 정적 생성 경로 이슈.
- **TypeScript 타입 무결성:** `framer-motion` 및 `@react-three/fiber` 환경에서의 전역 타입 선언 미흡으로 인한 `JSX.IntrinsicElements` 에러. (런타임 영향은 없으나 빌드 시 CI 환경 검증 필요)
- **모듈 해석 이슈:** Docker 환경의 anonymous volume 특성에 따른 `node_modules` 동기화 지연. 신규 패키지 추가 시 `docker compose exec web npm install` 실행 필수.
