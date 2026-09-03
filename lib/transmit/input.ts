import { hasOnlyKeys, isString, parsePositiveInteger } from '@/lib/api/validation';
import {
  moderateTransmitInput,
  normalizeTransmitHandle,
  normalizeTransmitMessage,
  type TransmitSubmission,
} from './domain';

const MAX_PAGE = 1_000;
const TRANSMIT_INPUT_KEYS = ['handle', 'message'] as const;

export type TransmitInputError =
  | 'INVALID_INPUT'
  | 'HANDLE_REQUIRED'
  | 'HANDLE_TOO_LONG'
  | 'MESSAGE_REQUIRED'
  | 'MESSAGE_TOO_LONG'
  | 'IDEMPOTENCY_KEY_REQUIRED'
  | 'CONTENT_REJECTED';

export type ParseTransmitSubmissionResult =
  | { ok: true; input: TransmitSubmission }
  | { ok: false; error: TransmitInputError };

export function parseTransmitPage(value: string | null): number | null {
  return value === null ? 1 : parsePositiveInteger(value, MAX_PAGE);
}

export function parseTransmitSubmission(
  body: Record<string, unknown>,
  idempotencyKey: string | null,
): ParseTransmitSubmissionResult {
  if (
    !hasOnlyKeys(body, TRANSMIT_INPUT_KEYS)
    || !isString(body.handle)
    || !isString(body.message)
  ) {
    return { ok: false, error: 'INVALID_INPUT' };
  }

  const handle = normalizeTransmitHandle(body.handle);
  const message = normalizeTransmitMessage(body.message);

  if (!handle) return { ok: false, error: 'HANDLE_REQUIRED' };
  if (handle.length > 24) return { ok: false, error: 'HANDLE_TOO_LONG' };
  if (!message) return { ok: false, error: 'MESSAGE_REQUIRED' };
  if (message.length > 280) return { ok: false, error: 'MESSAGE_TOO_LONG' };
  if (!idempotencyKey) return { ok: false, error: 'IDEMPOTENCY_KEY_REQUIRED' };
  if (!moderateTransmitInput(handle, message).allowed) {
    return { ok: false, error: 'CONTENT_REJECTED' };
  }

  return { ok: true, input: { handle, message, idempotencyKey } };
}
