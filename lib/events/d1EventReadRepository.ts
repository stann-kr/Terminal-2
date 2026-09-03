import { eq } from 'drizzle-orm';
import type { getDb } from '@/lib/db/client';
import { artists, events } from '@/lib/db/schema';

type EventDatabase = ReturnType<typeof getDb>;

export interface StoredEventRow {
  id: string;
  data: string;
}

export interface StoredArtistRow {
  id: string;
  eventId: string;
  data: string;
}

export async function listStoredEventRows(
  database: EventDatabase,
): Promise<StoredEventRow[]> {
  return database
    .select({ id: events.id, data: events.data })
    .from(events)
    .all();
}

export async function listStoredArtistRows(
  database: EventDatabase,
): Promise<StoredArtistRow[]> {
  return database
    .select({ id: artists.id, eventId: artists.eventId, data: artists.data })
    .from(artists)
    .all();
}

export async function listStoredArtistRowsByEvent(
  database: EventDatabase,
  eventId: string,
): Promise<StoredArtistRow[]> {
  return database
    .select({ id: artists.id, eventId: artists.eventId, data: artists.data })
    .from(artists)
    .where(eq(artists.eventId, eventId))
    .all();
}
