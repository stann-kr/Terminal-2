import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createAccessRequestAtomically: vi.fn(),
  createSignalSubscription: vi.fn(),
  enforceRateLimit: vi.fn(),
  getCloudflareContext: vi.fn(),
  getDb: vi.fn(),
  generateId: vi.fn(),
  listGateArtistRowsByEvent: vi.fn(),
  listGateEventRows: vi.fn(),
}));

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: mocks.getCloudflareContext,
}));
vi.mock('@/lib/api/abuseControl', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
}));
vi.mock('@/lib/db/client', () => ({ getDb: mocks.getDb }));
vi.mock('@/lib/utils/id', () => ({ generateId: mocks.generateId }));
vi.mock('@/lib/gate/d1AccessRequestRepository', () => ({
  createAccessRequestAtomically: mocks.createAccessRequestAtomically,
}));
vi.mock('@/lib/gate/d1GateReadRepository', () => ({
  listGateArtistRowsByEvent: mocks.listGateArtistRowsByEvent,
  listGateEventRows: mocks.listGateEventRows,
}));
vi.mock('@/lib/signal/createSignalSubscription', () => ({
  createSignalSubscription: mocks.createSignalSubscription,
}));

const requestBody = {
  accessCode: 'ARTIST-01',
  name: 'Guest Name',
  email: 'guest@example.com',
  instagram: '@guest.name',
  privacyConsent: true,
  marketingConsent: false,
};

async function responseDetails(response: Response) {
  return {
    status: response.status,
    cacheControl: response.headers.get('cache-control'),
    body: await response.json(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  mocks.getCloudflareContext.mockReturnValue({ env: { DB: {} } });
  mocks.getDb.mockReturnValue({ database: true });
  mocks.enforceRateLimit.mockResolvedValue({ ok: true });
  mocks.generateId.mockReturnValue('generated-id');
  mocks.listGateEventRows.mockResolvedValue([{
    id: 'event-1',
    data: JSON.stringify({ date: '2026-08-20', time: '23:00 KST', status: 'UPCOMING' }),
  }]);
  mocks.listGateArtistRowsByEvent.mockResolvedValue([{
    id: 'artist-1',
    data: JSON.stringify({
      guestCode: 'ARTIST-01', guestLimit: 10, name: 'Artist Name',
    }),
  }]);
});

describe('opaque public success responses', () => {
  it('returns the same Gate request response for created and duplicate submissions', async () => {
    const { POST } = await import('../app/api/gate/request/route');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T12:00:00+09:00'));

    mocks.createAccessRequestAtomically.mockResolvedValueOnce({ status: 'created' });
    const created = await responseDetails(await POST(new Request('https://terminal.test/api/gate/request', {
      method: 'POST', body: JSON.stringify(requestBody), headers: { 'content-type': 'application/json' },
    })));
    mocks.createAccessRequestAtomically.mockResolvedValueOnce({ status: 'duplicate' });
    const duplicate = await responseDetails(await POST(new Request('https://terminal.test/api/gate/request', {
      method: 'POST', body: JSON.stringify(requestBody), headers: { 'content-type': 'application/json' },
    })));

    expect(created).toEqual({ status: 200, cacheControl: 'no-store', body: { ok: true } });
    expect(duplicate).toEqual(created);
    expect(mocks.listGateEventRows).toHaveBeenCalledWith({ database: true });
    expect(mocks.listGateArtistRowsByEvent).toHaveBeenCalledWith(
      { database: true },
      'event-1',
    );
    expect(mocks.createAccessRequestAtomically).toHaveBeenLastCalledWith(
      {},
      expect.objectContaining({ eventId: 'event-1', artistId: 'artist-1' }),
    );
    vi.useRealTimers();
  });

  it('does not read artists or write a request when no upcoming event exists', async () => {
    const { POST } = await import('../app/api/gate/request/route');
    mocks.listGateEventRows.mockResolvedValue([]);

    const response = await responseDetails(await POST(new Request(
      'https://terminal.test/api/gate/request',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'content-type': 'application/json' },
      },
    )));

    expect(response).toEqual({
      status: 404,
      cacheControl: 'no-store',
      body: { error: 'NO_UPCOMING_EVENT' },
    });
    expect(mocks.listGateArtistRowsByEvent).not.toHaveBeenCalled();
    expect(mocks.createAccessRequestAtomically).not.toHaveBeenCalled();
  });

  it('returns only the matched artist name from the code-info route', async () => {
    const { POST } = await import('../app/api/gate/code-info/route');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T12:00:00+09:00'));

    const response = await responseDetails(await POST(new Request(
      'https://terminal.test/api/gate/code-info',
      {
        method: 'POST',
        body: JSON.stringify({ code: 'artist-01' }),
        headers: { 'content-type': 'application/json' },
      },
    )));

    expect(response).toEqual({
      status: 200,
      cacheControl: 'no-store',
      body: { name: 'Artist Name' },
    });
    expect(mocks.listGateArtistRowsByEvent).toHaveBeenCalledWith(
      { database: true },
      'event-1',
    );
  });

  it('returns an opaque empty result without reading artists when no Gate event exists', async () => {
    const { POST } = await import('../app/api/gate/code-info/route');
    mocks.listGateEventRows.mockResolvedValue([]);

    const response = await responseDetails(await POST(new Request(
      'https://terminal.test/api/gate/code-info',
      {
        method: 'POST',
        body: JSON.stringify({ code: 'ARTIST-01' }),
        headers: { 'content-type': 'application/json' },
      },
    )));

    expect(response).toEqual({
      status: 200,
      cacheControl: 'no-store',
      body: { name: null },
    });
    expect(mocks.listGateArtistRowsByEvent).not.toHaveBeenCalled();
  });

  it('fails closed when stored artist access data is malformed', async () => {
    const { POST } = await import('../app/api/gate/code-info/route');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T12:00:00+09:00'));
    mocks.listGateArtistRowsByEvent.mockResolvedValue([{
      id: 'artist-1',
      data: JSON.stringify({ guestCode: 'ARTIST-01', name: 'Broken Artist' }),
    }]);

    const response = await responseDetails(await POST(new Request(
      'https://terminal.test/api/gate/code-info',
      {
        method: 'POST',
        body: JSON.stringify({ code: 'ARTIST-01' }),
        headers: { 'content-type': 'application/json' },
      },
    )));

    expect(response).toEqual({
      status: 503,
      cacheControl: 'no-store',
      body: { error: 'VERIFICATION_UNAVAILABLE' },
    });
  });

  it('returns the same Signal response for created and duplicate subscriptions', async () => {
    const { POST } = await import('../app/api/signal/route');
    mocks.createSignalSubscription.mockResolvedValueOnce({ status: 'created' });
    const created = await responseDetails(await POST(new Request('https://terminal.test/api/signal', {
      method: 'POST',
      body: JSON.stringify({ email: 'guest@example.com', instagram: '@guest.name', consent: true }),
      headers: { 'content-type': 'application/json' },
    })));
    mocks.createSignalSubscription.mockResolvedValueOnce({ status: 'duplicate' });
    const duplicate = await responseDetails(await POST(new Request('https://terminal.test/api/signal', {
      method: 'POST',
      body: JSON.stringify({ email: 'guest@example.com', instagram: '@guest.name', consent: true }),
      headers: { 'content-type': 'application/json' },
    })));

    expect(created).toEqual({ status: 200, cacheControl: 'no-store', body: { ok: true } });
    expect(duplicate).toEqual(created);
  });
});
