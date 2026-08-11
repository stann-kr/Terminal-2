export interface PublicTransmitLog {
  id: string;
  handle: string;
  message: string;
  ts: string;
  createdAt: string;
}

type TransmitLogSource = PublicTransmitLog & { deviceId?: string | null };

/** Removes storage-only identifiers before a transmit log crosses the public API boundary. */
export function toPublicTransmitLog(log: TransmitLogSource): PublicTransmitLog {
  return {
    id: log.id,
    handle: log.handle,
    message: log.message,
    ts: log.ts,
    createdAt: log.createdAt,
  };
}
