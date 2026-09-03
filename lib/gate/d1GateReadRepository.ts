import { eq } from 'drizzle-orm';
import type { getDb } from '../db/client';
import { artists, events } from '../db/schema';
import type { StoredGateArtistRow, StoredGateEventRow } from './createAccessRequest';

type GateDatabase = ReturnType<typeof getDb>;

export async function listGateEventRows(
  database: GateDatabase,
): Promise<StoredGateEventRow[]> {
  return database
    .select({ id: events.id, data: events.data })
    .from(events)
    .all();
}

export async function listGateArtistRowsByEvent(
  database: GateDatabase,
  eventId: string,
): Promise<StoredGateArtistRow[]> {
  return database
    .select({ id: artists.id, data: artists.data })
    .from(artists)
    .where(eq(artists.eventId, eventId))
    .all();
}
