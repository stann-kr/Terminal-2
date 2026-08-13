import { describe, expect, it } from 'vitest';
import {
  ACCESS_REQUEST_INSERT_SQL,
  MARKETING_INSERT_SQL,
  classifyRejectedAccessRequest,
  createAccessRequestAtomically,
  inspectArtistAccessData,
  normalizeAccessCode,
  parseArtistAccessData,
  parseGateRequestBody,
  parseUpcomingEventCandidate,
} from '../lib/gate/createAccessRequest';

const validBody = {
  accessCode: '  ARTIST-01  ',
  invitedBy: '  spoofed name  ',
  name: '  Guest Name  ',
  email: '  GUEST@EXAMPLE.COM  ',
  instagram: '@guest.name',
  privacyConsent: true,
  marketingConsent: false,
};

describe('gate request runtime validation', () => {
  it('normalizes a valid payload without coercing values', () => {
    expect(parseGateRequestBody(validBody)).toEqual({
      ok: true,
      input: {
        accessCode: 'ARTIST-01',
        name: 'Guest Name',
        email: 'guest@example.com',
        instagram: '@guest.name',
        privacyConsent: true,
        marketingConsent: false,
      },
    });
  });

  it.each([
    ['string privacy consent', { ...validBody, privacyConsent: 'true' }],
    ['string false marketing consent', { ...validBody, marketingConsent: 'false' }],
    ['numeric email', { ...validBody, email: 123 }],
    ['object access code', { ...validBody, accessCode: { value: 'ARTIST-01' } }],
    ['unknown key', { ...validBody, role: 'admin' }],
  ])('rejects %s before database access', (_label, body) => {
    expect(parseGateRequestBody(body)).toEqual({ ok: false, error: 'INVALID_INPUT' });
  });

  it('does not treat a false privacy boolean as consent', () => {
    expect(parseGateRequestBody({ ...validBody, privacyConsent: false })).toEqual({
      ok: false,
      error: 'PRIVACY_CONSENT_REQUIRED',
    });
  });

  it('defaults omitted optional marketing consent to false', () => {
    const { marketingConsent: _marketingConsent, ...body } = validBody;
    const result = parseGateRequestBody(body);

    expect(result.ok && result.input.marketingConsent).toBe(false);
  });
});

describe('artist access data validation', () => {
  it('uses one trim and case-folding contract for all access-code checks', () => {
    expect(normalizeAccessCode('  Artist-Code-01  ')).toBe('ARTIST-CODE-01');
  });

  it('accepts a bounded integer capacity and trims server-owned inviter data', () => {
    expect(parseArtistAccessData(JSON.stringify({
      guestCode: ' CODE-1 ',
      guestLimit: 25,
      name: ' Artist Name ',
    }))).toEqual({ guestCode: 'CODE-1', guestLimit: 25, name: 'Artist Name' });
  });

  it('distinguishes missing access configuration from malformed configured data', () => {
    expect(inspectArtistAccessData(JSON.stringify({ name: 'Public Artist' }))).toEqual({
      kind: 'unconfigured',
    });
    expect(inspectArtistAccessData(JSON.stringify({ guestCode: 'CODE', name: 'Artist' }))).toEqual({
      kind: 'invalid',
    });
  });

  it.each([
    '{',
    JSON.stringify({ guestCode: 123, guestLimit: 1 }),
    JSON.stringify({ guestCode: 'CODE', guestLimit: '1' }),
    JSON.stringify({ guestCode: 'CODE', guestLimit: -1 }),
    JSON.stringify({ guestCode: 'CODE', guestLimit: 1.5 }),
    JSON.stringify({ guestCode: 'CODE', guestLimit: 10_001 }),
    JSON.stringify({ guestCode: 'CODE', name: 'Artist' }),
    JSON.stringify({ guestCode: 'CODE', guestLimit: 1 }),
    JSON.stringify({ guestCode: 'CODE', guestLimit: 1, name: '' }),
  ])('fails closed for malformed artist JSON: %s', (data) => {
    expect(parseArtistAccessData(data)).toBeNull();
  });

  it('fails closed for malformed or elapsed event lifecycle JSON', () => {
    const now = new Date('2026-08-11T12:00:00+09:00');

    expect(parseUpcomingEventCandidate('bad', '{', now)).toBeNull();
    expect(parseUpcomingEventCandidate(
      'elapsed',
      JSON.stringify({ date: '2026-08-10', time: '23:00 KST', status: 'UPCOMING' }),
      now,
    )).toBeNull();
    expect(parseUpcomingEventCandidate(
      'future',
      JSON.stringify({ date: '2026-08-12', time: '23:00 KST', status: 'UPCOMING' }),
      now,
    )?.rowId).toBe('future');
  });
});

