# 트러블슈팅 이력 (Troubleshooting)

기능 개발 중 발생한 오류 및 시스템 이슈에 대한 원인(Root Cause) 및 해결 방법(Solution)을 개조식으로 기록함.

---

### [2026-04-09] 텍스트 줄바꿈 시 레이아웃 점프 및 시각적 끊김(Jitter) 현상

* **발생 상황:**
  * 모바일 환경이나 창 크기가 변할 때, `pretext`로 계산된 박스가 부드럽게 확장되는 도중 내부 텍스트가 줄바꿈(wrapping)을 시도하며 부모 컨테이너의 높이를 순간적으로 밀어내어 시각적으로 화면이 튀는 현상 발생.
* **원인 분석:**
  * `DecodeText`의 컨테이너가 `min-height` 트랜지션만 가지고 있었으며, 내부 텍스트는 렌더링 즉시 전체 높이를 차지하려 함. 텍스트가 디코딩되는 과정에서 문자 폭이 미세하게 달라질 때마다 줄바꿈 시점이 변하며 레이아웃 리플로우가 발생.
* **해결 방법:**
  1. **박스 마스킹:** 컨테이너에 `overflow: hidden`과 명시적인 `height` 트랜지션을 추가하여 내부 텍스트의 불규칙한 높이 변화를 시각적으로 차단.
  2. **순차적 렌더링:** `use-scramble`의 `overflow` 옵션(`animateTextLength` 프롭)을 활성화하여 텍스트가 빈 문자열부터 한 글자씩 길어지도록 설정, 텍스트가 한꺼번에 쏟아지며 레이아웃을 치는 현상을 완화.
  3. **브라우저 최적화:** `height`와 `min-height`를 동기화하여 CSS 엔진이 예측 가능한 높이 변화를 수행하도록 유도.

---

### [2026-04-08] 페이지 레이아웃 grow 방향 역전 — 미해결 (트러블슈팅 진행 중)

* **발생 상황:**
  * 모든 페이지에서 진입 시 레이아웃이 큰 상태(뷰포트 전체 또는 그 이상)로 시작했다가, 콘텐츠가 그려지면서 실제 콘텐츠 크기에 맞게 줄어드는 방향으로 렌더링됨.
  * 이상적인 동작: 작은 상태에서 시작 → `DecodeText`의 `minHeight` 트랜지션으로 점점 커지는 grow 효과.
  * 스크롤바가 일시적으로 나타났다가 사라지는 현상 동반.

* **시도한 원인 분석 및 조치 (효과 없음):**

  1. **`min-h-screen` 중첩 제거** (적용됨, 효과 없음)
     * `PageTransition.Inner`와 `PageLayout` 두 계층에 `min-h-screen`이 중첩 → 초기 100vh 강제 점유가 원인이라 판단.
     * 두 파일에서 `min-h-screen` 제거. `CRTWrapper`의 `min-h-screen`만 유지.
     * 결과: 증상 동일.

  2. **`ParticleField` canvas 레이아웃 분리** (적용됨, 효과 없음)
     * `@react-three/fiber` `Canvas`가 `display: block; width: 1398px; height: 1060px`(뷰포트 크기)로 렌더링되는 것을 inspector에서 확인.
     * R3F Canvas가 마운트 시 컨테이너를 뷰포트 크기로 측정하여 canvas 크기를 고정, 이것이 `absolute inset-0` 컨테이너 밖으로 영향을 미치는 것이 원인이라 판단.
     * `ParticleField.tsx`의 컨테이너 div를 `absolute inset-0` → `fixed inset-0`으로 변경.
     * 결과: 증상 동일.

* **현재 상태 및 미결 사항:**
  * 레이아웃 구조:
    ```
    CRTWrapper (min-h-screen, overflow-hidden)
    └── PageTransition.Inner (w-full, no min-h-screen)
        └── motion.div (w-full)
            └── PageLayout (w-full, no min-h-screen, pt-20 pb-16)
                ├── ParticleFieldDynamic → ParticleField (fixed inset-0)
                └── children → DecodeText (minHeight: 0→계산값, transition)
    ```
  * 실제 큰 높이를 만드는 요소를 아직 특정하지 못함. 다음 세션에서 브라우저 inspector로 렌더링 중 레이아웃 트리를 추적하여 정확한 원인 요소 확인 필요.
  * 유력한 추가 후보: `BootSequence` 컴포넌트, `DirectoryLink` 네비게이션 바, `PageTransition`의 `AnimatePresence` 내부 동작 중 이전 페이지 높이 유지 여부.

---

### [2026-04-08] DecodeText 버그 다발 및 레이아웃 grow 방향 역전 이슈

* **발생 상황:**
  * `DecodeText` 전면 도입 후 `className` 이중 적용(border 2겹), flex 정렬 무효화, `scrambleOnUpdate=false` 초기 애니메이션 미실행, `delay` stagger 효과 미작동 등 다수 버그 발생.
  * 페이지 진입 시 레이아웃이 큰 상태에서 시작하여 콘텐츠에 맞게 줄어드는 방향으로 렌더링(의도와 반대).
  * 페이지 전환 시 스크롤이 이전 페이지 위치에서 점프하는 현상.
* **원인 분석:**
  * 외부 containerRef div에도 `className`이 전달되어 시각 클래스 이중 적용.
  * `scrambleOnUpdate=false` 시 `scrambleRef`가 null → `measureRef` 미분리로 pretext 측정 실패 → `minHeight` 미설정 → 레이아웃 점프.
  * `delay` prop이 선언만 되고 `useScramble`에 미전달.
  * `PageTransition.Inner`와 `PageLayout` 두 계층에 `min-h-screen` 중첩 → 초기부터 100vh 점유 → "큰 상태에서 시작" 현상.
  * `PageTransition.tsx`에 scroll reset 로직 없음 → 이전 페이지 스크롤 위치 유지.
