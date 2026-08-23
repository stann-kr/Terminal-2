import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createAccessRequestAtomically: vi.fn(),
  enforceRateLimit: vi.fn(),
  getCloudflareContext: vi.fn(),
  getDb: vi.fn(),
  generateId: vi.fn(),
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

const requestBody = {
  accessCode: 'ARTIST-01',
  name: 'Guest Name',
  email: 'guest@example.com',
  instagram: '@guest.name',
  privacyConsent: true,
  marketingConsent: false,
};

function createGateDb() {
  let selectCount = 0;
  return {
    select() {
      selectCount += 1;
      return {
        from() {
          if (selectCount === 1) {
            return {
              all: async () => [{
                id: 'event-1',
                data: JSON.stringify({ date: '2026-08-20', time: '23:00 KST', status: 'UPCOMING' }),
              }],
            };
          }
          return {
            where() {
              return {
                all: async () => [{
                  id: 'artist-1',
                  data: JSON.stringify({
                    guestCode: 'ARTIST-01', guestLimit: 10, name: 'Artist Name',
                  }),
                }],
              };
            },
          };
        },
      };
    },
  };
}

async function responseDetails(response: Response) {
  return {
    status: response.status,
    cacheControl: response.headers.get('cache-control'),
    body: await response.json(),
  };
}

describe('opaque public success responses', () => {
  it('returns the same Gate request response for created and duplicate submissions', async () => {
    const { POST } = await import('../app/api/gate/request/route');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T12:00:00+09:00'));
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: {} } });
    mocks.enforceRateLimit.mockResolvedValue({ ok: true });
    mocks.generateId.mockReturnValue('generated-id');
    mocks.getDb.mockImplementation(createGateDb);

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
    vi.useRealTimers();
  });

  it('returns the same Signal response for created and duplicate subscriptions', async () => {
    const { POST } = await import('../app/api/signal/route');
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: {} } });
    mocks.enforceRateLimit.mockResolvedValue({ ok: true });
    mocks.generateId.mockReturnValue('generated-id');

    function createSignalDb(created: { id: string } | undefined) {
      return {
        insert() {
          return {
            values() {
              return {
                onConflictDoNothing() {
                  return {
                    returning() {
                      return { get: async () => created };
                    },
                  };
                },
              };
            },
          };
        },
      };
    }

    mocks.getDb.mockReturnValueOnce(createSignalDb({ id: 'signal-1' }));
    const created = await responseDetails(await POST(new Request('https://terminal.test/api/signal', {
      method: 'POST',
      body: JSON.stringify({ email: 'guest@example.com', instagram: '@guest.name', consent: true }),
      headers: { 'content-type': 'application/json' },
    })));
    mocks.getDb.mockReturnValueOnce(createSignalDb(undefined));
    const duplicate = await responseDetails(await POST(new Request('https://terminal.test/api/signal', {
      method: 'POST',
      body: JSON.stringify({ email: 'guest@example.com', instagram: '@guest.name', consent: true }),
      headers: { 'content-type': 'application/json' },
    })));

    expect(created).toEqual({ status: 200, cacheControl: 'no-store', body: { ok: true } });
    expect(duplicate).toEqual(created);
  });
});
