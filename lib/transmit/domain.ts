import { createTransmitId } from './idempotency';

export interface TransmitSubmission {
  handle: string;
  message: string;
  idempotencyKey: string;
}

export interface NewTransmitRecord {
  id: string;
  handle: string;
  message: string;
  ts: string;
  createdAt: string;
}

export interface ModerationDecision {
  allowed: boolean;
  reason?: 'blocked_content';
}

export function normalizeTransmitHandle(handle: string): string {
  return handle.trim().replace(/\s+/g, '_').toUpperCase();
}

export function normalizeTransmitMessage(message: string): string {
  return message.trim();
}

export function moderateTransmitInput(
  handle: string,
  message: string,
): ModerationDecision {
  const containsControlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(
    `${handle}${message}`,
  );
  return containsControlCharacters
    ? { allowed: false, reason: 'blocked_content' }
    : { allowed: true };
}

export function formatTransmitKstTimestamp(now: Date): string {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCFullYear()}.${String(kst.getUTCMonth() + 1).padStart(2, '0')}.${String(kst.getUTCDate()).padStart(2, '0')} / ${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}`;
}

export function createTransmitRecord(
  submission: TransmitSubmission,
  now: Date,
): NewTransmitRecord {
  return {
    id: createTransmitId(submission.idempotencyKey),
    handle: submission.handle,
    message: submission.message,
    ts: formatTransmitKstTimestamp(now),
    createdAt: now.toISOString(),
  };
}
