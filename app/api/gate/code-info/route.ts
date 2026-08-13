import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/guards";
import { hasOnlyKeys, isString } from "@/lib/api/validation";
import { getDb } from "@/lib/db/client";
import { artists, events } from "@/lib/db/schema";
import { getEventDateTime } from "@/lib/eventLifecycle";
import {
  normalizeAccessCode,
  parseArtistAccessData,
  parseUpcomingEventCandidate,
  type UpcomingEventCandidate,
} from "@/lib/gate/createAccessRequest";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

function json(body: { name: string | null } | { error: string }, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

/**
 * POST /api/gate/code-info
 * 인증 코드에 매칭되는 아티스트 이름을 반환함 (초대인 자동 완성용).
 * guestCode 자체는 노출하지 않으며, 코드 유효 여부도 명시하지 않음.
 *
 * @body code - 인증 코드
 * @returns { name: string | null }; returns a no-store 500 error when verification is unavailable
 */
export async function POST(request: Request) {
  try {
    const parsed = await readJsonBody(request, 1_024);
    if (!parsed.ok) {
      parsed.response.headers.set("Cache-Control", "no-store");
      return parsed.response;
    }

    if (!hasOnlyKeys(parsed.body, ["code"]) || !isString(parsed.body.code)) {
      return json({ error: "INVALID_INPUT" }, 400);
    }

    const code = parsed.body.code.trim();

    if (code.length > 64) {
      return json({ error: "INVALID_INPUT" }, 400);
    }

    if (!code) {
      return json({ name: null });
    }

    const { env } = getCloudflareContext();
    const db = getDb(env.DB);

    // UPCOMING 이벤트 조회
    const eventRows = await db.select().from(events).all();
    const now = new Date();
    const upcomingEvent = eventRows
      .map((row) => parseUpcomingEventCandidate(row.id, row.data, now))
      .filter((candidate): candidate is UpcomingEventCandidate => candidate !== null)
      .sort(
        (a, b) => getEventDateTime(a.lifecycle).getTime() - getEventDateTime(b.lifecycle).getTime(),
      )[0];

    if (!upcomingEvent) {
      return json({ name: null });
    }

    // 해당 이벤트의 artists 중 guestCode 매칭
    const artistRows = await db
      .select()
      .from(artists)
      .where(eq(artists.eventId, upcomingEvent.rowId))
      .all();

    const normalizedCode = normalizeAccessCode(code);
    const matchingArtists = artistRows.flatMap((row) => {
      const data = parseArtistAccessData(row.data);
      return data && normalizeAccessCode(data.guestCode) === normalizedCode ? [{ row, data }] : [];
    });

    if (matchingArtists.length !== 1) {
      return json({ name: null });
    }

    return json({ name: matchingArtists[0].data.name });
  } catch {
    console.error("[POST /api/gate/code-info] internal error");
    return json({ error: "INTERNAL_SERVER_ERROR" }, 500);
  }
}
