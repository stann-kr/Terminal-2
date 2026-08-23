import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { readJsonBody } from "@/lib/api/guards";
import { enforceRateLimit } from "@/lib/api/abuseControl";
import { noStoreJson } from "@/lib/api/responses";
import { hasOnlyKeys, isString } from "@/lib/api/validation";
import { getDb } from "@/lib/db/client";
import { artists, events } from "@/lib/db/schema";
import {
  findUpcomingGateEvent,
  resolveArtistAccessCode,
} from "@/lib/gate/createAccessRequest";

function json(body: { name: string | null } | { error: string }, status = 200) {
  return noStoreJson(body, status);
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
    const abuseDecision = await enforceRateLimit(env, 'code-info', request);
    if (!abuseDecision.ok) return json({ error: abuseDecision.error }, abuseDecision.status);
    const db = getDb(env.DB);

    const eventRows = await db.select().from(events).all();
    const now = new Date();
    const upcomingEvent = findUpcomingGateEvent(eventRows, now);

    if (!upcomingEvent) {
      return json({ name: null });
    }

    const artistRows = await db
      .select()
      .from(artists)
      .where(eq(artists.eventId, upcomingEvent.rowId))
      .all();

    const accessCodeResult = resolveArtistAccessCode(artistRows, code);
    if (accessCodeResult.kind === 'unavailable') {
      return json({ error: "VERIFICATION_UNAVAILABLE" }, 503);
    }
    if (accessCodeResult.kind === 'not_found') {
      return json({ name: null });
    }

    return json({ name: accessCodeResult.data.name });
  } catch {
    console.error("[POST /api/gate/code-info] internal error");
    return json({ error: "VERIFICATION_UNAVAILABLE" }, 503);
  }
}
