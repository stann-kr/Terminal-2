import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  eq: vi.fn((column: unknown, value: unknown) => ({ column, value })),
}));

vi.mock('drizzle-orm', async (importOriginal) => ({
  ...await importOriginal<typeof import('drizzle-orm')>(),
  eq: mocks.eq,
}));

import {
  listGateArtistRowsByEvent,
  listGateEventRows,
} from '../lib/gate/d1GateReadRepository';
import { artists, events } from '../lib/db/schema';

describe('Gate D1 read repository', () => {
  it('returns only stored event identifiers and JSON data', async () => {
    const eventRows = [{ id: 'event-1', data: '{"status":"UPCOMING"}' }];
    const all = vi.fn().mockResolvedValue(eventRows);
    const from = vi.fn(() => ({ all }));
    const select = vi.fn(() => ({ from }));

    await expect(listGateEventRows({ select } as never)).resolves.toEqual(eventRows);
    expect(select).toHaveBeenCalledWith({ id: events.id, data: events.data });
    expect(from).toHaveBeenCalledWith(events);
    expect(all).toHaveBeenCalledOnce();
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
    expect(all).toHaveBeenCalledOnce();
  });
});
