import type {
  PostTransmitInput,
  PublicTransmitLog,
  TransmitLogPage,
} from './contract';

export const transmitKeys = {
  all: ['transmit'] as const,
  list: (page: number) => [...transmitKeys.all, 'list', page] as const,
};

export async function fetchTransmitLogs(page: number): Promise<TransmitLogPage> {
  const response = await fetch(`/api/transmit?page=${page}`);
  if (!response.ok) throw new Error('Failed to fetch transmit logs');
  return response.json() as Promise<TransmitLogPage>;
}

export async function postTransmitLog(input: PostTransmitInput): Promise<PublicTransmitLog> {
  const idempotencyKey = input.idempotencyKey ?? crypto.randomUUID().replaceAll('-', '');
  const response = await fetch('/api/transmit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ handle: input.handle, message: input.message }),
  });
  if (!response.ok) {
    const data = await response.json() as { error?: string };
    throw new Error(data.error ?? 'Failed to post transmit log');
  }
  return response.json() as Promise<PublicTransmitLog>;
}
