# Phase 3: terminal-2 (TM-02) 통일 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 토큰 정본의 비색상 토큰 소비(색은 이벤트 스킨 유지), JetBrains Mono 라벨 글루 도입, `[ ]` 라벨 문법, SIGNAL_NET(TM-02)·HUB 링크, 부트 스킵, selection/focus 글루, reduced-motion 가드.

**Architecture:** terminal-2 팔레트는 이벤트 스킨(아이시 블루)이므로 **색상 브릿지 없음** — stann-os.css의 A(불변)·B(타입 역할)·C(모노 폰트)·E(상태색 역할) 만 소비. 라벨 레이어만 JetBrains Mono로 전환하고 타이틀/터미널 텍스트는 Orbit 유지. 설계: `stann-web/.docs/2026-06-11-stann-os-ui-unification-design.md` §2-3, §5 terminal-2.

**Tech Stack:** Next.js 16 + Tailwind 3.4 + framer-motion + use-scramble. 모든 명령 `docker compose run --rm web …`. 브랜치 `dev`. 테스트 인프라 없음 — 검증은 lint/build + 프리뷰.

**전제 조건:**
- 브랜치 확인 → `dev`
- **주의(이식 함정, Phase 1 리뷰 발견):** terminal-2의 i18n은 `useT()`(lib/langContext)가 네임스페이스 객체를 반환하는 방식 — web/lumo와 다름. SignalNet aria 바인딩은 `useT()` 컨벤션으로 재작성 (사전 구조는 `lib/i18n.ts`·`lib/i18n/` 정독 후 기존 패턴에 맞춰 키 추가, KO/EN 양쪽)
- 부트 시퀀스에는 **언어 선택 인터랙션**이 포함 — 스킵이 언어를 자동 선택해서는 안 됨

---

### Task 1: stann-os.css 복사 + 비색상 토큰 소비

**Files:**
- Create: `app/stann-os.css` (정본 복사)
- Modify: `app/globals.css` (import + 상태색 역할 매핑 주석)
- Modify: `tailwind.config.js` (tracking 토큰)

- [ ] **Step 1:** `cp /Users/stann/Dev/stann-web/src/styles/stann-os.css /Users/stann/Dev/terminal-2/app/stann-os.css` 후 diff 0 확인

- [ ] **Step 2:** `app/globals.css` **1행**(remixicon `@import`보다 앞)에 `@import "./stann-os.css";` 추가

- [ ] **Step 3:** 상태색 역할 매핑 주석 — globals.css의 `--color-accent-alert`/`--color-accent-warn` 정의 줄 주석을 다음으로 갱신 (값은 변경하지 않음 — RGB 트리플릿이 정본 hex와 동일함을 명시):

```css
    /* Status Colors — STANN OS 상태색 역할(stann-os.css E섹션)과 값 일치
       alert = --os-status-alert(#b34747 = 179 71 71) · warn = --os-status-warn(#b39847 = 179 152 71) */
```

- [ ] **Step 4:** `tailwind.config.js` theme.extend에 자간 토큰 추가:

```js
letterSpacing: {
  label: 'var(--os-tracking)', // 0.14em — STANN OS 모노 라벨 자간
},
```

- [ ] **Step 5: 검증 + 커밋**

```bash
docker compose run --rm web sh -c "npm run lint && npm run build"
git add app/stann-os.css app/globals.css tailwind.config.js
git commit -m "feat: stann-os 토큰 정본 도입 (비색상 토큰 소비 — 색은 이벤트 스킨 유지)"
```

(빌드 스크립트는 `cross-env NODE_ENV=production next build` — **절대 변경 금지**, 메모리 규칙)

---

### Task 2: JetBrains Mono 라벨 글루 도입

**Files:**
- Modify: `app/layout.tsx` (next/font/google JetBrains_Mono)
- Modify: `tailwind.config.js` (mono 스택 교체)
- Modify: `components/ui/PageHeader.tsx` (타이틀에 Orbit 핀)

