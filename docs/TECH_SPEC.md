# 기술 명세서 (Technical Specification)

본 문서는 프로젝트의 핵심 아키텍처, 커스텀 컴포넌트 설계, 운영 및 검증 계약을 기술한다.

## 1. 전역 아키텍처 및 렌더링 원칙

- **프레임워크:** Next.js 16.2.11 (App Router 기반), React 19
- **런타임 및 개발 환경:** 공개 배포는 OpenNext 기반 Cloudflare Worker bundle을 사용한다. 로컬 개발은 npm 스크립트를 기본으로 하며 Docker 환경도 지원한다.
- **UI/UX 미학(Aesthetics):** 심우주와 모노크롬 블루프린트 테마를 유지한다. Bloom 기반 WebGL ambient는 Home hero에서만 조건부로 로드하고, 나머지 route의 정보·폼은 정적 shell을 기본으로 한다.
- **명명 규칙 및 코드 스타일:** 명확한 시맨틱 네이밍, 하드 코딩 지양. CSS 스타일링 시 Tailwind를 기본으로 하되, 복잡한 인라인 동적 속성은 `style` 객체로 관리함.

## 2. 타이포그래피 시스템

### 폰트 사이즈 토큰 스케일

| 토큰 | CSS 변수 | 값 | 용도 |
|---|---|---|---|
| `text-pico` | `--text-pico` | 8px | 홈 ASCII 장식 |
| `text-nano` | `--text-nano` | 9px | 카운트다운 라벨, ASCII |
| `text-micro` | `--text-micro` | 10px | 배지, 홈 서브타이틀 최소값 |
| `text-caption` | `--text-caption` | 11px | LabelText·MetaText 모바일, ArtistRow 메타, DirectoryLink |
| `text-small` | `--text-small` | 12px | body 모바일, label 데스크톱, 입력 모바일 |
| `text-body` | `--text-body` | 14px | body 데스크톱, heading 모바일, 입력 데스크톱 |
| `text-heading` | `--text-heading` | 16px | PageHeader 타이틀 모바일 |
| `text-h2` | `--text-h2` | 20px | PageHeader 타이틀 데스크톱, HeadingText 모바일 |
| `text-h1` | `--text-h1` | 24px | TitleText 모바일, HeadingText 데스크톱 |
| `text-title` | `--text-title` | 30px | TitleText 데스크톱 |
| `text-hero` | `--text-hero` | 48px | 홈 TERMINAL 모바일 |
| `text-display` | `--text-display` | 96px | 홈 TERMINAL 데스크톱 |

### TerminalText 컴포넌트 → 토큰 매핑

| 컴포넌트 | 모바일 | 데스크톱(md+) |
|---|---|---|
| `TitleText` | text-h1 (24px) | text-title (30px) |
| `HeadingText` | text-h2 (20px) | text-h1 (24px) |
| `SubtitleText` | text-small (12px) | text-body (14px) |
| `BodyText` | text-small (12px) | text-body (14px) |
| `DataText` | text-small (12px) | text-body (14px) |
| `LabelText` | text-caption (11px) | text-small (12px) |
| `MetaText` | text-caption (11px) | text-small (12px) |

### FormField 컴포넌트 API (`components/ui/FormField.tsx`)

```tsx
// 폼 필드 래퍼
<FormField label="NAME:">
  <input className={`${inputClassBase} ${inputAccentClass.secondary}`} />
</FormField>

// accent 종류: secondary | tertiary | alert | warn | primary
```

---

## 3. Page Transition 및 `DecodeText` 렌더링 (Cipher Decode 시스템)

짧은 페이지 진입 전환 위에 터미널 특화형 텍스트 Cipher(난수 복호화) 애니메이션을 결합한다.

### 3.1 통합 컴포넌트 `<DecodeText>` 및 `<TerminalText>` 분석

