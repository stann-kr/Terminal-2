-- invited_by nullable로 재추가 (코드 기반 자동 완성, 선택 입력)
ALTER TABLE access_requests ADD COLUMN invited_by TEXT;
