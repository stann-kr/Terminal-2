import { describe, expect, it } from 'vitest';
import {
  createTransmitId,
  moderateTransmitInput,
  parseIdempotencyKey,
} from '../lib/transmit/idempotency';

describe('transmit idempotency and moderation contract', () => {
  it('accepts bounded opaque keys and creates a stable database id', () => {
    const headers = new Headers({ 'Idempotency-Key': 'abcdef0123456789' });
    expect(parseIdempotencyKey(headers)).toBe('abcdef0123456789');
    expect(createTransmitId('abcdef0123456789')).toBe('tx_abcdef0123456789');
  });

  it('rejects missing, short, and malformed idempotency keys', () => {
    expect(parseIdempotencyKey(new Headers())).toBeNull();
    expect(parseIdempotencyKey(new Headers({ 'Idempotency-Key': 'short' }))).toBeNull();
    expect(parseIdempotencyKey(new Headers({ 'Idempotency-Key': 'unsafe key 123456789' }))).toBeNull();
  });

  it('rejects control characters before storage', () => {
    expect(moderateTransmitInput('NODE', 'hello').allowed).toBe(true);
    expect(moderateTransmitInput('NODE', 'hello\u0000').allowed).toBe(false);
  });
});
