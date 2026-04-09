-- 기존 테이블 삭제 후 유연한 JSON 구조로 재생성
-- 주의: 프로덕션 적용 전 기존 데이터 백업 필요

DROP TABLE IF EXISTS `artists`;
DROP TABLE IF EXISTS `events`;

CREATE TABLE `events` (
  `id`   text PRIMARY KEY NOT NULL,
  `data` text NOT NULL
);

CREATE TABLE `artists` (
  `id`       text PRIMARY KEY NOT NULL,
  `event_id` text NOT NULL,
  `data`     text NOT NULL,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE cascade
);
