import { hasOnlyKeys, isBoolean, isJsonObject, isString } from '../api/validation';
import type { EventStatus, TerminalEvent } from '../eventData';
import { getEffectiveEventStatus, getEventDateTime } from '../eventLifecycle';

const MAX_ACCESS_CODE_LENGTH = 64;
const MAX_EMAIL_LENGTH = 254;
const MAX_GUEST_LIMIT = 10_000;
const REQUEST_KEYS = [
  'accessCode',
  'invitedBy',
  'name',
  'email',
  'instagram',
  'privacyConsent',
  'marketingConsent',
] as const;

export interface GateRequestInput {
  accessCode: string;
  name: string;
  email: string;
  instagram: string;
  privacyConsent: true;
  marketingConsent: boolean;
}

export type ParseGateRequestResult =
  | { ok: true; input: GateRequestInput }
  | { ok: false; error: string };

export interface ArtistAccessData {
  guestCode: string;
  guestLimit: number;
  name: string;
}

export type ArtistAccessInspection =
  | { kind: 'unconfigured' }
  | { kind: 'invalid' }
  | { kind: 'configured'; data: ArtistAccessData };

export interface UpcomingEventCandidate {
  rowId: string;
  lifecycle: Pick<TerminalEvent, 'date' | 'time' | 'status'>;
}

const EVENT_STATUSES = new Set<EventStatus>(['UPCOMING', 'LIVE', 'ARCHIVED']);

export function normalizeAccessCode(code: string): string {
  return code.trim().toUpperCase();
}

export function parseUpcomingEventCandidate(
  rowId: string,
  rawData: string,
  now: Date,
): UpcomingEventCandidate | null {
  let data: unknown;
  try {
    data = JSON.parse(rawData);
  } catch {
    return null;
  }

  if (
    !isJsonObject(data)
    || !isString(data.date)
    || !isString(data.time)
    || !isString(data.status)
    || !EVENT_STATUSES.has(data.status as EventStatus)
  ) {
    return null;
  }

  const lifecycle: UpcomingEventCandidate['lifecycle'] = {
    date: data.date,
    time: data.time,
    status: data.status as EventStatus,
  };

  if (
    !Number.isFinite(getEventDateTime(lifecycle).getTime())
    || getEffectiveEventStatus(lifecycle, now) !== 'UPCOMING'
  ) {
    return null;
  }

  return { rowId, lifecycle };
}

export function parseGateRequestBody(body: Record<string, unknown>): ParseGateRequestResult {
  if (!hasOnlyKeys(body, REQUEST_KEYS)) {
    return { ok: false, error: 'INVALID_INPUT' };
  }
  if (
    !isString(body.name)
    || !isString(body.email)
    || !isString(body.instagram)
    || !isString(body.accessCode)
  ) {
    return { ok: false, error: 'INVALID_INPUT' };
  }
  if (body.invitedBy !== undefined && !isString(body.invitedBy)) {
    return { ok: false, error: 'INVALID_INPUT' };
  }
  if (!isBoolean(body.privacyConsent)) {
    return { ok: false, error: 'INVALID_INPUT' };
  }
  if (body.marketingConsent !== undefined && !isBoolean(body.marketingConsent)) {
    return { ok: false, error: 'INVALID_INPUT' };
  }

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();
  const instagram = body.instagram.trim();
  const accessCode = body.accessCode.trim();
  const invitedBy = body.invitedBy?.trim() || null;

  if (!name || !email || !instagram || !accessCode) {
    return { ok: false, error: 'ALL_FIELDS_REQUIRED' };
  }
  if (!body.privacyConsent) {
    return { ok: false, error: 'PRIVACY_CONSENT_REQUIRED' };
  }
  if (
    name.length > 100
    || email.length > MAX_EMAIL_LENGTH
    || accessCode.length > MAX_ACCESS_CODE_LENGTH
    || (invitedBy?.length ?? 0) > 100
  ) {
    return { ok: false, error: 'INVALID_INPUT' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'INVALID_EMAIL_FORMAT' };
  }

  const cleanInstagram = instagram.replace(/^@/, '');
  if (
    cleanInstagram.length === 0
    || cleanInstagram.length > 30
    || !/^[\w.]+$/.test(cleanInstagram)
  ) {
    return { ok: false, error: 'INVALID_INSTAGRAM_FORMAT' };
  }

  return {
    ok: true,
    input: {
      accessCode,
      name,
      email,
      instagram,
      privacyConsent: true,
      marketingConsent: body.marketingConsent ?? false,
    },
  };
}

export function inspectArtistAccessData(rawData: string): ArtistAccessInspection {
  let data: unknown;
  try {
    data = JSON.parse(rawData);
  } catch {
    return { kind: 'invalid' };
  }

  if (!isJsonObject(data)) return { kind: 'invalid' };
  if (!Object.hasOwn(data, 'guestCode')) return { kind: 'unconfigured' };
  if (!isString(data.guestCode)) return { kind: 'invalid' };

  const guestCode = data.guestCode.trim();
  if (!guestCode || guestCode.length > MAX_ACCESS_CODE_LENGTH) {
    return { kind: 'invalid' };
  }

  if (
    typeof data.guestLimit !== 'number'
    || !Number.isSafeInteger(data.guestLimit)
    || data.guestLimit < 0
    || data.guestLimit > MAX_GUEST_LIMIT
  ) {
    return { kind: 'invalid' };
  }

  if (!isString(data.name)) {
    return { kind: 'invalid' };
  }

  const name = data.name.trim();
  if (!name || name.length > 100) return { kind: 'invalid' };

  return { kind: 'configured', data: { guestCode, guestLimit: data.guestLimit, name } };
}

