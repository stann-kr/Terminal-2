CREATE TABLE `signal` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text,
  `email` text NOT NULL,
  `instagram` text NOT NULL,
  `source` text NOT NULL,
  `created_at` text NOT NULL
);
CREATE UNIQUE INDEX `signal_email_idx` ON `signal` (`email`);
