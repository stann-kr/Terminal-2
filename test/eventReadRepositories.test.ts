import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  eq: vi.fn((column: unknown, value: unknown) => ({ column, value })),
}));

vi.mock('drizzle-orm', async (importOriginal) => ({
  ...await importOriginal<typeof import('drizzle-orm')>(),
  eq: mocks.eq,
}));

import {
  listStoredArtistRows,
  listStoredArtistRowsByEvent,
  listStoredEventRows,
} from '../lib/events/d1EventReadRepository';
import {
  listGateArtistRowsByEvent,
  listGateEventRows,
} from '../lib/gate/d1GateReadRepository';
import { artists, events } from '../lib/db/schema';

function createAllQuery(rows: unknown[]) {
  const all = vi.fn().mockResolvedValue(rows);
  const from = vi.fn(() => ({ all }));
  const select = vi.fn(() => ({ from }));
  return { all, from, select };
}

describe('Events D1 read repository', () => {
  it('selects only stored event identifiers and JSON data', async () => {
    const rows = [{ id: 'event-1', data: '{"status":"UPCOMING"}' }];
    const query = createAllQuery(rows);

    await expect(listStoredEventRows({ select: query.select } as never)).resolves.toEqual(rows);
    expect(query.select).toHaveBeenCalledWith({ id: events.id, data: events.data });
    expect(query.from).toHaveBeenCalledWith(events);
  });

  it('selects the event ownership key with public artist rows', async () => {
    const rows = [{ id: 'artist-1', eventId: 'event-1', data: '{"name":"ARTIST"}' }];
    const query = createAllQuery(rows);

    await expect(listStoredArtistRows({ select: query.select } as never)).resolves.toEqual(rows);
    expect(query.select).toHaveBeenCalledWith({
      id: artists.id,
      eventId: artists.eventId,
      data: artists.data,
    });
    expect(query.from).toHaveBeenCalledWith(artists);
  });

  it('scopes public artist rows to the requested event', async () => {
    const rows = [{ id: 'artist-1', eventId: 'event-1', data: '{"name":"ARTIST"}' }];
    const all = vi.fn().mockResolvedValue(rows);
    const where = vi.fn(() => ({ all }));
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));
    mocks.eq.mockClear();

    await expect(listStoredArtistRowsByEvent({ select } as never, 'event-1')).resolves.toEqual(rows);
    expect(select).toHaveBeenCalledWith({
      id: artists.id,
      eventId: artists.eventId,
      data: artists.data,
    });
    expect(from).toHaveBeenCalledWith(artists);
    expect(mocks.eq).toHaveBeenCalledWith(artists.eventId, 'event-1');
    expect(where).toHaveBeenCalledWith(mocks.eq.mock.results[0]?.value);
  });
});

describe('Gate D1 read repository', () => {
  it('returns only stored event identifiers and JSON data', async () => {
    const eventRows = [{ id: 'event-1', data: '{"status":"UPCOMING"}' }];
    const query = createAllQuery(eventRows);

    await expect(listGateEventRows({ select: query.select } as never)).resolves.toEqual(eventRows);
    expect(query.select).toHaveBeenCalledWith({ id: events.id, data: events.data });
    expect(query.from).toHaveBeenCalledWith(events);
  });

  it('scopes stored artist access rows to the selected event', async () => {
    const artistRows = [{ id: 'artist-1', data: '{"guestCode":"CODE"}' }];
    const all = vi.fn().mockResolvedValue(artistRows);
    const where = vi.fn(() => ({ all }));
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));
    mocks.eq.mockClear();

    await expect(
      listGateArtistRowsByEvent({ select } as never, 'event-1'),
    ).resolves.toEqual(artistRows);
    expect(select).toHaveBeenCalledWith({ id: artists.id, data: artists.data });
    expect(from).toHaveBeenCalledWith(artists);
    expect(mocks.eq).toHaveBeenCalledWith(artists.eventId, 'event-1');
    expect(where).toHaveBeenCalledWith(mocks.eq.mock.results[0]?.value);
  });
});
