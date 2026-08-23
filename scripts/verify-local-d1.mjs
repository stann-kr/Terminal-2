import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const persistTo = mkdtempSync(path.join(tmpdir(), 'terminal-2-d1-'));
const env = { ...process.env, CI: '1', NO_COLOR: '1' };
const wrangler = (...args) => execFileSync('npx', ['wrangler', ...args], {
  cwd: process.cwd(),
  env,
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024,
});
const execute = (command) => JSON.parse(wrangler(
  'd1', 'execute', 'terminal-db', '--local', '--persist-to', persistTo,
  '--command', command,
  '--json',
));

try {
  wrangler('d1', 'migrations', 'apply', 'terminal-db', '--local', '--persist-to', persistTo);
  const results = execute(
    "SELECT name, type FROM sqlite_master WHERE type IN ('table','index') AND name NOT LIKE 'sqlite_%' ORDER BY type, name; SELECT COUNT(*) AS count FROM d1_migrations; PRAGMA foreign_key_check; PRAGMA index_info('access_requests_event_email_idx'); PRAGMA index_info('signal_email_idx');",
  );
  const objects = new Set(results[0].results.map((row) => row.name));
  for (const name of ['events', 'artists', 'access_requests', 'signal', 'transmit_logs', 'access_requests_event_email_idx', 'signal_email_idx']) {
    if (!objects.has(name)) throw new Error(`missing D1 object: ${name}`);
  }
  if (results[1].results[0]?.count !== 9) throw new Error('expected all 9 Wrangler migrations');
  if (results[2].results.length !== 0) throw new Error('foreign key check failed');
  if (results[3].results.map((row) => row.name).join(',') !== 'event_id,email') {
    throw new Error('access request unique index columns drifted');
  }
  if (results[4].results.map((row) => row.name).join(',') !== 'email') {
    throw new Error('Signal unique index columns drifted');
  }

  execute(`
    INSERT INTO events (id, data) VALUES ('event-test', '{}');
    INSERT INTO artists (id, event_id, data) VALUES ('artist-test', 'event-test', '{}');

    INSERT INTO access_requests (
      id, event_id, artist_id, invited_by, name, email, instagram,
      privacy_consent, marketing_consent, created_at
    )
    SELECT
      'req-no-marketing', 'event-test', 'artist-test', NULL, 'Guest',
      'no@example.com', '@no', 1, 0, '2026-08-23T00:00:00.000Z'
    WHERE NOT EXISTS (
      SELECT 1 FROM access_requests
      WHERE event_id = 'event-test' AND email = 'no@example.com'
    )
    AND (
      1 IS NULL
      OR (SELECT COUNT(*) FROM access_requests
          WHERE event_id = 'event-test' AND artist_id = 'artist-test') < 1
    )
    ON CONFLICT(event_id, email) DO NOTHING;
    INSERT INTO signal (id, name, email, instagram, source, created_at)
    SELECT 'sig-no-marketing', 'Guest', 'no@example.com', '@no', 'gate',
           '2026-08-23T00:00:00.000Z'
    WHERE 0 = 1
      AND EXISTS (SELECT 1 FROM access_requests WHERE id = 'req-no-marketing')
    ON CONFLICT(email) DO NOTHING;

    INSERT INTO access_requests (
      id, event_id, artist_id, invited_by, name, email, instagram,
      privacy_consent, marketing_consent, created_at
    )
    SELECT
      'req-capacity', 'event-test', 'artist-test', NULL, 'Guest',
      'capacity@example.com', '@capacity', 1, 1, '2026-08-23T00:01:00.000Z'
    WHERE NOT EXISTS (
      SELECT 1 FROM access_requests
      WHERE event_id = 'event-test' AND email = 'capacity@example.com'
    )
    AND (
      1 IS NULL
      OR (SELECT COUNT(*) FROM access_requests
          WHERE event_id = 'event-test' AND artist_id = 'artist-test') < 1
    )
    ON CONFLICT(event_id, email) DO NOTHING;
    INSERT INTO signal (id, name, email, instagram, source, created_at)
    SELECT 'sig-capacity', 'Guest', 'capacity@example.com', '@capacity', 'gate',
           '2026-08-23T00:01:00.000Z'
    WHERE 1 = 1
      AND EXISTS (SELECT 1 FROM access_requests WHERE id = 'req-capacity')
    ON CONFLICT(email) DO NOTHING;

    INSERT INTO access_requests (
      id, event_id, artist_id, invited_by, name, email, instagram,
      privacy_consent, marketing_consent, created_at
    )
    SELECT
      'req-marketing', 'event-test', NULL, NULL, 'Guest',
      'yes@example.com', '@yes', 1, 1, '2026-08-23T00:02:00.000Z'
    WHERE NOT EXISTS (
      SELECT 1 FROM access_requests
      WHERE event_id = 'event-test' AND email = 'yes@example.com'
    )
    AND NULL IS NULL
    ON CONFLICT(event_id, email) DO NOTHING;
    INSERT INTO signal (id, name, email, instagram, source, created_at)
    SELECT 'sig-marketing', 'Guest', 'yes@example.com', '@yes', 'gate',
           '2026-08-23T00:02:00.000Z'
    WHERE 1 = 1
      AND EXISTS (SELECT 1 FROM access_requests WHERE id = 'req-marketing')
    ON CONFLICT(email) DO NOTHING;

    INSERT INTO access_requests (
      id, event_id, artist_id, invited_by, name, email, instagram,
      privacy_consent, marketing_consent, created_at
    )
    SELECT
      'req-duplicate', 'event-test', NULL, NULL, 'Guest',
      'yes@example.com', '@yes', 1, 1, '2026-08-23T00:03:00.000Z'
    WHERE NOT EXISTS (
      SELECT 1 FROM access_requests
      WHERE event_id = 'event-test' AND email = 'yes@example.com'
    )
    AND NULL IS NULL
    ON CONFLICT(event_id, email) DO NOTHING;
    INSERT INTO signal (id, name, email, instagram, source, created_at)
    SELECT 'sig-duplicate', 'Guest', 'yes@example.com', '@yes', 'gate',
           '2026-08-23T00:03:00.000Z'
    WHERE 1 = 1
      AND EXISTS (SELECT 1 FROM access_requests WHERE id = 'req-duplicate')
    ON CONFLICT(email) DO NOTHING;

    INSERT INTO signal (id, name, email, instagram, source, created_at)
    VALUES ('sig-direct', NULL, 'direct@example.com', '@direct', 'signal',
            '2026-08-23T00:04:00.000Z')
    ON CONFLICT(email) DO NOTHING;
    INSERT INTO signal (id, name, email, instagram, source, created_at)
    VALUES ('sig-direct-duplicate', NULL, 'direct@example.com', '@changed', 'signal',
            '2026-08-23T00:05:00.000Z')
    ON CONFLICT(email) DO NOTHING;

    INSERT INTO transmit_logs (id, handle, message, ts, created_at)
    VALUES ('tx-legacy', 'LEGACY', 'original', '2026.08.11 / 12:00', 1786417200);
    INSERT INTO transmit_logs (id, handle, message, ts, created_at)
    VALUES ('tx-current', 'CURRENT', 'latest', '2026.08.24 / 01:05',
            '2026-08-23T16:05:00.000Z');
    INSERT INTO transmit_logs (id, handle, message, ts, created_at)
    VALUES ('tx-legacy', 'LEGACY', 'changed', '2026.08.11 / 12:00', 1786417200)
    ON CONFLICT(id) DO NOTHING;
  `);

  const behavior = execute(`
    SELECT
      COUNT(*) AS total,
      SUM(id = 'req-capacity') AS capacity_inserted,
      SUM(id = 'req-duplicate') AS duplicate_inserted
    FROM access_requests WHERE event_id = 'event-test';
    SELECT
      COUNT(*) AS total,
      SUM(email = 'no@example.com') AS no_marketing_inserted,
      SUM(email = 'capacity@example.com') AS rejected_request_inserted,
      SUM(email = 'yes@example.com') AS gate_marketing_inserted,
      SUM(email = 'direct@example.com') AS direct_inserted
    FROM signal;
    SELECT COUNT(*) AS total, MAX(message) AS message
    FROM transmit_logs WHERE id = 'tx-legacy';
    SELECT id FROM transmit_logs
    ORDER BY CASE
      WHEN typeof(created_at) IN ('integer', 'real') THEN CAST(created_at AS INTEGER)
      ELSE CAST(strftime('%s', created_at) AS INTEGER)
    END DESC LIMIT 1;
    PRAGMA foreign_key_check;
  `);
  const accessResult = behavior[0].results[0];
  if (
    accessResult?.total !== 2
    || accessResult.capacity_inserted !== 0
    || accessResult.duplicate_inserted !== 0
  ) {
    throw new Error('Gate atomic insert behavior drifted');
  }
  const signalResult = behavior[1].results[0];
  if (
    signalResult?.total !== 2
    || signalResult.no_marketing_inserted !== 0
    || signalResult.rejected_request_inserted !== 0
    || signalResult.gate_marketing_inserted !== 1
    || signalResult.direct_inserted !== 1
  ) {
    throw new Error('Signal insert behavior drifted');
  }
  if (behavior[2].results[0]?.total !== 1 || behavior[2].results[0]?.message !== 'original') {
    throw new Error('Transmit idempotency boundary drifted');
  }
  if (behavior[3].results[0]?.id !== 'tx-current') {
    throw new Error('Transmit mixed timestamp ordering drifted');
  }
  if (behavior[4].results.length !== 0) throw new Error('behavior foreign key check failed');

  console.log('Local D1 contract PASS: 9 migrations, indexes, FK, Gate/Signal atomic rules, Transmit idempotency/order');
} finally {
  rmSync(persistTo, { recursive: true, force: true });
}
