# 버그 수정 계획 — DecodeText 효과 미적용 및 레이아웃 불안정

작성일: 2026-04-08

---

## 배경

`DecodeText` 컴포넌트 전면 도입 이후 아래 증상 관찰:
- 일부 페이지 효과가 적용되지 않거나 이중 적용됨
- 카운트다운 숫자 박스의 border/padding 이중 렌더링
- 숫자 flex 중앙 정렬 무효화
- 페이지 진입 시 레이아웃 점프 (height 0 → 급변)
- `delay` prop 전달해도 스태거 효과 없음 (모두 동시 시작)
- `/lineup` 페이지 진입 시 fade-in + decode 이중 효과

핵심 원인: `components/DecodeText.tsx`의 외부 wrapper div와 내부 Tag 간 역할 경계 부재.

---

## 발견된 버그

### 버그 1 — className 이중 적용

**위치:** `components/DecodeText.tsx`

외부 containerRef div와 내부 Tag 모두에 `className` 전달됨.
`border`, `py-3 sm:py-4` 등 시각 클래스가 이중 적용됨.

```tsx
// 수정 전
<div className={`relative transition-all duration-500 ease-out ${className}`}>
  <Tag className={className} ...>
```

**영향:** `app/home/CountdownBlock.tsx` — border 2겹, padding 2겹

---

### 버그 2 — display style 충돌 (flex 정렬 무효화)

**위치:** `components/DecodeText.tsx`

외부 div에 `display: "block"` 강제 고정 → `style` prop으로 넘긴 `display: 'flex'`가
내부 Tag에만 적용되고 외부 div는 block 유지 → CountdownBlock 숫자 중앙 정렬 안됨.

**영향:** `app/home/CountdownBlock.tsx`, `app/gate/CountdownBlock.tsx`

---

### 버그 3 — scrambleOnUpdate=false 시 pretext 측정 실패 (레이아웃 점프)

**위치:** `components/DecodeText.tsx:62-78`

```tsx
// 수정 전
const textNode = scrambleRef.current as any;
if (!container || !textNode) return;  // scrambleOnUpdate=false → ref=null → 조기 return
```

`scrambleOnUpdate=false`일 때 Tag ref가 null → `getComputedStyle` 불가 → `minHeight` 미설정
→ 페이지 진입 시 레이아웃 점프.

**영향:** `app/home/CountdownBlock.tsx`, `app/gate/CountdownBlock.tsx`

---

### 버그 4 — delay prop 미구현

**위치:** `components/DecodeText.tsx:35` (선언만 있고 `useScramble`에 미전달)

스태거 효과를 기대하는 모든 컴포넌트에서 `delay` 무시됨.

**영향 파일:**
- `app/about/page.tsx` — `delay={i * 50}`, `delay={i * 30}`
- `app/gate/EventDetail.tsx` — `delay={i * 30}`
- `app/status/page.tsx` — `delay={i * 20}`
- `app/transmit/page.tsx` — `delay={i * 40}`

---

### 버그 5 — lineup/page.tsx opacity 애니메이션 미제거

**위치:** `app/lineup/page.tsx:11-13`

```tsx
// 수정 전
const containerVariants = {
  hidden: { opacity: 0 },  // 다른 모든 페이지는 {}
  visible: { opacity: 1, ... },
};
```

페이지 진입 시 전체 fade-in + 각 DecodeText decode 이중 효과 발생.

---

### 버그 6 — home/CountdownBlock 구조 불일치

**위치:** `app/home/CountdownBlock.tsx:43-54`

`DecodeText`에 `border`, `py-3 sm:py-4`를 직접 전달하는 구조.
`app/gate/CountdownBlock.tsx`는 부모 div에 border/padding 적용하는 올바른 구조.

---

## 수정 내용

### components/DecodeText.tsx — 전면 리팩토링

**핵심 변경:**

1. **외부 containerRef div** — minHeight 관리 전용. className 제거, display 강제 제거
2. **내부 Tag** — 모든 시각 className + style 담당
3. **measureRef 신설** — Tag에 항상 연결. scrambleRef와 독립적으로 폰트 측정
4. **delay prop 구현** — `effectivePlayOnMount = delay > 0 ? false : playOnMount` + `setTimeout(replay, delay)`
5. **setTagRef callback ref** — measureRef와 scrambleRef 동시 연결

```tsx
// 수정 후 렌더 구조
<div ref={containerRef} style={{ minWidth: "1ch" }}>   {/* className 없음, display 없음 */}
  <Tag
    ref={setTagRef as any}      // measureRef + scrambleRef 동시
    className={className}        // Tag에만
    style={{ whiteSpace: "pre-wrap", display: "block", ...style }}
  >
    {!scrambleOnUpdate ? text : null}
  </Tag>
</div>
```

### app/lineup/page.tsx

```tsx
// 수정 후
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
```

### app/home/CountdownBlock.tsx

border/padding을 부모 div로 이동하여 `gate/CountdownBlock`과 구조 통일:

```tsx
// 수정 후
<div
  key={b.label}
  className="text-center border py-3 sm:py-4"
  style={{ borderColor: 'rgba(212,146,10,0.25)', background: 'rgba(0,0,0,0.5)' }}
>
  <DecodeText
    text={b.val}
    scrambleOnUpdate={false}
    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"
    style={{ color: '#d4920a', ..., display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  />
```

---

## 수정 파일 목록

| 파일 | 변경 유형 |
|------|-----------|
| `components/DecodeText.tsx` | 리팩토링 (버그 1/2/3/4) |
| `app/lineup/page.tsx` | 2줄 수정 (버그 5) |
| `app/home/CountdownBlock.tsx` | 구조 수정 (버그 6) |

---

## 검증 방법 ([[Docker]] 환경)

```bash
# 빌드 에러 확인
docker compose run --rm web npm run build

# 개발 서버 시작
docker compose up
```

**시각 검증 체크리스트:**

- [ ] `/home` — 카운트다운 숫자 박스: border 1겹, 숫자 수직/수평 중앙 정렬
- [ ] `/gate` — 카운트다운 숫자 박스: 초기 렌더부터 minHeight 설정, 레이아웃 점프 없음
- [ ] `/about` — MANIFESTO 각 줄이 50ms 간격으로 순차 decode 시작
- [ ] `/status` — RELAY_TELEMETRY 각 행이 20ms 간격으로 순차 decode 시작
- [ ] `/lineup` — 페이지 진입 시 fade-in 없이 즉시 표시, 각 텍스트만 decode
- [ ] `/transmit` — 시그널 로그 5개 항목이 40ms 간격으로 decode 시작
