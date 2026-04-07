# 트러블슈팅 이력 (Troubleshooting)

기능 개발 중 발생한 오류 및 시스템 이슈에 대한 원인(Root Cause) 및 해결 방법(Solution)을 개조식으로 기록함.

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
