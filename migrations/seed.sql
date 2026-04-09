-- =====================================================
-- TERMINAL DB 초기 데이터 시드 (유연한 JSON 스키마)
-- =====================================================

-- 이벤트 데이터
INSERT INTO events (id, data) VALUES
  ('TRM-02', '{"status":"UPCOMING","date":"2026-05-08","session":"TERMINAL [02]","subtitle":"Heliopause Outskirts","time":"23:00 KST","venue":"FAUST SEOUL","district":"YONGSAN-GU // ITAEWON","coords":"37.5335° N, 126.9958° E","capacity":"CAPACITY: CLASSIFIED","sound":"KIRSCH AUDIO SYSTEM"}'),
  ('TRM-01', '{"status":"ARCHIVED","date":"2025-03-07","session":"TERMINAL [01]","subtitle":"Departure Notice","time":"23:00 KST","venue":"FAUST SEOUL","district":"YONGSAN-GU // ITAEWON","coords":"37.5335° N, 126.9958° E","capacity":"200 NODES MAX","sound":"KIRSCH AUDIO SYSTEM"}');

-- 아티스트 데이터 — TRM-02
INSERT INTO artists (id, event_id, data) VALUES
  ('02-A', 'TRM-02', '{"name":"STANN LUMO","origin":"KR","dock":"1","time":"TBA","status":"CONFIRMED"}'),
  ('02-B', 'TRM-02', '{"name":"[ ENCRYPTED ]","origin":"--","dock":"1","time":"TBA","status":"AWAITING DECRYPTION"}'),
  ('02-C', 'TRM-02', '{"name":"[ ENCRYPTED ]","origin":"--","dock":"1","time":"TBA","status":"AWAITING DECRYPTION"}'),
  ('02-D', 'TRM-02', '{"name":"[ ENCRYPTED ]","origin":"--","dock":"2","time":"TBA","status":"AWAITING DECRYPTION"}'),
  ('02-E', 'TRM-02', '{"name":"[ ENCRYPTED ]","origin":"--","dock":"2","time":"TBA","status":"AWAITING DECRYPTION"}');

-- 아티스트 데이터 — TRM-01
INSERT INTO artists (id, event_id, data) VALUES
  ('01-A', 'TRM-01', '{"name":"STANN LUMO","origin":"KR","dock":"1","time":"01:00–02:30","status":"ARCHIVED"}'),
  ('01-B', 'TRM-01', '{"name":"MARCUS L","origin":"KR","dock":"1","time":"23:00–01:00","status":"ARCHIVED"}'),
  ('01-C', 'TRM-01', '{"name":"NUSNOOM","origin":"KR","dock":"1","time":"02:30–05:00","status":"ARCHIVED"}');

-- 방명록 초기 시드 데이터
INSERT INTO transmit_logs (id, handle, message, ts, created_at) VALUES
  ('seed-a1', 'SYS_ADMIN', 'External data received. Analog noise filtered. Thank you ;)', '2026.04.09 / 14:40', '2026-04-09T14:40:00Z'),
  ('seed-a2', 'STANN_LUMO', 'Database connected. Ready for Sector 02.', '2026.04.09 / 14:12', '2026-04-09T14:12:00Z'),
  ('seed-a3', 'GUEST_09', 'System operating normally.', '2026.04.09 / 13:55', '2026-04-09T13:55:00Z');
