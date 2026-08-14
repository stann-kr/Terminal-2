import { describe, expect, it } from 'vitest';
import {
  getEffectiveEventStatus,
  getFutureUpcomingEvent,
  getRequestWindowState,
} from '../lib/eventLifecycle';
import type { EventStatus, TerminalEvent } from '../lib/eventData';

function event(id: string, date: string, time: string, status: EventStatus): TerminalEvent {
  return {
    id,
    session: id,
    subtitle: 'test',
    date,
    time,
    venue: 'test',
    district: 'test',
    coords: 'test',
    capacity: 'test',
    sound: 'test',
    status,
    artists: [],
  };
}

describe('event lifecycle', () => {
  const now = new Date('2026-08-11T12:00:00+09:00');

  it('archives an elapsed UPCOMING event but preserves LIVE without an end-time', () => {
    const pastUpcoming = event('past', '2026-08-10', '23:00 KST', 'UPCOMING');
    const live = event('live', '2026-08-10', '23:00 KST', 'LIVE');

    expect(getEffectiveEventStatus(pastUpcoming, now)).toBe('ARCHIVED');
    expect(getEffectiveEventStatus(live, now)).toBe('LIVE');
  });

  it('chooses the earliest future UPCOMING event regardless of source order', () => {
    const later = event('later', '2026-09-10', '23:00 KST', 'UPCOMING');
    const earlier = event('earlier', '2026-08-12', '23:00 KST', 'UPCOMING');
    const stale = event('stale', '2026-08-10', '23:00 KST', 'UPCOMING');

    expect(getFutureUpcomingEvent([later, stale, earlier], now)?.id).toBe('earlier');
  });

  it('closes the request window as soon as an event begins', () => {
    const started = event('started', '2026-08-11', '12:00 KST', 'UPCOMING');
    const oneMinuteAfterStart = new Date('2026-08-11T12:01:00+09:00');

    const window = getRequestWindowState(started, 30, oneMinuteAfterStart);
    expect(window.isElapsed).toBe(true);
    expect(window.isActive).toBe(false);
    expect(window.daysUntil).toBeLessThan(0);
  });

  it('fails closed when a scheduled event has an invalid date', () => {
    const invalid = event('invalid', 'not-a-date', '23:00 KST', 'UPCOMING');

    expect(getEffectiveEventStatus(invalid, now)).toBe('ARCHIVED');
    expect(getRequestWindowState(invalid, 30, now)).toMatchObject({
      isElapsed: true,
      isActive: false,
      opensInDays: null,
    });
  });
});
