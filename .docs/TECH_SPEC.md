# 기술 명세서 (Technical Specification)

본 문서는 타 에이전트(AI 어시스턴트)가 개발 컨텍스트를 즉시 인계받아 작업을 이어갈 수 있도록, 프로젝트의 핵심 아키텍처 및 커스텀 컴포넌트 설계 명세를 기술함.

## 1. 전역 아키텍처 및 렌더링 원칙

- **프레임워크:** Next.js 15 (App Router 기반), React 19
- **런타임 및 개발 환경:** Docker 호스트 컨테이너 내 구동됨 (Apple Silicon 환경의 `linux/arm64` 기반)
- **UI/UX 미학(Aesthetics):** 레트로 퓨처리즘 및 터미널 미학 수립 (CSS 폰트, `textShadow`, `blur` 효과 등을 적극 도입하여 동적인 인터페이스 구현)
- **명명 규칙 및 코드 스타일:** 명확한 시맨틱 네이밍, 하드 코딩 지양. CSS 스타일링 시 Tailwind를 기본으로 하되, 복잡한 인라인 동적 속성은 `style` 객체로 관리함.

## 2. Page Transition 및 `DecodeText` 렌더링 (Cipher Decode 시스템)

이전의 보편적 페이드인/아웃 전환 효과를 버려 완전히 터미널 특화형 텍스트 기반 Cipher(난수 복호화) 아키텍처로 통일됨.

### 2.1 통합 컴포넌트 `<DecodeText>` 분석

- **위치:** `components/DecodeText.tsx`
- **핵심 역할:** 전달받은 단순 문자열(`text` Prop)을 초기 렌더링 시 난수 헥사코드(Hex)로 뒤섞어 보여주다가 본래 문자열 수준으로 디코딩(복호화)됨.
- **주요 동적 속성:**
  - `speed` / `scramble`: 복호화 속도 및 무작위성 깊이 조절 (통상 `speed=0.5~0.8`, `scramble=5~10` 권장)
  - `scrambleOnUpdate`: `true`일 경우 텍스트 업데이트 시 매번 효과가 발생함. 카운트다운과 같이 빈번한 업데이트 시 `false`로 설정하여 초기 렌더링 시에만 효과를 주고 이후에는 일반 텍스트로 유지 가능.
- **레이아웃 보존 기술 (Layout Shift 방지):**
  - 텍스트 길이가 시시각각 변동하면 줄바꿈이 빈번히 발생하여 브라우저의 전역 레이아웃 점프가 야기됨. 이를 원천 차단하기 위해 `@chenglou/pretext` 라이브러리의 DOM-less 텍스트 사이즈 측정을 `ResizeObserver` 및 `requestAnimationFrame`과 연계해 구동함.
  - 마운트 직후 `window.getComputedStyle`로 실제 적용되는 폰트 메트릭스를 자동 추론해 컨테이너 높이(`minHeight`)를 사전에 확보함.
  - `animateTextLength`: 타자기 효과 애니메이션 활성화 여부. 빈 문자열부터 길이가 늘어나는 연출로 레이아웃 점프 방지 기능을 보강함.
  - 레이아웃 안정화: 컨테이너에 `overflow: hidden` 및 `height`, `min-height` 트랜지션을 동시 적용하여 텍스트의 동적 줄바꿈이 박스 크기를 급격하게 확장시키는 현상을 마스킹 처리함.

### 2.2 페이지 구조 (PageLayout & Transition)

- **페이지 공통 래퍼:** `components/PageLayout.tsx` 및 `components/PageTransition.tsx`
- **동작 원리:**
  - 페이지 진입(Entry) 시에는 `framer-motion`의 `opacity` 전환 애니메이션을 주지 않음 (모든 진입은 `<DecodeText>`의 각 컴포넌트 스태거링 동작이 독점).
  - 페이지 퇴장(Exit) 시에만 짧은 마이크로 애니메이션(`150ms opacity: 0`)을 통해 화면의 잔상을 즉시 차단함.

## 3. 타 에이전트를 위한 개발 가이드라인

1. **신규 페이지 혹은 컴포넌트 개발 시 규칙:**
   - 정적으로 고정되는 텍스트(예: 헤더, 라벨, 탭 이름, 로그 등)는 반드시 `<DecodeText text="문자열" />` 형태로 감싸서 렌더링할 것.
   - `framer-motion`의 `variants` 내 애니메이션을 사용할 때는 `transition.ease` 배열 타입 충돌 여부(`Type 'number[]' is not assignable to type 'Easing...'`)를 주의하고, 반드시 기본 제공 문자열 네이밍 에셋(`ease: 'easeOut'`)으로 완화하여 기재함.
2. **Typescript 무결성 확보 규칙:**
   - 렌더링 컴포넌트는 `use client` 디렉티브 선언을 엄수함.
   - 3D 표현을 다루는 `@react-three/fiber` 환경에서 `THREE.Line` 등 WebGL 객체를 넣을 때 DOM 태그(`<line>`)와 충돌하는 것을 막기 위하여 항상 `<primitive object={}>`로 캐스팅하여 주입함.
3. **환경 관리 가이드 (Docker):**
   - 로컬 시스템 명령어 제안을 일절 배제함. 모듈 패키지는 `docker compose exec web npm install <패키지>`로 호스트-컨테이너 간 `node_modules` 변이를 제어할 것.

## 4. 알려진 미해결 과제

- `next.config.ts`의 `output: "export"` 설정에 의한 Next.js 15 App router의 404 정적 생성 빌드 경로 충돌 오류(`Error: <Html> should not be imported outside of pages/_document.`)가 존재. 로컬 개발 서버 및 배포 시 실제 런타임과 관련이 없으나, 프로덕션 CI/CD 및 Cloudflare Pages 연동 환경에서는 주시 요망.
