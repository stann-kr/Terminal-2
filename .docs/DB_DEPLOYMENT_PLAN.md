# DB 연결 및 Cloudflare Workers 배포 명세

## 1. 개요

본 문서는 TERMINAL 프로젝트의 Cloudflare D1 데이터베이스 연동 및 Cloudflare Workers 배포 아키텍처를 명세함.  
에이전트 간 협업 시 이 문서를 컨텍스트 기준점으로 사용할 것.

---

## 2. DB 범위 판단

| 섹션 | 현황 | DB 연동 | 근거 |
|------|------|---------|------|
| **Transmit (방명록)** | localStorage | ✅ 필수 | 기기·브라우저 간 공유 필요, 영구 보존 필요 |
| **Gate (이벤트 정보)** | `lib/eventData.ts` 하드코딩 | ✅ 권장 | 코드 배포 없이 이벤트 추가·상태 변경 필요 |
| **Lineup (아티스트)** | `lib/eventData.ts` 하드코딩 | ✅ 권장 | 라인업 순차 해금(`AWAITING DECRYPTION` → `CONFIRMED`) 관리 |
| About 텍스트 | 컴포넌트 내 상수 | ❌ 정적 유지 | 변경 빈도 극히 낮음 |
| Home 메뉴 | 컴포넌트 내 상수 | ❌ 정적 유지 | 고정 구조 |
| Status 릴레이 정보 | 컴포넌트 내 상수 | ❌ 정적 유지 | 가상 시스템 정보, 실시간화 재검토 시 변경 |
| 방문 여부 플래그 | localStorage | ❌ 세션 유지 | 경량 플래그, 서버 리소스 절약 |

---

## 3. 기술 스택

| 항목 | 선택 | 비고 |
|------|------|------|
| 배포 플랫폼 | Cloudflare Workers | `@opennextjs/cloudflare` 사용 |
| 데이터베이스 | Cloudflare D1 | SQLite 호환, 엣지 실행 |
| ORM | Drizzle ORM | `drizzle-orm`, `drizzle-kit` 이미 설치 |
| CI/CD | GitHub Actions → `wrangler deploy` | `main` 브랜치 push 시 자동 배포 |
| 로컬 개발 | Docker + `wrangler dev` | D1 로컬 에뮬레이션 포함 |

---

## 4. DB 스키마 (ERD)

```
events
├── id    TEXT  PK   예) "TRM-02"
└── data  TEXT  JSON 예) { "status": "UPCOMING", "date": "2026-05-08", "session": "TERMINAL [02]", ... }
     └── 자유 필드: status, date, session, subtitle, venue, district, coords, capacity, sound, ...
         마이그레이션 없이 언제든 추가/삭제 가능

artists
├── id        TEXT  PK
├── event_id  TEXT  FK → events.id (CASCADE DELETE)
└── data      TEXT  JSON 예) { "name": "STANN LUMO", "origin": "KR", "dock": "1", "time": "TBA", "status": "CONFIRMED" }
     └── 자유 필드: name, origin, dock, time, status, ...

transmit_logs (고정 스키마 유지)
├── id          TEXT  PK           타임스탬프 기반 고유 ID
├── handle      TEXT  NOT NULL     최대 24자, 대문자 변환
├── message     TEXT  NOT NULL     최대 280자
├── ts          TEXT  NOT NULL     예) "2026.04.09 / 14:40"
└── created_at  TEXT  NOT NULL     ISO 8601 형식
```

---

## 5. 파일 구조 (신규 생성 파일)

```
terminal-2/
├── env.d.ts                          # Cloudflare Workers 환경 타입 선언
├── drizzle.config.ts                 # Drizzle Kit 설정 (D1 방언)
├── .env.example                      # 환경변수 템플릿
├── drizzle/
│   ├── migrations/                   # drizzle-kit 자동 생성 마이그레이션 파일
│   └── seed.sql                      # 초기 데이터 (eventData.ts 기반 INSERT)
├── lib/db/
│   ├── schema.ts                     # Drizzle 스키마 정의
│   └── client.ts                     # D1 DB 클라이언트 팩토리 함수
└── app/api/
    ├── events/
    │   └── route.ts                  # GET /api/events
    ├── artists/
    │   └── route.ts                  # GET /api/artists?eventId=
    └── transmit/
        └── route.ts                  # GET, POST /api/transmit
```

---

## 6. API 엔드포인트 명세

### `GET /api/events`

전체 이벤트 목록 반환 (artists 포함).

**쿼리 파라미터**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | string (선택) | `UPCOMING` \| `ARCHIVED` \| `LIVE` — 없으면 전체 반환 |

**응답 예시**

