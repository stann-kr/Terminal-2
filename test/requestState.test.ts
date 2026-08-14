import { describe, expect, it } from 'vitest';
import {
  resolveCodeVerificationState,
  resolveRequestEventState,
} from '../lib/gate/requestState';
import type { TerminalEvent } from '../lib/eventData';

const futureEvent: TerminalEvent = {
  id: 'event-1',
  session: 'TERMINAL [01]',
  subtitle: 'Test event',
  date: '2026-09-01',
  time: '23:00 KST',
  venue: 'Test venue',
  district: 'Test district',
  coords: '0, 0',
  capacity: '10',
  sound: 'Test sound',
  status: 'UPCOMING',
  artists: [],
};

describe('request access state', () => {
  const now = new Date('2026-08-15T12:00:00+09:00');

  it('keeps an empty event list distinct from an inactive request window', () => {
    expect(resolveRequestEventState([], 30, now)).toEqual({ kind: 'empty' });
    expect(resolveRequestEventState([futureEvent], 7, now)).toMatchObject({ kind: 'inactive' });
  });

  it('opens the request form only inside the configured request window', () => {
    expect(resolveRequestEventState([futureEvent], 30, now)).toEqual({
      kind: 'ready',
      event: futureEvent,
    });
  });

  it('keeps invalid access codes separate from verification failures', () => {
    expect(resolveCodeVerificationState({ ok: true, status: 200, name: null })).toEqual({
      kind: 'invalid',
    });
    expect(resolveCodeVerificationState({ ok: false, status: 500 })).toEqual({
      kind: 'unavailable',
    });
  });
});