describe('atomic access request statement contract', () => {
  const atomicInput = {
    id: 'req-1',
    signalId: 'sig-1',
    eventId: 'event-1',
    artistId: 'artist-1',
    invitedBy: 'Artist Name',
    name: 'Guest Name',
    email: 'guest@example.com',
    instagram: '@guest',
    privacyConsent: true as const,
    marketingConsent: true,
    guestLimit: 25,
    createdAt: '2026-08-11T00:00:00.000Z',
  };

  function createDatabaseStub(
    changes: number,
    rejectionState: { is_duplicate: number; guest_count: number } | null = null,
  ) {
    const prepared: Array<{ sql: string; values: unknown[] }> = [];
    const database = {
      prepare(sql: string) {
        const entry = { sql, values: [] as unknown[] };
        prepared.push(entry);
        const statement = {
          bind(...values: unknown[]) {
            entry.values = values;
            return statement;
          },
        };
        return statement;
      },
      async batch(statements: unknown[]) {
        expect(statements).toHaveLength(3);
        return [
          { success: true, meta: { changes }, results: [] },
          { success: true, meta: { changes: 0 }, results: [] },
          {
            success: true,
            meta: { changes: 0 },
            results: rejectionState ? [rejectionState] : [],
          },
        ];
      },
    } as unknown as Pick<D1Database, 'prepare' | 'batch'>;

    return { database, prepared };
  }

  it('checks duplicate email and capacity inside the request insert statement', () => {
    expect(ACCESS_REQUEST_INSERT_SQL).toMatch(/WHERE NOT EXISTS[\s\S]*event_id = \? AND email = \?/);
    expect(ACCESS_REQUEST_INSERT_SQL).toMatch(/SELECT COUNT\(\*\)[\s\S]*event_id = \? AND artist_id = \?/);
    expect(ACCESS_REQUEST_INSERT_SQL).toContain('ON CONFLICT(event_id, email) DO NOTHING');
  });

  it('only inserts marketing after the request id exists and tolerates subscriber conflicts', () => {
    expect(MARKETING_INSERT_SQL).toMatch(/EXISTS[\s\S]*FROM access_requests[\s\S]*WHERE id = \?/);
    expect(MARKETING_INSERT_SQL).toContain('ON CONFLICT(email) DO NOTHING');
  });

  it('classifies duplicate email before capacity', () => {
    expect(classifyRejectedAccessRequest({ is_duplicate: 1, guest_count: 25 }, 25)).toBe('duplicate');
  });

  it('classifies a full capacity when the email is new', () => {
    expect(classifyRejectedAccessRequest({ is_duplicate: 0, guest_count: 25 }, 25)).toBe(
      'guest_limit_reached',
    );
  });

  it('raises an invariant error for an unexplained zero-change insert', () => {
    expect(() => classifyRejectedAccessRequest({ is_duplicate: 0, guest_count: 0 }, null)).toThrow(
      /without a matching constraint/,
    );
  });

  it('treats only the first batch result as access request creation', async () => {
    const { database, prepared } = createDatabaseStub(1);

    await expect(createAccessRequestAtomically(database, atomicInput)).resolves.toEqual({
      status: 'created',
    });
    expect(prepared).toHaveLength(3);
    expect(prepared[0].sql).toBe(ACCESS_REQUEST_INSERT_SQL);
    expect(prepared[1].sql).toBe(MARKETING_INSERT_SQL);
  });

  it('runs the follow-up classifier after a duplicate zero-change insert', async () => {
    const { database, prepared } = createDatabaseStub(0, { is_duplicate: 1, guest_count: 1 });

    await expect(createAccessRequestAtomically(database, atomicInput)).resolves.toEqual({
      status: 'duplicate',
    });
    expect(prepared).toHaveLength(3);
    expect(prepared[2].values).toEqual([
      atomicInput.eventId,
      atomicInput.email,
      atomicInput.eventId,
      atomicInput.artistId,
    ]);
  });

  it('runs the follow-up classifier after a capacity zero-change insert', async () => {
    const { database } = createDatabaseStub(0, { is_duplicate: 0, guest_count: 25 });

    await expect(createAccessRequestAtomically(database, atomicInput)).resolves.toEqual({
      status: 'guest_limit_reached',
    });
  });
});
