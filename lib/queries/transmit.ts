export interface LogEntry {
  id: string
  handle: string
  message: string
  ts: string
  createdAt?: string
  deviceId?: string | null
}

export interface LogPage {
  logs: LogEntry[]
  total: number
  page: number
  totalPages: number
}

export interface PostTransmitInput {
  handle: string
  message: string
  deviceId: string
}

export const transmitKeys = {
  all: ['transmit'] as const,
  list: (page: number) => [...transmitKeys.all, 'list', page] as const,
}

export async function fetchTransmitLogs(page: number): Promise<LogPage> {
  const res = await fetch(`/api/transmit?page=${page}`)
  if (!res.ok) throw new Error('Failed to fetch transmit logs')
  return res.json() as Promise<LogPage>
}

export async function postTransmitLog(input: PostTransmitInput): Promise<LogEntry> {
  const res = await fetch('/api/transmit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const data = await res.json() as { error?: string }
    throw new Error(data.error ?? 'Failed to post transmit log')
  }
  return res.json() as Promise<LogEntry>
}
