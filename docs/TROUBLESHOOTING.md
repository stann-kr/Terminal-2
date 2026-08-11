# 트러블슈팅

재발 가능성이 있는 이슈의 증상-원인-해결 레시피를 정리한다. 항목 제목의 날짜는 최초 확인 시점이며, 최신순으로 정렬한다.

## 2026-06-13 — Next.js 16에서 `next lint` 제거 후 lint 게이트 중단

### 증상

* `npm run lint` 실행 시 `Invalid project directory provided, no such directory: /app/lint` 오류.
* lint가 동작하지 않아 `build`와 독립된 정적 분석 게이트를 실행할 수 없음.

### 원인

* Next.js 16에서 `next lint` 서브커맨드 **완전 제거**됨 → `"lint": "next lint"`가 `lint`를 디렉토리 인자로 오인.
* 직접 `eslint .` 실행 시 기존 `eslint.config.mjs`의 `FlatCompat` 래핑(`compat.extends("next/...")`)이 ESLint 9에서 `Converting circular structure to JSON` 에러 → 레거시 호환 레이어가 ESLint 9 비호환.

### 해결

1. **모던 flat config 마이그레이션:** `eslint.config.mjs`에서 `eslint-config-next`의 v16 flat export를 직접 사용하고 `FlatCompat` 래핑을 제거.
2. **lint 스크립트 교체:** `"lint": "next lint"` → `"lint": "eslint ."`.
3. **프로젝트 예외 최소화:** 실시간 시각 효과와 충돌하는 `react-hooks/purity`·`set-state-in-effect`·`immutability`만 warning으로 낮추고 나머지 오류는 계속 차단.

### 검증

* `npm run lint`가 `next lint` 경로 오류 없이 ESLint를 실행하고 정상 종료하는지 확인한다.

## 2026-04-17 — DecodeText 특정 텍스트 깜빡임 / 이중 렌더링 착시

### 증상

* `/about` 페이지 SYSINFO 항목("FAUST / SEOUL-KR", "2.2.0-HELIOPAUSE")과 `/home` 푸터("KERNEL 2.2.0-heliopause_build") 텍스트가 화면에 2번 나타나거나 계속 깜빡이는 현상.
* 다른 텍스트는 정상. `use-scramble` `innerHTML` → `textContent` 패치 후에도 지속.

### 원인

* **DOM 중복 아님:** `document.body.innerText.match(/SEOUL-KR/g)?.length === 1` 로 DOM 레벨 중복은 없음.
* **ResizeObserver 피드백 루프:**
    1. `DecodeText`의 `useLayoutEffect`가 `containerRef`(자기 자신)를 `ResizeObserver`로 관찰.
    2. `use-scramble`이 매 프레임 `textContent` 작성 → flex item의 content width 증가.
    3. `ResizeObserver` 발화 → `measureAndLayout` 재실행 → `textNode.style.maxWidth` 재설정.
    4. DevTools에서 `max-width` 속성이 초당 수십 회 설정/해제 반복 확인(진단 결정적 단서).
    5. 텍스트가 픽셀 단위로 좌우 진동 → 잔상이 눈에 "두 개"처럼 보임.
* **초기 시도 실패 원인:**
    * `containerRef` 대신 부모 요소 관찰: 부모가 content-sized inline/flex item인 경우 동일 문제 재현.
    * `width: 100%` 추가: flex item에서 예상치 않은 레이아웃 불안정 유발.
    * 폭 변화 임계값(0.5px) 가드: `inlineSize`가 1px 단위로 진동하는 경우 여전히 루프.

### 해결

* **`components/DecodeText.tsx`:** `ResizeObserver` 완전 제거 → `window` `'resize'` 이벤트 리스너로 교체.
    * 뷰포트 크기 변경 시에만 재측정 — use-scramble 타이핑 중 피드백 루프 원천 차단.
    * `maxWidth` / `height` / `minHeight` DOM 쓰기에 값 변경 가드 추가.
