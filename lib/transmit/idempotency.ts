const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

export function parseIdempotencyKey(value: string | null): string | null {
  return value !== null && IDEMPOTENCY_KEY_PATTERN.test(value) ? value : null;
}

export function createTransmitId(idempotencyKey: string): string {
  return `tx_${idempotencyKey}`;
}