* **해결 방법:**
  * `DecodeText.tsx` 전면 리팩토링: `measureRef` 분리(Tag에 항상 연결), `animationSettledRef`+`frozenTextRef`로 scramble 제어, `effectivePlayOnMount`+`setTimeout(replay, delay)`로 delay 구현.
  * `home/CountdownBlock.tsx`: border/padding을 부모 div로 이동, gate 구조와 통일.
  * `lineup/page.tsx`: `containerVariants`에서 `opacity 0→1` fade 제거.
  * `PageTransition.tsx`: `Inner` div에서 `min-h-screen` 제거, pathname 변경 시 `window.scrollTo({ top:0, behavior:'instant' })` 추가.
  * `PageLayout.tsx`: `min-h-screen` 제거 — CRTWrapper의 `min-h-screen`만 유지.
  * `use-scramble` 패키지 미설치 상태 → `docker compose run --rm web npm install use-scramble` 후 `docker compose build web` 이미지 리빌드.

---

### [2026-04-08] Cipher 애니메이션 전역 적용 실패 및 레이아웃 불안정 이슈
* **발생 상황 및 에러 로그:** 
  * Cipher 페이지 전환(`pretext` 등 사용)을 시도했으나 모든 페이지가 기존에 설정된 투명도 페이드인/페이드아웃 효과로 전환됨.
  * 텍스트 복호화(Ciper) 애니메이션이 일부 요소에만 적용되거나 오버레이 형태로 부자연스럽게 처리됨.
  * 글자가 바뀔 때 컨테이너 높이가 변경되면서 레이아웃 점프 현상 발생.
* **원인 분석:**
  * 각각의 페이지 컴포넌트 내부에서 `framer-motion`의 `itemVariants` 자체에 투명도(`opacity: 0 -> 1`) 및 블러(`blur`) 효과가 하드코딩되어, 상위 트랜지션 래퍼의 효과를 무시하고 렌더링 시 페이드 효과를 덮어씀.
  * DOM 텍스트 전환 애니메이션에서 문자의 길이나 높이가 달라지며 브라우저의 레이아웃 리플로우가 발생함.
* **해결 방법 (적용 명령어 및 코드 내역):**
  * 각 페이지의 `itemVariants`에서 `opacity`와 `blur` 애니메이션 효과를 제거하여 즉시 요소가 마운트되도록 변경. 상단 트랜지션 래퍼(`PageTransition.tsx`)에서는 이탈(150ms 짧은 opacity 0 전환)만 처리함.
  * `use-scramble` 라이브러리(`npm i use-scramble`)를 도입하여 각 텍스트 요소가 시각적으로 컴포넌트 단위에서 직접 복호화(decode) 되도록 구현함.
  * `@chenglou/pretext` 라이브러리를 결합한 `<DecodeText>` 통합 컴포넌트를 설계하여, 텍스트가 렌더링 되기 전 첫 프레임에 정확한 컨테이너 높이를 산출하여 레이아웃 점프 현상을 완벽히 차단함.

---

### [2026-04-08] 패키지 타입 충돌 및 Next.js 15 빌드 에러 이슈
* **발생 상황 및 에러 로그:**
  * 1) `app/lineup/page.tsx` 내 Framer Motion `ease` 배열 타입 호환에러 발생.
  * 2) `app/status/GlobeMap.tsx` 내 JSX IntrinsicElements 인식으로 인해 `<line>` 요소와 `geometry` 프로퍼티 충돌 발생.
  * 3) `use-scramble` 패키지가 Docker 컨테이너 레벨 node_modules 볼륨 캐싱으로 인해 런타임에 누락됨.
  * 4) 컴파일은 모두 통과했으나 `npm run build` 시 Next.js 앱라우터 정적 변환 엔진에서 `Error: <Html> should not be imported outside of pages/_document.` 가 보고되며 빌드 엑시트(`Code 1`).
* **원인 분석:**
  * 1,2번: React 19 최신 타입 정의(`@types/react`)가 적용되며 Framer Motion 및 Three Fiber 컴포넌트의 유연했던 타입이 엄격하게 제한됨.
  * 3번: 기존 로컬 볼륨 바인딩 시 `docker compose up` 단계에서 기존의 익명 볼륨(`/app/node_modules`)이 호스트에 그대로 매핑되어 남아있는 상태를 유지함.
  * 4번: 프로젝트 내부에서는 `Html`을 임포트하지 않았으나, `next.config.ts`의 `output: "export"` 옵션을 통해 순수 정적 에셋 스태틱 사이트 마운트(SSG)를 시도할 때 발생한 Next.js 15+ App router 폴백 처리 버그 현상임.
* **해결 방법:**
  * Framer Motion의 ease는 기본 제공되는 `'easeOut'` 문자 포맷으로 우회 타입 적용 완료함.
  * Three.js Line을 HTML DOM 태그 대신 `<primitive object={...}>` 방식으로 교체하여 DOM JSX Element 컨플릭트를 원천 봉쇄함.
  * `docker compose down -v` 로 볼륨 캐시 강제 삭제, 후 `docker compose exec web npm install`을 단독 실행해 노드 패키지를 말끔히 현행화.
  * (미결) `output: "export"` 삭제/유지 여부는 프로덕션 CI/CD 및 Cloudflare 기반 배포 환경을 확인 한 뒤 우회 예정이므로 일시 보류함.
