import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/guards";
import { getDb } from "@/lib/db/client";
import { artists, events } from "@/lib/db/schema";
import {
  getEventDateTime,
  getRequestWindowState,
} from "@/lib/eventLifecycle";
import {
  createAccessRequestAtomically,
  normalizeAccessCode,
  parseArtistAccessData,
  parseGateRequestBody,
  parseUpcomingEventCandidate,
  type UpcomingEventCandidate,
} from "@/lib/gate/createAccessRequest";
import { generateId } from "@/lib/utils/id";

const ACCESS_WINDOW_DAYS = 30;
/** POST /api/gate/request */
export async function POST(request: Request) {
  try {
    const parsed = await readJsonBody(request, 16_384);
    if (!parsed.ok) return parsed.response;

    const requestInput = parseGateRequestBody(parsed.body);
    if (!requestInput.ok) {
      return NextResponse.json({ error: requestInput.error }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = getDb(env.DB);
    const now = new Date();

    const eventRows = await db.select().from(events).all();
    const upcomingEvent = eventRows
      .map((row) => parseUpcomingEventCandidate(row.id, row.data, now))
      .filter((candidate): candidate is UpcomingEventCandidate => candidate !== null)
      .sort(
        (a, b) => getEventDateTime(a.lifecycle).getTime() - getEventDateTime(b.lifecycle).getTime(),
      )[0];

    if (!upcomingEvent) {
      return NextResponse.json({ error: "NO_UPCOMING_EVENT" }, { status: 404 });
    }
    if (!getRequestWindowState(upcomingEvent.lifecycle, ACCESS_WINDOW_DAYS, now).isActive) {
      return NextResponse.json({ error: "REQUEST_PERIOD_INACTIVE" }, { status: 403 });
    }

    const artistRows = await db
      .select()
      .from(artists)
      .where(eq(artists.eventId, upcomingEvent.rowId))
      .all();
    const normalizedCode = normalizeAccessCode(requestInput.input.accessCode);
    const matchingArtists = artistRows.flatMap((row) => {
      const data = parseArtistAccessData(row.data);
      return data && normalizeAccessCode(data.guestCode) === normalizedCode ? [{ row, data }] : [];
    });

    if (matchingArtists.length !== 1) {
      return NextResponse.json({ error: "INVALID_ACCESS_CODE" }, { status: 401 });
    }

    const [{ row: matchedArtist, data: artistData }] = matchingArtists;
    const result = await createAccessRequestAtomically(env.DB, {
      id: generateId("req"),
      signalId: generateId("sig"),
      eventId: upcomingEvent.rowId,
      artistId: matchedArtist.id,
      invitedBy: artistData.name,
      name: requestInput.input.name,
      email: requestInput.input.email,
      instagram: requestInput.input.instagram,
      privacyConsent: requestInput.input.privacyConsent,
      marketingConsent: requestInput.input.marketingConsent,
      guestLimit: artistData.guestLimit,
      createdAt: now.toISOString(),
    });

    if (result.status === "duplicate") {
      return NextResponse.json({ error: "EMAIL_ALREADY_REGISTERED" }, { status: 409 });
    }
    if (result.status === "guest_limit_reached") {
      return NextResponse.json({ error: "GUEST_LIMIT_REACHED" }, { status: 409 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    console.error("[POST /api/gate/request] internal error");
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
