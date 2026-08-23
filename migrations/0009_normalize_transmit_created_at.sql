CREATE TABLE `__new_transmit_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `handle` text NOT NULL,
  `message` text NOT NULL,
  `ts` text NOT NULL,
  `created_at` text NOT NULL,
  `device_id` text
);

INSERT INTO `__new_transmit_logs` (
  `id`,
  `handle`,
  `message`,
  `ts`,
  `created_at`,
  `device_id`
)
SELECT
  `id`,
  `handle`,
  `message`,
  `ts`,
  CASE
    WHEN typeof(`created_at`) = 'text'
      AND length(`created_at`) = 24
      AND substr(`created_at`, 5, 1) = '-'
      AND substr(`created_at`, 8, 1) = '-'
      AND substr(`created_at`, 11, 1) = 'T'
      AND substr(`created_at`, 14, 1) = ':'
      AND substr(`created_at`, 17, 1) = ':'
      AND substr(`created_at`, 20, 1) = '.'
      AND substr(`created_at`, 24, 1) = 'Z'
      AND strftime('%Y-%m-%dT%H:%M:%fZ', `created_at`) = `created_at`
    THEN `created_at`

    WHEN typeof(`created_at`) IN ('integer', 'real')
    THEN strftime(
      '%Y-%m-%dT%H:%M:%fZ',
      CASE
        WHEN abs(`created_at`) >= 1000000000000
        THEN `created_at` / 1000.0
        ELSE `created_at`
      END,
      'unixepoch'
    )

    WHEN `created_at` IS NULL
      AND length(`ts`) = 18
      AND substr(`ts`, 5, 1) = '.'
      AND substr(`ts`, 8, 1) = '.'
      AND substr(`ts`, 11, 3) = ' / '
      AND substr(`ts`, 16, 1) = ':'
      AND strftime(
        '%Y.%m.%d / %H:%M',
        substr(`ts`, 1, 4) || '-' ||
        substr(`ts`, 6, 2) || '-' ||
        substr(`ts`, 9, 2) || 'T' ||
        substr(`ts`, 14, 5) || ':00'
      ) = `ts`
    THEN strftime(
      '%Y-%m-%dT%H:%M:%fZ',
      substr(`ts`, 1, 4) || '-' ||
      substr(`ts`, 6, 2) || '-' ||
      substr(`ts`, 9, 2) || 'T' ||
      substr(`ts`, 14, 5) || ':00+09:00'
    )
  END,
  `device_id`
FROM `transmit_logs`;

DROP TABLE `transmit_logs`;
ALTER TABLE `__new_transmit_logs` RENAME TO `transmit_logs`;