- [ ] **Step 1:** `app/layout.tsx`에 next/font 추가 (기존 구조 확인 후):

```tsx
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});
```

body className에 `${jetbrainsMono.variable}` 추가 (기존 `font-orbit bg-terminal-bg-base overflow-x-hidden` 유지).

- [ ] **Step 2:** `tailwind.config.js` fontFamily 교체:

```js
fontFamily: {
  'pixie': ['ProcrastinatingPixie', 'monospace'],
  'orbit': ['Orbit', 'monospace'],
  // 모노 = 라벨/메타 글루 (STANN OS — JetBrains Mono). 타이틀은 font-orbit으로 핀
  'mono': ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
},
```

- [ ] **Step 3:** `font-mono` 사용처 오딧 — `grep -rn "font-mono" app components | wc -l` 후 **타이틀/디스플레이 성격** 사용처에 `font-orbit` 핀:
  - `components/ui/PageHeader.tsx`: HeadingText(타이틀)에 `font-orbit` 클래스 추가 (래퍼 div의 font-mono가 라벨에만 적용되도록 — 타이틀 줄은 `font-orbit` 명시)
  - 홈 ASCII 아트·카운트다운 큰 숫자 등 디스플레이 성격이 있으면 `font-orbit`(또는 기존 `font-pixie`) 핀 — 오딧 결과를 보고에 명시
  - 일반 라벨·메타·버튼·폼은 JetBrains Mono로 전환되는 것이 **의도**

- [ ] **Step 4: 검증 + 커밋**

```bash
docker compose run --rm web sh -c "npm run lint && npm run build"
git add app/layout.tsx tailwind.config.js components/ui/PageHeader.tsx
git commit -m "feat: JetBrains Mono 라벨 글루 도입 (타이틀은 Orbit 유지)"
```

(Step 3 오딧에서 다른 파일 핀 시 함께 add·보고)

---

### Task 3: PageHeader `[ ]` 라벨 문법 + 자간 토큰

**Files:**
- Modify: `components/ui/PageHeader.tsx`

- [ ] **Step 1:** path 라벨 줄을 `[ ]` 래핑 + tracking-label로:

기존:
```tsx
<div className="text-small tracking-widest mb-1 text-terminal-muted">
  <LabelText text={path} autoHeight />
</div>
```
교체:
```tsx
<div className="text-small tracking-label mb-1 text-terminal-muted">
  <LabelText text={`[ ${path.toUpperCase()} ]`} autoHeight />
</div>
```

- [ ] **Step 2: 디코드 토큰 참조 주석** — `lib/animationTokens.ts`의 decode 프리셋 블록 주석에 한 줄 추가:

```
// STANN OS 정본 --os-decode-speed(80ms/char)에 체감 근사하는 use-scramble 단위 프리셋
```

- [ ] **Step 3: 검증 + 커밋**

```bash
docker compose run --rm web sh -c "npm run lint && npm run build"
git add components/ui/PageHeader.tsx lib/animationTokens.ts
git commit -m "feat: 페이지 헤더 라벨 [ ] 문법·자간 토큰 정렬"
```

---

### Task 4: SIGNAL_NET(TM-02) + HUB 링크

**Files:**
- Create: `lib/signalNet.ts`
- Create: `components/ui/SignalNet.tsx`
- Modify: `components/PageLayout.tsx` (하단 SIGNAL_NET 라인 — 전 페이지 노출)
- Modify: `app/link/page.tsx` (LINKS에 HUB 추가)
- Modify: i18n 사전 (KO/EN — aria 라벨 + link 설명, 기존 구조에 맞춰)

- [ ] **Step 1:** `lib/signalNet.ts` — web/lumo와 동일 문법, SELF=TM-02:

