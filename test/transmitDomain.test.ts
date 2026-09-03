import { describe, expect, it } from 'vitest';
import {
  createTransmitRecord,
  formatTransmitKstTimestamp,
} from '../lib/transmit/domain';
import {
  parseTransmitPage,
  parseTransmitSubmission,
} from '../lib/transmit/input';

const IDEMPOTENCY_KEY = 'abcdef0123456789';

describe('transmit input contract', () => {
  it('normalizes a valid submission without changing its idempotency identity', () => {
    expect(parseTransmitSubmission({
      handle: '  node alpha  ',
      message: '  hello terminal  ',
    }, IDEMPOTENCY_KEY)).toEqual({
      ok: true,
      input: {
        handle: 'NODE_ALPHA',
        message: 'hello terminal',
        idempotencyKey: IDEMPOTENCY_KEY,
      },
    });
  });

  it.each([
    [{ handle: 'NODE', message: 'hello', extra: true }, IDEMPOTENCY_KEY, 'INVALID_INPUT'],
    [{ handle: '', message: 'hello' }, IDEMPOTENCY_KEY, 'HANDLE_REQUIRED'],
    [{ handle: 'A'.repeat(25), message: 'hello' }, IDEMPOTENCY_KEY, 'HANDLE_TOO_LONG'],
    [{ handle: 'NODE', message: ' ' }, IDEMPOTENCY_KEY, 'MESSAGE_REQUIRED'],
    [{ handle: 'NODE', message: 'A'.repeat(281) }, IDEMPOTENCY_KEY, 'MESSAGE_TOO_LONG'],
    [{ handle: 'NODE', message: 'hello' }, null, 'IDEMPOTENCY_KEY_REQUIRED'],
    [{ handle: 'NODE', message: 'hello\u0000' }, IDEMPOTENCY_KEY, 'CONTENT_REJECTED'],
  ] as const)('rejects invalid input with %s', (body, key, error) => {
    expect(parseTransmitSubmission(body, key)).toEqual({ ok: false, error });
  });

  it('accepts only bounded positive page numbers', () => {
    expect(parseTransmitPage(null)).toBe(1);
    expect(parseTransmitPage('2')).toBe(2);
    expect(parseTransmitPage('0')).toBeNull();
    expect(parseTransmitPage('1001')).toBeNull();
    expect(parseTransmitPage('1.5')).toBeNull();
  });
});

describe('transmit record contract', () => {
  it('keeps the stable id, ISO creation time, and KST display timestamp together', () => {
    const now = new Date('2026-08-23T16:05:00.000Z');

    expect(formatTransmitKstTimestamp(now)).toBe('2026.08.24 / 01:05');
    expect(createTransmitRecord({
      handle: 'NODE_ALPHA',
      message: 'hello terminal',
      idempotencyKey: IDEMPOTENCY_KEY,
    }, now)).toEqual({
      id: `tx_${IDEMPOTENCY_KEY}`,
      handle: 'NODE_ALPHA',
      message: 'hello terminal',
      ts: '2026.08.24 / 01:05',
      createdAt: '2026-08-23T16:05:00.000Z',
    });
  });
});