* 핵심 원칙: **컴포넌트가 자기 자신의 크기 변화를 관찰하면 안 됨**. 측정 결과로 발생한 레이아웃 변화가 다시 측정을 트리거하는 순환 구조가 됨.

### 검증

* 디코딩 중 대상 문자열이 DOM에 한 번만 존재하고 `max-width`가 프레임마다 반복 갱신되지 않는지 확인한다.
* 창 크기를 바꾼 뒤에는 텍스트 치수가 다시 계산되는지 확인한다.

## 2026-04-17 — use-scramble node_modules 패치가 Docker 컨테이너에 반영되지 않는 현상

### 증상

* 설치 환경에 따라 `use-scramble`의 텍스트 출력 방식이 달라져 신뢰할 수 없는 문자열을 HTML로 해석할 위험이 있었음.

### 원인

* 이미지 빌드 단계의 직접 파일 치환에 의존해 일반 `npm install`과 Docker 설치 결과가 일치하지 않았음.

### 해결

1. `patch-package`로 배포 파일의 `innerHTML` 쓰기를 `textContent`로 변경하는 추적 패치를 적용한다.
2. 설치 후 검증 스크립트가 개발·프로덕션 배포 파일 모두에서 패치 적용 여부를 확인한다.
3. Docker도 동일한 postinstall 경로를 사용하도록 `npm ci`로 의존성을 설치한다.

### 검증

* `npm run postinstall`이 패치 적용과 검증을 모두 통과하는지 확인한다.
* 새 Docker 이미지에서도 동일한 설치 명령이 통과하는지 확인한다.

## 2026-04-15 — `_global-error` / `_not-found` SSG 프리렌더링 실패 (React dispatcher null)

### 증상

* `npm run build` 시 `_global-error`, `_not-found` 특수 페이지에서 다음 오류 발생:
    * `_global-error`: `TypeError: Cannot read properties of null (reading 'useContext')` (digest: `3333581645`)
    * `_not-found`: `TypeError: Cannot read properties of null (reading 'useState')` (Turbopack SSR bundle 내부)
* `dynamic = 'force-dynamic'` 설정 및 외부 컴포넌트 제거 후에도 실패.

### 원인

* **근본 원인:** `docker-compose.yml`에 `NODE_ENV=development`가 컨테이너 환경 변수로 설정된 상태로 `next build` 실행.
* Next.js가 이미 설정된 `NODE_ENV`를 재정의하지 못하고 경고(`non-standard NODE_ENV`)만 출력.
* React 개발 빌드는 SSG 프리렌더링 시 dispatcher 초기화 코드 경로가 production과 달라 — 특수 페이지(`_global-error`, `_not-found`)의 SSG 진입 시 `ReactCurrentDispatcher.current`가 null인 상태로 렌더 실행 → hook 호출 시 TypeError.
* `_global-error`: Next.js 내부의 metadata/router context 설정 과정에서 `useContext` 호출 → dispatcher null로 실패.
* `_not-found`: 루트 레이아웃이 함께 렌더되며 `LangProvider`의 `useState` 호출 → dispatcher null로 실패.

### 해결

1. **`package.json` build 스크립트 수정 (영구 고정):**
    * `"build": "next build"` → `"build": "cross-env NODE_ENV=production next build"`
    * 컨테이너 환경 변수 설정과 무관하게 빌드 시 항상 production 환경 강제.
2. **`global-error.tsx` 보강:**
    * React 19는 `<style>{children}</style>` JSX 패턴을 metadata hoisting context를 통해 처리 → `useContext` 호출 경로 추가.
    * `<head>` 내 `<title>`, `<style>`을 `<head dangerouslySetInnerHTML={{ __html: headHtml }}>` 방식으로 교체하여 React 19 metadata 처리 경로 우회.
3. **`not-found.tsx` 보강:**
    * `export const dynamic = 'force-dynamic'` 적용 + 모든 외부 컴포넌트 의존성 제거 (self-contained).