```ts
/** STANN OS 표면 노드 — 3사이트 공통 문법 (설계 §4-2, §4-3) */
export interface SignalNode {
  id: 'ST-00' | 'SL-01' | 'TM-02';
  label: 'HUB' | 'ARCHIVE' | 'LIVE';
  href: string;
}

/** 이 사이트의 노드 ID */
export const SELF_NODE_ID = 'TM-02' as const;

export const SIGNAL_NET: readonly SignalNode[] = [
  { id: 'ST-00', label: 'HUB', href: 'https://stann.kr' },
  { id: 'SL-01', label: 'ARCHIVE', href: 'https://lumo.stann.kr' },
  { id: 'TM-02', label: 'LIVE', href: 'https://terminal.stann.kr' },
] as const;
```

- [ ] **Step 2:** `components/ui/SignalNet.tsx` — terminal-2 스타일 시스템(terminal-* 클래스·useT)으로 이식. **aria-label은 useT 경유** (사전 키는 Step 3에서 추가하는 키 사용):

```tsx
'use client';
import { useT } from '@/lib/langContext';
import { SIGNAL_NET, SELF_NODE_ID } from '@/lib/signalNet';

/**
 * SIGNAL_NET — 3표면 상호 링크 (STANN OS 불변 글루, 설계 §4-2).
 * 현재 표면(TM-02)은 링크 대신 액센트 마커로 표시.
 */
export default function SignalNet() {
  const t = useT();
  return (
    <nav aria-label={t.common.signalNetAria} className="font-mono text-micro tracking-label">
      <span className="text-terminal-muted">{`SYS.ID: ${SELF_NODE_ID} // SIGNAL_NET`}</span>
      <span className="ml-3 inline-flex flex-wrap items-center gap-x-3 gap-y-1">
        {SIGNAL_NET.map((node) =>
          node.id === SELF_NODE_ID ? (
            <span key={node.id} aria-current="page" className="text-terminal-accent-primary">
              ● [{node.label}] {node.id}
            </span>
          ) : (
            // 같은 OS의 표면 이동이므로 의도적으로 같은 탭 (target 미지정)
            <a
              key={node.id}
              href={node.href}
              rel="noopener noreferrer"
              className="text-terminal-subdued transition-colors hover:text-terminal-accent-primary"
            >
              [{node.label}] {node.id}
            </a>
          ),
        )}
      </span>
    </nav>
  );
}
```

(`t.common`이 없으면 사전 구조에 맞는 네임스페이스로 조정 — 구조 정독 후 결정, 보고에 명시)

- [ ] **Step 3:** i18n 사전에 KO/EN 키 추가 (기존 네임스페이스 구조·네이밍 컨벤션 준수):
  - signalNetAria: KO `"STANN OS 표면 간 이동"` / EN `"Navigate between STANN OS surfaces"`
  - link 페이지 HUB 설명: KO `"STANN OS 허브 — 오퍼레이터 본부"` / EN `"STANN OS hub — operator HQ"` (키 이름은 기존 `stannWeb` 류 컨벤션에 맞춤)

- [ ] **Step 4:** `components/PageLayout.tsx` — 콘텐츠 하단에 SIGNAL_NET 라인 추가 (구조 정독 후 마지막 자식으로, 상단 여백 `mt-12` + 헤어라인 `border-t border-terminal-bg-panel-border/40 pt-4`):

```tsx
<div className="mt-12 border-t border-terminal-bg-panel-border/40 pt-4">
  <SignalNet />
