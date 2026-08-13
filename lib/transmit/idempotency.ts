import { isString } from '@/lib/api/validation';

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

export function parseIdempotencyKey(headers: Headers): string | null {
  const value = headers.get('idempotency-key');
  return isString(value) && IDEMPOTENCY_KEY_PATTERN.test(value) ? value : null;
}

export function createTransmitId(idempotencyKey: string): string {
  return `tx_${idempotencyKey}`;
}

export interface ModerationDecision {
  allowed: boolean;
  reason?: 'blocked_content';
}

export function moderateTransmitInput(handle: string, message: string): ModerationDecision {
  const containsControlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(
    `${handle}${message}`,
  );
  return containsControlCharacters
    ? { allowed: false, reason: 'blocked_content' }
    : { allowed: true };
}
