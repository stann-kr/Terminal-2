import type { EventStatus, TerminalEvent } from './eventData';

const KST_SUFFIX = ' KST';

export function getEventDateTime(event: Pick<TerminalEvent, 'date' | 'time'>): Date {
  return new Date(`${event.date}T${event.time.replace(KST_SUFFIX, '')}:00+09:00`);
}

export function isValidEventDateTime(event: Pick<TerminalEvent, 'date' | 'time'>): boolean {
  return !Number.isNaN(getEventDateTime(event).getTime());
}

export function isEventElapsed(
  event: Pick<TerminalEvent, 'date' | 'time'>,
  now: Date = new Date(),
): boolean {
  const eventTime = getEventDateTime(event).getTime();
  return !Number.isNaN(eventTime) && eventTime < now.getTime();
}

/**
 * Date/time is the source of truth for scheduled UPCOMING events once they
 * have elapsed. LIVE has no end-time model, so its stored status is retained.
 */
export function getEffectiveEventStatus(
  event: Pick<TerminalEvent, 'date' | 'time' | 'status'>,
  now: Date = new Date(),
): EventStatus {
  return event.status === 'ARCHIVED'
    || (event.status === 'UPCOMING' && (!isValidEventDateTime(event) || isEventElapsed(event, now)))
    ? 'ARCHIVED'
    : event.status;
}

export function withEffectiveEventStatus<T extends TerminalEvent>(
  event: T,
  now: Date = new Date(),
): T {
  return { ...event, status: getEffectiveEventStatus(event, now) };
}

export function getFutureUpcomingEvent(
  events: TerminalEvent[],
  now: Date = new Date(),
): TerminalEvent | null {
  return [...events]
    .filter((event) => getEffectiveEventStatus(event, now) === 'UPCOMING')
    .sort((a, b) => getEventDateTime(a).getTime() - getEventDateTime(b).getTime())[0] ?? null;
}

export function getArchivedOrElapsedEvents(
  events: TerminalEvent[],
  now: Date = new Date(),
): TerminalEvent[] {
  return events
    .filter((event) => getEffectiveEventStatus(event, now) === 'ARCHIVED')
    .sort((a, b) => getEventDateTime(b).getTime() - getEventDateTime(a).getTime());
}

export function getLatestEvent(events: TerminalEvent[]): TerminalEvent | null {
  return [...events].sort((a, b) => getEventDateTime(b).getTime() - getEventDateTime(a).getTime())[0] ?? null;
}

export interface RequestWindowState {
  daysUntil: number;
  isActive: boolean;
  isElapsed: boolean;
  opensInDays: number | null;
}

export function getRequestWindowState(
  event: Pick<TerminalEvent, 'date' | 'time'>,
  accessWindowDays: number,
  now: Date = new Date(),
): RequestWindowState {
  const eventTime = getEventDateTime(event).getTime();
  if (Number.isNaN(eventTime)) {
    return { daysUntil: -1, isElapsed: true, opensInDays: null, isActive: false };
  }

  const millisecondsUntil = eventTime - now.getTime();
  const isElapsed = millisecondsUntil <= 0;
  const daysUntil = isElapsed
    ? Math.min(-1, Math.floor(millisecondsUntil / 86_400_000))
    : Math.ceil(millisecondsUntil / 86_400_000);
  const opensInDays = isElapsed ? null : Math.max(0, daysUntil - accessWindowDays);

  return {
    daysUntil,
    isElapsed,
    opensInDays,
    isActive: !isElapsed && daysUntil <= accessWindowDays,
  };
}
