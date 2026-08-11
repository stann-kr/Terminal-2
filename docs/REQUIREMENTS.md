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
* **텍스트 레이아웃 측정:** `@chenglou/pretext`로 디코딩 전 멀티라인 텍스트 치수를 계산하여 레이아웃 이동을 줄임.
* **UI/컴포넌트 설계:** 모든 값은 가급적 하드코딩을 피하고, 모듈화된 Tailwind CSS 클래스 혹은 설정 변수를 재활용.

## 3. 기능 요구 사항
* HOME: STANN OS LIVE 진입, 이벤트 카운트다운/elapsed 상태, 모듈 디렉토리 제공.
* GATE: upcoming/archive 이벤트 정보, 상세 위치/세션 정보, request 진입 제공.
* REQUEST: access code 검증, 게스트 신청, 개인정보/마케팅 동의 저장.
* LINEUP: 이벤트별 아티스트/도크/상태 표시.
* STATUS: 세션/노드/텔레메트리 상태 표시.
* TRANSMIT: 방문자 로그 작성/조회.
* SIGNAL: 이벤트 신호 수신 채널 등록.
* LINK: STANN OS HUB / ARCHIVE / LIVE 및 외부 채널 연결.

## 4. 검증 및 배포 게이트
* 최소 로컬 검증: `npm run lint`, `npm test`, `npm run typecheck`, `npm run build`, `npm run build:worker`.
* `deploy`는 Worker 배포만 수행한다. D1 migration apply는 별도 단계로 명시적으로 실행/검증해야 한다.
* 공개 POST API(`/api/gate/request`, `/api/signal`, `/api/transmit`)는 JSON content-type/payload-size guard를 유지하고, public launch 전 rate limit/Turnstile 등 abuse control을 추가해야 한다.

## 5. 데이터베이스 구조 (Schema)
* **Flexible JSON Model:** `events`, `artists` 테이블은 고정 컬럼 대신 `data` JSON 컬럼을 활용하여 데이터 속성 변경에 유연하게 대응함.
* **Core Tables:**
    * `events`: 이벤트 정보 (세션, 일정, 장소, 다국어 초대 메시지 등).
    * `artists`: 출연진 정보 (프로필, 소개글 등).
    * `access_requests`: 입장 신청 내역 (개인정보, 인스타그램 ID 등).
    * `transmit_logs`: 메시지 전송 로그. 신규 입력과 공개 응답은 핸들러·메시지·시각만 사용하며 레거시 디바이스 식별 컬럼은 공개하지 않음.
