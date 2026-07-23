import type { TerminalEvent } from './eventData';

const KST_SUFFIX = ' KST';

export function getEventDateTime(event: Pick<TerminalEvent, 'date' | 'time'>): Date {
  return new Date(`${event.date}T${event.time.replace(KST_SUFFIX, '')}:00+09:00`);
}

export function isEventElapsed(
  event: Pick<TerminalEvent, 'date' | 'time'>,
  now: Date = new Date(),
): boolean {
  return getEventDateTime(event).getTime() < now.getTime();
}

export function getFutureUpcomingEvent(
  events: TerminalEvent[],
  now: Date = new Date(),
): TerminalEvent | null {
  return events.find((event) => event.status === 'UPCOMING' && !isEventElapsed(event, now)) ?? null;
}

export function getArchivedOrElapsedEvents(
  events: TerminalEvent[],
  now: Date = new Date(),
): TerminalEvent[] {
  return events
    .filter((event) => event.status === 'ARCHIVED' || isEventElapsed(event, now))
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
  const daysUntil = Math.ceil((getEventDateTime(event).getTime() - now.getTime()) / 86_400_000);
  const isElapsed = daysUntil < 0;
  const opensInDays = isElapsed ? null : Math.max(0, daysUntil - accessWindowDays);

  return {
    daysUntil,
    isElapsed,
    opensInDays,
    isActive: !isElapsed && daysUntil <= accessWindowDays,
  };
}
