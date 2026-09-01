import { readFile } from 'node:fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toPublicTransmitLog } from '../lib/transmit/contract';

const mocks = vi.hoisted(() => ({
  getCloudflareContext: vi.fn(),
  getDb: vi.fn(),
  listStoredArtistRows: vi.fn(),
  listStoredArtistRowsByEvent: vi.fn(),
  listStoredEventRows: vi.fn(),
}));

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: mocks.getCloudflareContext,
}));
vi.mock('@/lib/db/client', () => ({ getDb: mocks.getDb }));
vi.mock('@/lib/events/d1EventReadRepository', () => ({
  listStoredArtistRows: mocks.listStoredArtistRows,
  listStoredArtistRowsByEvent: mocks.listStoredArtistRowsByEvent,
  listStoredEventRows: mocks.listStoredEventRows,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCloudflareContext.mockReturnValue({ env: { DB: {} } });
  mocks.getDb.mockReturnValue({ database: true });
});

describe('public API contracts', () => {
  it('does not expose deviceId from transmit records', () => {
    const response = toPublicTransmitLog({
      id: 'log-1',
      handle: 'NODE',
      message: 'hello',
      ts: '2026.08.11 / 12:00',
      createdAt: '2026-08-11T03:00:00.000Z',
      deviceId: 'private-device-id',
    });

    expect(response).toEqual({
      id: 'log-1',
      handle: 'NODE',
      message: 'hello',
      ts: '2026.08.11 / 12:00',
      createdAt: '2026-08-11T03:00:00.000Z',
    });
    expect('deviceId' in response).toBe(false);
  });

  it('normalizes legacy epoch and missing created_at values at the public boundary', () => {
    const expectedCreatedAt = '2026-08-11T03:00:00.000Z';
    const legacyEpochSeconds = Date.parse(expectedCreatedAt) / 1_000;

    expect(toPublicTransmitLog({
      id: 'legacy-epoch',
      handle: 'NODE',
      message: 'hello',
      ts: '2026.08.11 / 12:00',
      createdAt: legacyEpochSeconds,
    }).createdAt).toBe(expectedCreatedAt);

    expect(toPublicTransmitLog({
      id: 'legacy-null',
      handle: 'NODE',
      message: 'hello',
      ts: '2026.08.11 / 12:00',
      createdAt: null,
    }).createdAt).toBe(expectedCreatedAt);
  });

  it('keeps code-info POST-only, non-cacheable, and length-bounded', async () => {
    const [source, responseHelper] = await Promise.all([
      readFile('app/api/gate/code-info/route.ts', 'utf8'),
      readFile('lib/api/responses.ts', 'utf8'),
    ]);

    expect(source).toContain('export async function POST');
    expect(source).not.toContain('export async function GET');
    expect(source).toContain('noStoreJson');
    expect(responseHelper).toContain("'Cache-Control': 'no-store'");
    expect(source).toContain('code.length > 64');
  });

  it('keeps public event routes at the transport boundary', async () => {
    const [eventsRoute, artistsRoute] = await Promise.all([
      readFile('app/api/events/route.ts', 'utf8'),
      readFile('app/api/artists/route.ts', 'utf8'),
    ]);

    for (const source of [eventsRoute, artistsRoute]) {
      expect(source).toContain('@/lib/events/d1EventReadRepository');
      expect(source).not.toContain('@/lib/db/schema');
      expect(source).not.toContain('.select(');
    }
  });

  it('reads public event routes through the Events adapter', async () => {
    mocks.listStoredEventRows.mockResolvedValue([]);
    mocks.listStoredArtistRows.mockResolvedValue([]);
    mocks.listStoredArtistRowsByEvent.mockResolvedValue([]);

    const [{ GET: getEvents }, { GET: getArtists }] = await Promise.all([
      import('../app/api/events/route'),
      import('../app/api/artists/route'),
    ]);
    const eventsResponse = await getEvents(new Request('https://terminal.test/api/events'));
    const artistsResponse = await getArtists(new Request(
      'https://terminal.test/api/artists?eventId=event-1',
    ));

    expect(eventsResponse.status).toBe(200);
    expect(eventsResponse.headers.get('cache-control')).toBe('no-store');
    expect(await eventsResponse.json()).toEqual([]);
    expect(artistsResponse.status).toBe(200);
    expect(artistsResponse.headers.get('cache-control')).toBe('no-store');
    expect(await artistsResponse.json()).toEqual([]);
    expect(mocks.listStoredEventRows).toHaveBeenCalledWith({ database: true });
    expect(mocks.listStoredArtistRows).toHaveBeenCalledWith({ database: true });
    expect(mocks.listStoredArtistRowsByEvent).toHaveBeenCalledWith(
      { database: true },
      'event-1',
    );
  });
});
