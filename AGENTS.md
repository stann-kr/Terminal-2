<!-- BEGIN:PROJECTDOCS -->
<!-- projectdocs:generated schema=2 instruction_source=central-live source_sha256=2a25b7df5bac995e03364982fdc8b7a540688ca8271949dc11e857a8fe4d2539 -->
# terminal-2 — STANN OS LIVE 작업 지침

## 프로젝트

- 목적: STANN OS의 LIVE 표면에서 이벤트 발견, 신청과 현장 신호를 제공한다.
- 포함: Next.js 이벤트 사이트 UI와 접근성
- 포함: 공개 신청·Signal·Transmit API와 Cloudflare D1
- 제외: 합의 없는 정보 구조 또는 시각 방향 전면 재설계
- 제외: 승인 없는 remote D1 migration·deploy

## 명령

- 설치: `npm ci`
- 테스트: `npm test`
- Lint/typecheck: `npm run lint && npm run typecheck`
- 빌드: `npm run postinstall && npm run build`
- 실행: `npm run dev`

명령은 저장소의 기존 package manager, task runner, scheme과 service 이름을 그대로 사용한다.

## 프로젝트별 불변식

- 이벤트 발견과 신청 usability를 terminal 분위기보다 우선한다.
- 공개 API는 content type, payload, identity와 중복 경쟁을 서버에서 검증한다.
- local dev와 Docker port는 3005를 사용하고 token·patch verifier를 유지한다.

- 보호 경로 `migrations/`는 명시적 요청 없이 수정·이동·삭제하지 않는다.
- 보호 경로 `patches/`는 명시적 요청 없이 수정·이동·삭제하지 않는다.

## Git

- local commit mode: `checkpoint`

## 완료 조건

- 요청한 동작과 직접 필요한 회귀 보호가 구현됐다.
- 관련 검증이 통과했거나 남은 차단 요소가 명확하다.
- 사용법, 지원 동작 또는 release note가 실제로 바뀐 경우에만 사용자-facing 문서를 갱신했다.
<!-- END:PROJECTDOCS -->