- **위치:** `components/DecodeText.tsx`, `components/ui/TerminalText.tsx`
- **핵심 역할:** 최종 문자열을 서버 HTML과 접근성 트리에 먼저 렌더링하고, 허용된 대표 타이틀에서만 aria-hidden 시각 layer를 cipher로 갱신한다.
- **시맨틱 추상화 (`TerminalText.tsx`):**
  - `TitleText`와 명시적으로 `cipher`를 켠 heading 외의 본문·라벨·메타·데이터는 plain semantic text로 렌더링한다.
  - 제공 컴포넌트: `TitleText` (히어로), `HeadingText` (섹션 제목), `SubtitleText` (부제), `BodyText` (본문), `LabelText` (시스템 라벨), `MetaText` (메타데이터), `DataText` (실시간 데이터).
- **주요 동적 속성 및 토큰화 (`lib/animationTokens.ts`):**
  - 각 시맨틱 컴포넌트는 `animationTokens.ts`에 정의된 프리셋을 참조하여 동작함.
  - `useMotionPolicy`는 reduced-motion, save-data, document visibility를 live 구독한다. 정책이 motion을 허용하지 않으면 최종 문자열을 즉시 유지하고 timer/RAF/Canvas를 실행하지 않는다.
- **레이아웃 보존 기술 (Layout Shift 방지):**
  - 텍스트 길이가 변할 때 생기는 줄바꿈과 레이아웃 이동을 줄이기 위해 `@chenglou/pretext`의 DOM-less 텍스트 측정을 사용한다. 자기 크기 관찰로 인한 피드백 루프를 피하도록 `ResizeObserver` 대신 `window.resize`와 `requestAnimationFrame`으로 재측정한다.
  - 컨테이너에 `overflow: hidden` 및 `height`, `min-height` 트랜지션을 동시 적용하여 텍스트의 동적 줄바꿈이 박스 크기를 급격하게 확장시키는 현상을 마스킹 처리함.

### 3.2 페이지 구조 (PageLayout & Transition)

- **페이지 공통 래퍼:** `components/PageLayout.tsx` 및 `components/PageTransition.tsx`
- **동작 원리:** route wrapper는 opacity 전환 없이 scroll 위치만 복원한다. `PageLayout`의 8px item reveal은 사용자 motion 설정을 따르며 의미 텍스트를 숨기지 않는다.
- **landmark:** `PageLayout`이 유일한 `main#main-content`를 소유하고 전역 skip link의 목적지가 된다.

## 4. 개발 가이드라인

1. **신규 페이지 혹은 컴포넌트 개발 시 규칙:**
   - 정적 텍스트는 `<TerminalText>` 계열을 사용하되 plain rendering을 기본값으로 한다. `DecodeText` 직접 사용과 body/form/error/status cipher는 금지한다.
   - `framer-motion`의 `variants` 내 애니메이션을 사용할 때는 `transition.ease` 배열 타입 충돌 여부(`Type 'number[]' is not assignable to type 'Easing...'`)를 주의하고, 반드시 기본 제공 문자열 네이밍 에셋(`ease: 'easeOut'`)으로 완화하여 기재함.
2. **TypeScript 무결성 확보 규칙:**
   - hook, 브라우저 API, Framer Motion을 사용하는 컴포넌트만 client boundary로 선언한다.
   - `@react-three/fiber`는 Home ambient에만 사용한다. `/home`, motion 허용, hero viewport 진입, WebGL 지원이 모두 참일 때 dynamic chunk를 로드하며 오류 시 semantic page를 그대로 유지한다.
3. **환경 관리 가이드 (Docker):**
   - 호스트 개발은 저장소 루트의 npm 스크립트를 사용한다. Docker 전용 환경에서 패키지를 추가할 때는 실행 중인 컨테이너의 `docker compose exec web npm install <패키지>`를 사용해 anonymous `node_modules` volume과의 불일치를 피한다.

## 5. 통합 디자인 시스템 및 테마 관리

프로젝트의 시각적 일관성과 유지보수성 확보를 위해 하드코딩된 색상 및 수치를 배제하고 전역 디자인 토큰 시스템으로 전환됨.

