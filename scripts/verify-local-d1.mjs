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

try {
  wrangler('d1', 'migrations', 'apply', 'terminal-db', '--local', '--persist-to', persistTo);
  const output = wrangler(
    'd1', 'execute', 'terminal-db', '--local', '--persist-to', persistTo,
    '--command', "SELECT name, type FROM sqlite_master WHERE type IN ('table','index') AND name NOT LIKE 'sqlite_%' ORDER BY type, name; SELECT COUNT(*) AS count FROM d1_migrations; PRAGMA foreign_key_check;",
    '--json',
  );
  const results = JSON.parse(output);
  const objects = new Set(results[0].results.map((row) => row.name));
  for (const name of ['events', 'artists', 'access_requests', 'signal', 'transmit_logs', 'access_requests_event_email_idx', 'signal_email_idx']) {
    if (!objects.has(name)) throw new Error(`missing D1 object: ${name}`);
  }
  if (results[1].results[0]?.count !== 9) throw new Error('expected all 9 Wrangler migrations');
  if (results[2].results.length !== 0) throw new Error('foreign key check failed');
  console.log('Local D1 migration smoke PASS: 9 migrations, required tables/indexes, foreign keys');
} finally {
  rmSync(persistTo, { recursive: true, force: true });
}
