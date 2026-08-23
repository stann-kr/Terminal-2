# 프로젝트 세부 명세서 (Requirements)

이 문서는 프로젝트의 전체 기술 명세서 및 기능 요구 사항을 문서화함. 개발 시 이 문서를 최우선으로 참고하여 아키텍처 및 상태 관리를 일관성 있게 유지함.

## 1. 개요
* 프로젝트 명: terminal-2 / STANN OS LIVE
* 표면 역할: LIVE (`TM-02`) — 공개 URL `https://terminal.stann.kr`
* 주요 기술 스택: Next.js 16 App Router, React 19, Tailwind CSS, Docker (Apple Silicon), Cloudflare OpenNext Worker, Cloudflare D1, Drizzle ORM, TanStack Query
* 디자인 시스템: STANN OS 공통 토큰 + terminal-2 이벤트 스킨, 모던 터미널 인터페이스 / 레트로 퓨처리즘 스타일 적용

## 2. 주요 아키텍처 원칙
* **Apple Silicon 최적화 Docker 환경:** Docker는 로컬/dev 또는 prod-like smoke 용도로 사용한다. 공개 배포의 정본 artifact는 `@opennextjs/cloudflare` Worker bundle이다.
* **DB 연동:** Cloudflare D1 바인딩(`DB`) 및 Drizzle ORM을 활용한 데이터 관리.
* **텍스트 렌더링:** 최종 문자열을 서버 HTML에 먼저 렌더링하고, 브라우저 레이아웃을 정본으로 유지한 채 대표 제목과 비필수 boot/sleep 화면에만 cipher를 점진적으로 적용함.
* **UI/컴포넌트 설계:** 의미 텍스트와 상태는 서버 HTML부터 읽을 수 있어야 하며, cipher/WebGL은 콘텐츠를 대체하지 않는 점진적 향상으로만 사용한다.
* **접근성:** route마다 하나의 `main`, skip link, 고유 title/h1을 제공하고 폼 label·오류·focus·reduced-motion 계약을 유지한다.

## 3. 기능 요구 사항
* HOME: STANN OS LIVE 진입, 이벤트 카운트다운/elapsed 상태, 모듈 디렉토리 제공.
* GATE: upcoming/archive 이벤트 정보, 상세 위치/세션 정보, request 진입 제공.
* REQUEST: access code 검증, 게스트 신청, 개인정보/마케팅 동의 저장.
* LINEUP: 이벤트별 아티스트/도크/상태 표시.
* STATUS: 이벤트 레지스트리 기반 세션 요약과 정적 노드 시각화 표시. 실제 telemetry 또는 realtime 상태로 표현하지 않는다.
* TRANSMIT: idempotency key 기반 방문자 로그 작성/조회.
* SIGNAL: 이벤트 신호 수신 채널 등록.
* LINK: STANN OS HUB / ARCHIVE / LIVE 및 외부 채널 연결.

## 4. 검증 및 배포 게이트
* 최소 로컬 검증: `npm ci`, `npm audit --omit=dev`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run smoke:http`, `npm run build:worker`, Worker HTTP smoke, `npm run test:d1`, production environment Wrangler dry-run.
* Cloudflare Workers Builds가 유일한 자동 배포 주체다. `dev`는 고정 development Worker, `main`은 production Worker를 대상으로 하며 GitHub Actions는 validation만 수행한다.
* Worker code deploy는 D1 migration, secret, binding, route와 분리한다. production deploy와 모든 remote D1 migration은 별도 승인·검증 대상이다.
* 공개 API는 정확한 JSON media type, streaming byte limit, runtime DTO, no-store 민감 응답과 PII-safe log 계약을 유지한다.
* rate-limit/Turnstile 검증 인터페이스는 로컬에서 테스트하지만, 실제 binding·secret과 Signal verification/unsubscribe/retention 운영이 없으면 public-release ready가 아니다.
* push, PR, production deploy, remote D1 migration과 production secret/config/data는 별도 승인 대상이다.

## 5. 데이터베이스 구조 (Schema)
* **Flexible JSON Model:** `events`, `artists` 테이블은 고정 컬럼 대신 `data` JSON 컬럼을 활용하여 데이터 속성 변경에 유연하게 대응함.
* **Core Tables:**
    * `events`: 이벤트 정보 (세션, 일정, 장소, 다국어 초대 메시지 등).
    * `artists`: 출연진 정보 (프로필, 소개글 등).
    * `access_requests`: 입장 신청 내역 (개인정보, 인스타그램 ID 등).
    * `transmit_logs`: 메시지 전송 로그. 신규 입력과 공개 응답은 핸들러·메시지·시각만 사용하며 레거시 디바이스 식별 컬럼은 공개하지 않음.
    * `signal`: 이벤트 소식 구독 채널. 현재 저장 계약만 존재하며 ownership verification·unsubscribe·retention lifecycle은 release gate다.