### 5.1 Tailwind 테마 확장 (Design Tokens)

- **위치:** `tailwind.config.js`, `app/globals.css`
- **핵심 테마 변수:**
  - `terminal-primary`: 시스템 기본 텍스트 색상 (밝은 미색/화이트 계열)
  - `terminal-accent-*`: 강조색 토큰 (`primary`, `secondary`, `tertiary`, `alert`, `warn`)
  - `terminal-bg-*`: 배경색 토큰 (`panel`, `panel-border`)
  - `terminal-muted`, `terminal-subdued`: 보조 및 비활성 텍스트 테마
- **커스텀 유틸리티:**
  - `.text-shadow-glow-*`: 각 테마 강조색에 대응하는 텍스트 글로우 효과 유틸리티 제공.

### 5.2 컴포넌트 표준화 원칙

- 모든 페이지는 `<PageLayout>`을 최상위 랩퍼로 사용하며, 내부 요소는 `<motion.div variants={itemVariants}>`를 사용하여 스태거 애니메이션을 일관되게 적용함.
- 공통 UI 요소(`ReturnLink`, `PageHeader`, `TerminalPanel`, `TerminalButton`)를 적극 활용하여 인라인 스타일 및 중복 마크업을 최소화함.

## 6. 데이터 모델 및 DB 아키텍처 (Flexible JSON Schema)

Cloudflare D1의 제약 사항과 개발 생산성을 고려하여, 핵심 비즈니스 로직이 담긴 테이블(`events`, `artists`)은 고정된 컬럼 대신 유연한 JSON 구조를 채택함.

### 6.1 `events` 테이블 설계
- **`id` (PK):** 이벤트 식별자 (예: `TRM-02`)
- **`data` (JSON):** 이벤트의 모든 메타데이터를 포함하는 JSON 문자열.
  - 주요 필드: `session`, `subtitle`, `date`, `time`, `venue`, `status`, `invitationLines` (다국어 지원 객체) 등.
  - 인포 패널 필드: `description: { en: string; ko: string }` (소개글), `posterUrl: string` (R2 이미지 URL) — optional, 없으면 Gate `EventInfoPanel` 미렌더링.
  - 장점: 새로운 속성 추가 시 DDL 마이그레이션 없이 애플리케이션 레벨의 타입 업데이트만으로 대응 가능.

### 6.2 `artists` 테이블 설계
- **`id` (PK):** 아티스트 식별자 (예: `02-A`)
- **`event_id` (FK):** `events.id` 참조 (Cascade On Delete)
- **`data` (JSON):** 아티스트 정보.
  - 주요 필드: `name`, `origin`, `status`, `description` (다국어 지원 객체) 등.

### 6.3 `access_requests` 및 `transmit_logs`
- 이들은 트랜잭션 성격이 강하므로 전통적인 관계형 컬럼 구조를 유지하여 쿼리 성능과 데이터 무결성을 확보함.
- 게스트 신청은 기존 `(event_id, email)` 고유 인덱스와 D1 배치 안의 조건부 INSERT를 함께 사용해 중복 이메일·아티스트별 정원·선택적 마케팅 등록을 한 경계에서 판정한다.
- 전송 로그의 신규 입력과 공개 DTO는 디바이스 식별자를 수집하거나 노출하지 않는다. 기존 nullable 컬럼은 호환성을 위해 유지한다.
- 이벤트·아티스트 JSON은 public runtime decoder를 통과한 필드만 DTO로 반환하며 access code, guest limit과 저장 전용 필드는 노출하지 않는다.
- 게스트 코드가 설정된 아티스트의 `guestLimit`은 bounded integer 필수값이다. 누락·오염 시 무제한으로 해석하지 않고 availability 오류로 닫는다.
- Transmit POST는 16–128자의 `Idempotency-Key`를 요구하며 같은 key/payload 재시도는 기존 공개 DTO를 반환한다.

## 7. 다국어(i18n) 아키텍처

