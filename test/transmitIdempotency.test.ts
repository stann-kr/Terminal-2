import { describe, expect, it } from 'vitest';
import {
  createTransmitId,
  parseIdempotencyKey,
} from '../lib/transmit/idempotency';
import { moderateTransmitInput } from '../lib/transmit/domain';

describe('transmit idempotency and moderation contract', () => {
  it('accepts bounded opaque keys and creates a stable database id', () => {
    expect(parseIdempotencyKey('abcdef0123456789')).toBe('abcdef0123456789');
    expect(createTransmitId('abcdef0123456789')).toBe('tx_abcdef0123456789');
  });

  it('rejects missing, short, and malformed idempotency keys', () => {
    expect(parseIdempotencyKey(null)).toBeNull();
    expect(parseIdempotencyKey('short')).toBeNull();
    expect(parseIdempotencyKey('unsafe key 123456789')).toBeNull();
  });

  it('rejects control characters before storage', () => {
    expect(moderateTransmitInput('NODE', 'hello').allowed).toBe(true);
    expect(moderateTransmitInput('NODE', 'hello\u0000').allowed).toBe(false);
  });
});
