import { getFutureUpcomingEvent, getRequestWindowState, type RequestWindowState } from '@/lib/eventLifecycle';
import type { TerminalEvent } from '@/lib/eventData';

export type RequestEventState =
  | { kind: 'loading' }
  | { kind: 'load-error' }
  | { kind: 'empty' }
  | { kind: 'inactive'; event: TerminalEvent; window: RequestWindowState }
  | { kind: 'ready'; event: TerminalEvent };

export type CodeVerificationState =
  | { kind: 'idle' }
  | { kind: 'verifying' }
  | { kind: 'invalid' }
  | { kind: 'unavailable' }
  | { kind: 'verified'; artistName: string };

export function resolveRequestEventState(
  events: TerminalEvent[],
  accessWindowDays: number,
  now: Date = new Date(),
): Exclude<RequestEventState, { kind: 'loading' } | { kind: 'load-error' }> {
  const event = getFutureUpcomingEvent(events, now);
  if (!event) return { kind: 'empty' };

  const window = getRequestWindowState(event, accessWindowDays, now);
  return window.isActive
    ? { kind: 'ready', event }
    : { kind: 'inactive', event, window };
}

export function resolveCodeVerificationState(
  response: { ok: boolean; status: number; name?: string | null },
): Exclude<CodeVerificationState, { kind: 'idle' } | { kind: 'verifying' }> {
  if (!response.ok) {
    return response.status === 400 ? { kind: 'invalid' } : { kind: 'unavailable' };
  }

  return response.name ? { kind: 'verified', artistName: response.name } : { kind: 'invalid' };
}
