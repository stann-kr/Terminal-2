import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, and, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { accessRequests, artists, events } from "@/lib/db/schema";

const MS_IN_DAY = 86_400_000;
const ACCESS_WINDOW_DAYS = 30;

/**
 * POST /api/gate/request
 * 게스트 액세스 신청을 저장함.
 *
 * @body name             - 신청자 이름
 * @body email            - 이메일 (이벤트 내 중복 불가)
 * @body instagram        - 인스타그램 아이디
 * @body accessCode       - DJ별 인증 코드 (artists.data.guestCode와 대조)
 * @body privacyConsent   - 개인정보 수집 동의 (boolean)
 * @body marketingConsent - 마케팅 수신 동의 (boolean, 선택)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;

    const name = (body?.name as string | undefined)?.trim() ?? "";
    const email = (body?.email as string | undefined)?.trim().toLowerCase() ?? "";
    const instagram = (body?.instagram as string | undefined)?.trim() ?? "";
    const accessCode = (body?.accessCode as string | undefined)?.trim() ?? "";
    const invitedBy = (body?.invitedBy as string | undefined)?.trim() || null;
    const privacyConsent = Boolean(body?.privacyConsent);
    const marketingConsent = Boolean(body?.marketingConsent);

    // 1. 필수 필드 검증
    if (!name || !email || !instagram || !accessCode) {
      return NextResponse.json({ error: "ALL_FIELDS_REQUIRED" }, { status: 400 });
    }
    if (!privacyConsent) {
      return NextResponse.json({ error: "PRIVACY_CONSENT_REQUIRED" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "INVALID_EMAIL_FORMAT" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = getDb(env.DB);

    // 2. UPCOMING 이벤트 조회
    const eventRows = await db.select().from(events).all();
    const upcomingRow = eventRows.find((row) => {
      const data = JSON.parse(row.data) as Record<string, unknown>;
      return data.status === "UPCOMING";
    });

    if (!upcomingRow) {
      return NextResponse.json({ error: "NO_UPCOMING_EVENT" }, { status: 404 });
    }

    const eventData = JSON.parse(upcomingRow.data) as { date: string; time: string };
    const eventDate = new Date(`${eventData.date}T00:00:00`);
    const daysUntil = (eventDate.getTime() - Date.now()) / MS_IN_DAY;

    // 3. 30일 이내 접수 기간 확인
    if (daysUntil < 0 || daysUntil > ACCESS_WINDOW_DAYS) {
      return NextResponse.json({ error: "REQUEST_PERIOD_INACTIVE" }, { status: 403 });
    }

    // 4. accessCode로 해당 이벤트의 아티스트 조회 (guestCode 매칭)
    const artistRows = await db
      .select()
      .from(artists)
      .where(eq(artists.eventId, upcomingRow.id))
      .all();

    type ArtistData = { guestCode?: string; guestLimit?: number };
    const matchedArtist = artistRows.find((a) => {
      const data = JSON.parse(a.data) as ArtistData;
      return data.guestCode && data.guestCode === accessCode;
    });

    if (!matchedArtist) {
      return NextResponse.json({ error: "INVALID_ACCESS_CODE" }, { status: 401 });
    }

    // 5. 게스트 리밋 확인
    const artistData = JSON.parse(matchedArtist.data) as ArtistData;
    if (artistData.guestLimit !== undefined) {
      const [{ count: guestCount }] = await db
        .select({ count: count() })
        .from(accessRequests)
        .where(
          and(
            eq(accessRequests.eventId, upcomingRow.id),
            eq(accessRequests.artistId, matchedArtist.id)
          )
        );

      if (guestCount >= artistData.guestLimit) {
        return NextResponse.json({ error: "GUEST_LIMIT_REACHED" }, { status: 409 });
      }
    }

    // 6. 이메일 중복 확인 (동일 이벤트 내)
    const existing = await db
      .select({ id: accessRequests.id })
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.eventId, upcomingRow.id),
          eq(accessRequests.email, email)
        )
      )
      .get();

    if (existing) {
      return NextResponse.json({ error: "EMAIL_ALREADY_REGISTERED" }, { status: 409 });
    }

    // 7. DB INSERT
    const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = new Date().toISOString();

    await db.insert(accessRequests).values({
      id,
      eventId: upcomingRow.id,
      artistId: matchedArtist.id,
      invitedBy,
      name,
      email,
      instagram,
      privacyConsent,
      marketingConsent,
      createdAt,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/gate/request] error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