```json
[
  {
    "id": "TRM-02",
    "session": "TERMINAL [02]",
    "subtitle": "Heliopause Outskirts",
    "date": "2026-05-08",
    "time": "23:00 KST",
    "venue": "FAUST SEOUL",
    "district": "YONGSAN-GU // ITAEWON",
    "coords": "37.5335° N, 126.9958° E",
    "capacity": "CAPACITY: CLASSIFIED",
    "sound": "KIRSCH AUDIO SYSTEM",
    "status": "UPCOMING",
    "artists": [
      { "id": "02-A", "name": "STANN LUMO", "origin": "KR", "dock": "1", "time": "TBA", "status": "CONFIRMED" }
    ]
  }
]
```

---

### `GET /api/artists?eventId={id}`

특정 이벤트의 아티스트 목록 반환.

**응답 예시**

```json
[
  { "id": "02-A", "name": "STANN LUMO", "origin": "KR", "dock": "1", "time": "TBA", "status": "CONFIRMED" },
  { "id": "02-B", "name": "[ ENCRYPTED ]", "origin": "--", "dock": "1", "time": "TBA", "status": "AWAITING DECRYPTION" }
]
```

---

### `GET /api/transmit`

방명록 목록 반환 (최신순 50개).

**응답 예시**

```json
[
  { "id": "1744200000000", "handle": "SYS_ADMIN", "message": "External data received.", "ts": "2026.04.09 / 14:40" }
]
```

---

### `POST /api/transmit`

방명록 새 항목 추가.

**요청 본문**

```json
{ "handle": "VISITOR_01", "message": "Hello, Terminal." }
```

**검증 규칙**
- `handle`: 필수, 1–24자, 공백 → 언더스코어 변환, 대문자 저장
- `message`: 필수, 1–280자

**응답 (성공 201)**

```json
{ "id": "1744200000001", "handle": "VISITOR_01", "message": "Hello, Terminal.", "ts": "2026.04.09 / 15:00" }
```

**응답 (에러 400)**

```json
{ "error": "HANDLE_REQUIRED" }
```

---

## 7. 배포 절차

### 7-1. 최초 D1 DB 생성

```bash
docker compose run --rm web npx wrangler d1 create terminal-db
```

→ 출력된 `database_id`를 `wrangler.toml`에 입력.

### 7-2. 마이그레이션 적용

```bash
# 스키마 → 마이그레이션 파일 생성
docker compose run --rm web npx drizzle-kit generate

# 로컬 에뮬레이터 적용
docker compose run --rm web npx wrangler d1 migrations apply terminal-db --local

# 프로덕션 적용
docker compose run --rm web npx wrangler d1 migrations apply terminal-db --remote
```

### 7-3. 초기 데이터 시드

```bash
# 로컬
docker compose run --rm web npx wrangler d1 execute terminal-db --local --file=migrations/seed.sql

# 프로덕션
docker compose run --rm web npx wrangler d1 execute terminal-db --remote --file=migrations/seed.sql
```

### 7-4. 로컬 Workers 에뮬레이션

```bash
docker compose run --rm web npm run build:worker
docker compose run --rm web npm run cf:preview
```

→ `http://localhost:8787`에서 확인.

### 7-5. 수동 배포

```bash
docker compose run --rm web npm run build:worker
docker compose run --rm web npm run deploy
```

### 7-6. CI/CD (GitHub Actions)

`main` 브랜치에 push 시 자동 실행됨.  
GitHub Repository Secrets에 다음 값 사전 등록 필요:

| Secret 이름 | 설명 | 발급 위치 |
|-------------|------|-----------|
| `CLOUDFLARE_API_TOKEN` | Workers 배포 권한 토큰 | Cloudflare 대시보드 → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID | Cloudflare 대시보드 → 우측 하단 |

---

## 8. 클라이언트 마이그레이션 요약

| 파일 | 변경 내용 |
|------|-----------|
| `app/transmit/page.tsx` | localStorage 제거 → `GET/POST /api/transmit` |
| `app/gate/page.tsx` | `import { EVENTS }` 제거 → `GET /api/events` |
| `app/lineup/page.tsx` | `import { EVENTS }` 제거 → `GET /api/events` |
| `app/home/page.tsx` | `EVENT_DATE` 하드코딩 → `GET /api/events?status=UPCOMING` |
| `lib/eventData.ts` | 모든 마이그레이션 완료 후 제거 |

---

## 9. 환경변수 목록

| 변수명 | 설정 위치 | 용도 |
|--------|-----------|------|
| `CLOUDFLARE_ACCOUNT_ID` | `.env.local`, GitHub Secrets | Wrangler 인증 |
| `CLOUDFLARE_API_TOKEN` | `.env.local`, GitHub Secrets | Wrangler 배포 |
| `DB` (binding) | `wrangler.toml` | D1 데이터베이스 바인딩 |