### 검증

* 외부 환경의 `NODE_ENV` 값과 관계없이 `npm run build`가 production 모드로 실행되는지 확인한다.
* 빌드 중 `_global-error`와 `_not-found` 프리렌더링 오류가 다시 발생하지 않는지 확인한다.

## 2026-04-13 — 전송 로그 페이지네이션 시 레이아웃 스래싱(높이 0 축소) 현상

### 증상

* `app/transmit/page.tsx`에서 페이지 번호를 클릭하여 다음 로그 목록을 불러올 때, 전체 로그 컨테이너의 높이가 순간적으로 0(또는 매우 작은 값)으로 줄어들었다가 새 데이터가 로드되면 다시 늘어나는 현상 발생. 특히 모바일 기기에서 화면 전체가 요동쳐 UX 저해.

### 원인

* **애니메이션 모드 충돌:** `AnimatePresence`의 `mode="wait"` 속성으로 인해 이전 페이지의 로그 목록이 완전히 사라진(DOM에서 제거된) 후에야 새 로딩 상태나 콘텐츠가 렌더링됨. 이 간극 동안 컨테이너 내부 콘텐츠가 비어있게 되어 `AnimatedHeight`의 `ResizeObserver`가 높이를 0으로 측정함.
* **로딩 상태 단일화:** `loading` 상태 하나로 '초기 진입'과 '페이지 이동'을 모두 처리하여, 페이지 이동 시에도 기존 데이터를 지우고 "SYNCHRONIZING..." 문구로 교체해버림으로써 레이아웃 크기가 급격히 변함.

### 해결

1. **로딩 상태 세분화:** `isInitialLoad`와 `isFetching`으로 상태를 분리. 페이지 이동 시(`isFetching`)에는 기존 로그 목록을 유지하되 `opacity`만 조절하여 시각적 피드백 제공.
2. **`popLayout` 모드 도입:** `AnimatePresence`를 `mode="popLayout"`으로 설정. 이전 콘텐츠가 나갈 때 `position: absolute`로 처리되어 레이아웃 흐름에서 즉시 빠지고, 새 콘텐츠가 동시에 자리를 차지하게 함으로써 `AnimatedHeight`가 0을 거치지 않고 [이전 높이] -> [새 높이]로 즉시 트랜지션하도록 수정.
3. **비활성화 가드:** 데이터 패칭 중에는 페이지네이션 버튼을 `disabled` 처리하여 불필요한 레이아웃 변화 및 중복 요청 차단.

### 검증

* 이전·다음 페이지를 연속 전환해도 로그 컨테이너 높이가 0으로 축소되지 않는지 확인한다.
* 데이터 패칭 중 페이지네이션 버튼이 비활성화되고 기존 목록이 유지되는지 확인한다.

## 2026-04-13 — 모바일 환경 버튼 텍스트 디코딩 시 높이 튕김(Jitter) 현상

### 증상

  * 모바일 기기 또는 좁은 화면 너비에서 버튼(`TerminalButton`) 렌더링 시, 텍스트 디코딩 애니메이션과 함께 버튼의 전체 높이가 순간적으로 변하거나 0.25초 동안 서서히 커지는 현상 발생.

### 원인

  * **불필요한 측정 컨테이너 개입:** `TerminalButton` 내부에 사용된 `LabelText`(`DecodeText`) 컴포넌트는 기본적으로 텍스트 크기 측정을 위한 전용 래퍼(`div`)를 생성하고 `min-height` 트랜지션을 적용함.
  * **레이아웃 충돌:** 버튼 자체는 이미 고정된 패딩(`px-5 py-2.5`)과 `flex` 속성을 통해 크기가 결정되어 있으나, 내부의 자동 측정 래퍼가 초기 높이를 `0px`에서 계산된 값으로 0.25초 동안 확장하며 레이아웃 엔진에 중첩된 높이 변화를 강제함.