</div>
```

(부트/슬립 화면(app/page.tsx)에는 넣지 않음 — PageLayout 사용 페이지에만)

- [ ] **Step 5:** `app/link/page.tsx` LINKS 배열 **맨 앞**에 HUB 추가:

```ts
{ href: 'https://stann.kr', label: 'STANN OS Hub', description: t.link.descriptions.stannHub, accent: 'primary' as const },
```

- [ ] **Step 6: 검증 + 커밋**

```bash
docker compose run --rm web sh -c "npm run lint && npm run build"
git add lib/signalNet.ts components/ui/SignalNet.tsx components/PageLayout.tsx app/link/page.tsx lib/i18n.ts lib/i18n/
git commit -m "feat: SIGNAL_NET(TM-02)·HUB 링크 도입 — 3표면 상호 연결"
```

---

### Task 5: 부트 스킵 + 글루(selection/focus) + reduced-motion

**Files:**
- Modify: `components/BootSequence.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: 부트 스킵 (행동 계약)** — `components/BootSequence.tsx` 정독 후 구현:
  - **계약:** 키 입력(아무 키)·포인터다운 시 "현재 진행 중인 출력 애니메이션을 건너뛰고 **다음 인터랙션 포인트**로 점프"
    - 언어 선택 전 단계(powering·phase1 타이핑 중) → phase1 전체 즉시 표시 + 언어 선택 즉시 노출
    - 언어 선택은 **스킵 불가** (사용자 선택 필수 — 자동 선택 금지)
    - 언어 선택 후(phase3 타이핑 중) → phase3 전체 즉시 표시 + `done=true` (ENTER TERMINAL 버튼 노출)
  - 구현 힌트: 대기 중인 setTimeout들을 ref로 모아 clear + 상태 일괄 세팅하는 `skipToNextGate()` 함수, `window.addEventListener('keydown'|'pointerdown')` (버튼 클릭과 충돌하지 않게 done 상태에서는 리스너 제거, 언어 선택 버튼 클릭은 pointerdown 스킵과 중복되지 않도록 showLangSelect 상태에서 리스너 일시 해제)
  - 화면 하단에 스킵 힌트 라벨 추가: `[ PRESS ANY KEY TO SKIP ]` (font-mono text-micro, 언어 선택·done 상태에서는 숨김. KO/EN 분기 불필요 — 시스템 라벨은 영문 컨벤션)
  - `prefers-reduced-motion: reduce`면 부트 출력 지연 없이 즉시 다음 게이트 표시 (`window.matchMedia` 1회 체크)

- [ ] **Step 2: 글루 CSS** — `app/globals.css`에 추가 (terminal 변수는 RGB 트리플릿이므로 `rgb()` 래핑):

```css
/* 셀렉션 — 액센트 배경 (STANN OS 불변 글루) */
::selection {
  background: rgb(var(--color-accent-primary));
  color: rgb(var(--color-bg-base));
}

/* 포커스 가시화 — STANN OS 불변 글루 (canon: 2px accent, offset 2px) */
:focus-visible {
  outline: 2px solid rgb(var(--color-accent-primary));
  outline-offset: 2px;
}

/* reduced-motion 전역 가드 (STANN OS 공통 — 디코드·스캔라인·CRT 즉시 표시 폴백) */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 3: 검증** — lint/build + 프리뷰로 부트 스킵 시나리오 3종(스킵→언어선택, 언어선택 후 스킵→ENTER, reduced-motion) 확인

- [ ] **Step 4: 커밋**

```bash
git add components/BootSequence.tsx app/globals.css
git commit -m "feat: 부트 스킵·셀렉션/포커스 글루·reduced-motion 가드"
```

---

### Task 6: Phase 3 종합 검증

- [ ] **Step 1:** `docker compose run --rm web sh -c "npm run lint && npm run build"` 그린
- [ ] **Step 2:** 3파일 diff: web↔lumo↔terminal-2 `stann-os.css` 일치
- [ ] **Step 3:** 프리뷰(`-p 3100:3000`) 체크리스트: 라벨 JBM 전환·타이틀 Orbit 유지 / `[ /TERMINAL/LINK ]` 라벨 / SIGNAL_NET(TM-02 마커) 전 페이지 / link 페이지 HUB / 부트 스킵 / 셀렉션·포커스 / 모바일 375px
- [ ] **Step 4:** `.docs/CHANGE_LOG.md` 최상단 Phase 3 개조식 요약 + 커밋 `docs: Phase 3 통일 작업 변경 이력 기록`
