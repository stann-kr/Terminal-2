# 변경 이력 (Change Log)

프로젝트에 적용된 주요 변경 사항을 기록함. Git 커밋 내역 외에도 의미 있는 아키텍처 변화 등을 요약함.

## [2026-04-08] 초기 프로젝트 셋팅 (AI 개발 환경 및 Docker)
* **환경 셋팅:** Apple Silicon에 최적화된 Docker 컨테이너 셋팅 (Node 20 기반) 완료.
* **DB 셋팅 준비:** Cloudflare D1 연동을 위한 Drizzle ORM 도입 계획, `wrangler.toml` 기초 설정.
* **애니메이션/레이아웃:** `@chenglou/pretext` 라이브러리를 도입하여 리플로우 없는 빠른 텍스트 애니메이션 및 페이지 전환 기반 마련.
* **문서화 구조:** 전역 지침에 따라 `.docs/` 폴더 구성 및 AI 도구(Claude Code, Antigravity Gemini) 통합 지침용 스킬 파일 추가 완료.
