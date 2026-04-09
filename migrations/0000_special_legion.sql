CREATE TABLE `artists` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`origin` text NOT NULL,
	`dock` text NOT NULL,
	`time` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`subtitle` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`venue` text NOT NULL,
	`district` text NOT NULL,
	`coords` text NOT NULL,
	`capacity` text NOT NULL,
	`sound` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `transmit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`handle` text NOT NULL,
	`message` text NOT NULL,
	`ts` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
