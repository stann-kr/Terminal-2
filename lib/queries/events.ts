import type { TerminalEvent } from '@/lib/eventData'

export const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
}

export async function fetchEvents(): Promise<TerminalEvent[]> {
  const res = await fetch('/api/events')
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json() as Promise<TerminalEvent[]>
}
