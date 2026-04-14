# 프로젝트 세부 명세서 (Requirements)

이 문서는 프로젝트의 전체 기술 명세서 및 기능 요구 사항을 문서화함. 개발 시 이 문서를 최우선으로 참고하여 아키텍처 및 상태 관리를 일관성 있게 유지함.

## 1. 개요
* 프로젝트 명: Terminal 2 (가칭)
* 주요 기술 스택: Next.js 15, React 19, Tailwind CSS, Docker (Apple Silicon), Cloudflare D1, Drizzle ORM
* 디자인 시스템: Readdy AI 기반, 모던 터미널 인터페이스 / 레트로 퓨처리즘 스타일 적용

## 2. 주요 아키텍처 원칙
* **Apple Silicon 최적화 Docker 환경:** 모든 개발은 로컬이 아닌 Docker 컨테이너(Linux/arm64) 내부에서 진행됨.
* **DB 연동:** Cloudflare D1 바인딩 및 Drizzle ORM을 활용한 데이터 관리.
* **페이지 전환 아키텍처 (`pretext` 기반):** DOM Reflow를 최소화하는 멀티라인 텍스트 측정 라이브러리인 `@chenglou/pretext`를 이용하여 혁신적인 페이지(상태) 전환 인터페이스 구현.
* **UI/컴포넌트 설계:** 모든 값은 가급적 하드코딩을 피하고, 모듈화된 Tailwind CSS 클래스 혹은 설정 변수를 재활용.

## 3. 기능 요구 사항
* (추후 기능 명세 업데이트)

## 4. 데이터베이스 구조 (Schema)
* **Flexible JSON Model:** `events`, `artists` 테이블은 고정 컬럼 대신 `data` JSON 컬럼을 활용하여 데이터 속성 변경에 유연하게 대응함.
* **Core Tables:**
    * `events`: 이벤트 정보 (세션, 일정, 장소, 다국어 초대 메시지 등).
    * `artists`: 출연진 정보 (프로필, 소개글 등).
    * `access_requests`: 입장 신청 내역 (개인정보, 인스타그램 ID 등).
    * `transmit_logs`: 메시지 전송 로그 (핸들러, 메시지, 디바이스 ID 등).
