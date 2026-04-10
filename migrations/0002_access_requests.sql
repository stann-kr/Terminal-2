CREATE TABLE `access_requests` (
  `id` text PRIMARY KEY NOT NULL,
  `event_id` text NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `instagram` text NOT NULL,
  `invited_by` text NOT NULL,
  `privacy_consent` integer NOT NULL,
  `created_at` text NOT NULL,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
);

CREATE UNIQUE INDEX `access_requests_event_email_idx`
  ON `access_requests` (`event_id`, `email`);