export function parseArtistAccessData(rawData: string): ArtistAccessData | null {
  const inspected = inspectArtistAccessData(rawData);
  return inspected.kind === 'configured' ? inspected.data : null;
}

export const ACCESS_REQUEST_INSERT_SQL = `
  INSERT INTO access_requests (
    id,
    event_id,
    artist_id,
    invited_by,
    name,
    email,
    instagram,
    privacy_consent,
    marketing_consent,
    created_at
  )
  SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  WHERE NOT EXISTS (
    SELECT 1
    FROM access_requests
    WHERE event_id = ? AND email = ?
  )
  AND (
    ? IS NULL
    OR (
      SELECT COUNT(*)
      FROM access_requests
      WHERE event_id = ? AND artist_id = ?
    ) < ?
  )
  ON CONFLICT(event_id, email) DO NOTHING
`;

export const MARKETING_INSERT_SQL = `
  INSERT INTO signal (
    id,
    name,
    email,
    instagram,
    source,
    created_at
  )
  SELECT ?, ?, ?, ?, 'gate', ?
  WHERE ? = 1
    AND EXISTS (
      SELECT 1
      FROM access_requests
      WHERE id = ?
    )
  ON CONFLICT(email) DO NOTHING
`;

const REJECTION_STATE_SQL = `
  SELECT
    EXISTS (
      SELECT 1
      FROM access_requests
      WHERE event_id = ? AND email = ?
    ) AS is_duplicate,
    (
      SELECT COUNT(*)
      FROM access_requests
      WHERE event_id = ? AND artist_id = ?
    ) AS guest_count
`;

export interface AtomicAccessRequestInput {
  id: string;
  signalId: string;
  eventId: string;
  artistId: string;
  invitedBy: string | null;
  name: string;
  email: string;
  instagram: string;
  privacyConsent: true;
  marketingConsent: boolean;
  guestLimit: number | null;
  createdAt: string;
}

export type AtomicAccessRequestResult =
  | { status: 'created' }
  | { status: 'duplicate' }
  | { status: 'guest_limit_reached' };

interface RejectionStateRow {
  is_duplicate: number | boolean;
  guest_count: number;
}

function parseRejectionState(row: unknown): RejectionStateRow | null {
  if (
    !isJsonObject(row)
    || (row.is_duplicate !== true
      && row.is_duplicate !== false
      && row.is_duplicate !== 0
      && row.is_duplicate !== 1)
    || typeof row.guest_count !== 'number'
    || !Number.isSafeInteger(row.guest_count)
    || row.guest_count < 0
  ) {
    return null;
  }

  return {
    is_duplicate: row.is_duplicate,
    guest_count: row.guest_count,
  };
}

export function classifyRejectedAccessRequest(
  row: RejectionStateRow | null,
  guestLimit: number | null,
): Exclude<AtomicAccessRequestResult['status'], 'created'> {
  if (row && (row.is_duplicate === true || row.is_duplicate === 1)) {
    return 'duplicate';
  }

  if (guestLimit !== null && row && row.guest_count >= guestLimit) {
    return 'guest_limit_reached';
  }

  throw new Error('Conditional access request insert was rejected without a matching constraint');
}

function getChanges(result: D1Result<unknown> | undefined): number {
  const changes = result?.meta.changes;
  return typeof changes === 'number' ? changes : 0;
}

/**
 * Keeps the capacity check, access request insert, and optional signal insert
 * in one D1 transaction. The database's existing unique indexes remain the
 * final authority for email idempotency.
 */
export async function createAccessRequestAtomically(
  database: Pick<D1Database, 'prepare' | 'batch'>,
  input: AtomicAccessRequestInput,
): Promise<AtomicAccessRequestResult> {
  const accessRequestStatement = database.prepare(ACCESS_REQUEST_INSERT_SQL).bind(
    input.id,
    input.eventId,
    input.artistId,
    input.invitedBy,
    input.name,
    input.email,
    input.instagram,
    input.privacyConsent ? 1 : 0,
    input.marketingConsent ? 1 : 0,
    input.createdAt,
    input.eventId,
    input.email,
    input.guestLimit,
    input.eventId,
    input.artistId,
    input.guestLimit,
  );

  const marketingStatement = database.prepare(MARKETING_INSERT_SQL).bind(
    input.signalId,
    input.name,
    input.email,
    input.instagram,
    input.createdAt,
    input.marketingConsent ? 1 : 0,
    input.id,
  );

  const rejectionStateStatement = database.prepare(REJECTION_STATE_SQL).bind(
    input.eventId,
    input.email,
    input.eventId,
    input.artistId,
  );

  const [accessRequestResult, , rejectionStateResult] = await database.batch([
    accessRequestStatement,
    marketingStatement,
    rejectionStateStatement,
  ]);

  if (getChanges(accessRequestResult) === 1) {
    return { status: 'created' };
  }

  return {
    status: classifyRejectedAccessRequest(
      parseRejectionState(rejectionStateResult?.results[0]),
      input.guestLimit,
    ),
  };
}
