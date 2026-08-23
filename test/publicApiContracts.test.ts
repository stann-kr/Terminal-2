import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { toPublicTransmitLog } from '../lib/transmit/contract';

describe('public API contracts', () => {
  it('does not expose deviceId from transmit records', () => {
    const response = toPublicTransmitLog({
      id: 'log-1',
      handle: 'NODE',
      message: 'hello',
      ts: '2026.08.11 / 12:00',
      createdAt: '2026-08-11T03:00:00.000Z',
      deviceId: 'private-device-id',
    });

    expect(response).toEqual({
      id: 'log-1',
      handle: 'NODE',
      message: 'hello',
      ts: '2026.08.11 / 12:00',
      createdAt: '2026-08-11T03:00:00.000Z',
    });
    expect('deviceId' in response).toBe(false);
  });

  it('normalizes legacy epoch and missing created_at values at the public boundary', () => {
    const expectedCreatedAt = '2026-08-11T03:00:00.000Z';
    const legacyEpochSeconds = Date.parse(expectedCreatedAt) / 1_000;

    expect(toPublicTransmitLog({
      id: 'legacy-epoch',
      handle: 'NODE',
      message: 'hello',
      ts: '2026.08.11 / 12:00',
      createdAt: legacyEpochSeconds,
    }).createdAt).toBe(expectedCreatedAt);

    expect(toPublicTransmitLog({
      id: 'legacy-null',
      handle: 'NODE',
      message: 'hello',
      ts: '2026.08.11 / 12:00',
      createdAt: null,
    }).createdAt).toBe(expectedCreatedAt);
  });

  it('keeps code-info POST-only, non-cacheable, and length-bounded', async () => {
    const [source, responseHelper] = await Promise.all([
      readFile('app/api/gate/code-info/route.ts', 'utf8'),
      readFile('lib/api/responses.ts', 'utf8'),
    ]);

    expect(source).toContain('export async function POST');
    expect(source).not.toContain('export async function GET');
    expect(source).toContain('noStoreJson');
    expect(responseHelper).toContain("'Cache-Control': 'no-store'");
    expect(source).toContain('code.length > 64');
  });
});