### 구조
- `lib/i18n.ts` — ko/en 번역 쌍 전체 정의. 섹션별 객체로 분리 (common, home, gate, request, lineup, status, transmit, link, dirDesc, manifesto)
- `lib/langContext.tsx` — `LangContext` + `LangProvider` + `useLang()` + `useT()`

### useT() 훅 사용 패턴
```tsx
const t = useT();            // 현재 언어의 번역 객체 반환
t.home.nextEntry             // 홈 페이지 텍스트
t.common.signalUnstable      // 공통 에러 메시지
t.dirDesc.gate               // 디렉토리 설명
```

### 신규 번역 추가 방법
1. `lib/i18n.ts` 해당 섹션에 ko/en 키-값 쌍 동시 추가
2. `Translations` 타입에 자동 반영 (타입 추론)
3. 페이지에서 `const t = useT()` 후 `t.<섹션>.<키>` 로 접근

### 언어 전환 동작
- `localStorage` 기반으로 새로고침 후에도 언어 유지
- `document.documentElement.lang` 속성 동기화

---

## 8. 서버 상태 관리 (TanStack Query)

### 설정
- `providers/query-provider.tsx` — 앱 루트(`app/layout.tsx`)에 `<QueryProvider>` 래핑
- `staleTime: 5분` — 캐시 신선도 유지, 재페칭 억제
- `gcTime: 30분` — 컴포넌트 언마운트 후 메모리 유지 (스와이프 백 복귀 시 로딩 없이 즉시 반환)
- `retry: 1` — 실패 시 1회 자동 재시도

### Query Key 팩토리 패턴
- `lib/queries/events.ts` — `eventKeys.list()` → home·lineup·gate·status가 동일 키를 참조해 캐시 공유
- `lib/queries/transmit.ts` — `transmitKeys.list(page)` → 페이지 번호별 독립 캐시

### 사용 패턴
```tsx
// 조회
const { data: events = [], isLoading, isError } = useQuery({
  queryKey: eventKeys.list(),
  queryFn: fetchEvents,
});

// 뮤테이션 + 캐시 무효화
const { mutate } = useMutation({
  mutationFn: postTransmitLog,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: transmitKeys.all }),
});
```

### 적용 대상 (API 호출 있는 페이지만)
- `app/home/page.tsx`, `app/lineup/page.tsx`, `app/gate/page.tsx`, `app/status/page.tsx`, `app/transmit/page.tsx`
- `app/link/page.tsx` — 정적 데이터이므로 미적용

---

## 9. 운영 주의사항

- **빌드 환경:** `package.json`의 build 스크립트가 `cross-env NODE_ENV=production next build`로 production 모드를 고정한다. 이 보장은 `_global-error`와 `_not-found` 프리렌더링에 필요하다.
- **Docker 패키지 설치:** `docker-compose.yml`의 `node_modules`는 anonymous volume이다. Docker 환경의 패키지 변경은 실행 중인 컨테이너에서 수행하고 이미지 재빌드 여부를 함께 판단한다.
- **공개 API 보호:** `PUBLIC_RATE_LIMITER`와 Turnstile Siteverify validator의 로컬 계약은 구현돼 있다. 실제 Cloudflare binding/secret과 client token flow가 연결되기 전에는 public-release ready로 판정하지 않는다.
- **검증 계층:** Vitest는 Node와 jsdom project를 분리한다. `scripts/http-smoke.mjs`는 route title/main/SSR text/cache/WebGL initial graph를, `scripts/verify-local-d1.mjs`는 빈 임시 D1에 9개 Wrangler migration과 FK/index를 검증한다.
- **CI와 배포:** `.github/workflows/validate.yml`은 secret 없이 install/audit/test/lint/typecheck/build/Next·Worker smoke/D1/production-env dry-run을 실행한다. Cloudflare Workers Builds가 `dev`의 `terminal-2-dev`와 `main`의 `terminal-2`를 각각 자동 배포하며, Worker code deploy와 D1 migration·secret·binding·route 변경은 분리한다.