### 해결

  1. **컨테이너 비활성화:** `TerminalButton.tsx`에서 `LabelText` 호출 시 `autoHeight={true}` 속성 명시.
  2. **레이아웃 주도권 이관:** `DecodeText`의 자체 높이 측정 로직을 건너뛰고, 브라우저 레이아웃 엔진이 버튼의 패딩과 텍스트 내용을 바탕으로 높이를 직접 결정하도록 수정하여 시각적 튕김 현상을 근본적으로 차단.

### 검증

  * 좁은 화면에서 버튼을 반복 렌더링해도 디코딩 전후의 계산된 높이가 유지되는지 확인한다.
  * `autoHeight` 분기에서 측정용 래퍼가 생성되지 않는지 확인한다.

## 2026-04-09 — 디자인 시스템 리팩토링 후 보더 색상 백화 현상

### 증상

  * 전역 디자인 토큰 리팩토링 후 semantic accent가 적용되어야 할 보더가 흰색 또는 투명으로 표시되는 시각적 퇴행 발생.

### 원인

  * CSS 변수를 헥사코드(`#RRGGBB`)에서 Tailwind Opacity 지원용 RGB 포맷(`R G B`)으로 변경했으나, 기존 스타일 코드에서 `rgb(var(--color))` 래퍼 없이 `var(--color)`를 직접 색상 값으로 사용하면서 무효한 CSS가 생성됨.

### 해결

  1. **래핑 보정:** `CRTWrapper.tsx` 및 `crt.css` 등 CSS 변수를 직접 참조하는 곳을 모두 `rgb(var(--color))` 또는 `rgb(var(--color) / alpha)` 포맷으로 수정.
  2. **브릿지 최적화:** `crt.css`가 `globals.css`의 변수를 참조하도록 구조를 일원화하여 중복 정의 및 매핑 오류 차단.

### 검증

  * semantic accent border의 계산된 색상이 유효한 `rgb(...)` 값인지 확인한다.
  * 투명도 변형이 필요한 보더는 `rgb(var(--color) / alpha)` 형식으로 렌더링되는지 확인한다.

## 2026-04-09 — 텍스트 줄바꿈 시 레이아웃 점프 및 시각적 끊김(Jitter) 현상

### 증상

  * 모바일 환경이나 창 크기가 변할 때, `pretext`로 계산된 박스가 부드럽게 확장되는 도중 내부 텍스트가 줄바꿈(wrapping)을 시도하며 부모 컨테이너의 높이를 순간적으로 밀어내어 시각적으로 화면이 튀는 현상 발생.

### 원인

  * `DecodeText`의 컨테이너가 `min-height` 트랜지션만 가지고 있었으며, 내부 텍스트는 렌더링 즉시 전체 높이를 차지하려 함. 텍스트가 디코딩되는 과정에서 문자 폭이 미세하게 달라질 때마다 줄바꿈 시점이 변하며 레이아웃 리플로우가 발생.

### 해결

  1. **박스 마스킹:** 컨테이너에 `overflow: hidden`과 명시적인 `height` 트랜지션을 추가하여 내부 텍스트의 불규칙한 높이 변화를 시각적으로 차단.
  2. **순차적 렌더링:** `use-scramble`의 `overflow` 옵션(`animateTextLength` 프롭)을 활성화하여 텍스트가 빈 문자열부터 한 글자씩 길어지도록 설정, 텍스트가 한꺼번에 쏟아지며 레이아웃을 치는 현상을 완화.
  3. **브라우저 최적화:** `height`와 `min-height`를 동기화하여 CSS 엔진이 예측 가능한 높이 변화를 수행하도록 유도.

### 검증

  * 좁은 화면과 창 크기 변경 상황에서 텍스트 줄바꿈 중 부모 레이아웃이 순간적으로 확장되지 않는지 확인한다.
  * `animateTextLength`가 적용된 본문이 측정된 높이 안에서 순차 렌더링되는지 확인한다.
