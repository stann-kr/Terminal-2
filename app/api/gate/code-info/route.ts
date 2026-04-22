import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { artists, events } from "@/lib/db/schema";

/**
 * GET /api/gate/code-info?code=XXX
 * 인증 코드에 매칭되는 아티스트 이름을 반환함 (초대인 자동 완성용).
 * guestCode 자체는 노출하지 않으며, 코드 유효 여부도 명시하지 않음.
 *
 * @query code - 인증 코드
 * @returns { name: string | null }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim();

    if (!code) {
      return NextResponse.json({ name: null });
    }

    const { env } = getCloudflareContext();
    const db = getDb(env.DB);

    // UPCOMING 이벤트 조회
    const eventRows = await db.select().from(events).all();
    const upcomingRow = eventRows.find((row) => {
      const data = JSON.parse(row.data) as Record<string, unknown>;
      return data.status === "UPCOMING";
    });

    if (!upcomingRow) {
      return NextResponse.json({ name: null });
    }

    // 해당 이벤트의 artists 중 guestCode 매칭
    const artistRows = await db
      .select()
      .from(artists)
      .where(eq(artists.eventId, upcomingRow.id))
      .all();

    type ArtistData = { name?: string; guestCode?: string };
    const normalizedCode = code.toUpperCase();
    const matched = artistRows.find((a) => {
      const data = JSON.parse(a.data) as ArtistData;
      return data.guestCode?.toUpperCase() === normalizedCode;
    });

    if (!matched) {
      return NextResponse.json({ name: null });
    }

    const { name } = JSON.parse(matched.data) as ArtistData;
    return NextResponse.json({ name: name ?? null });
  } catch (error) {
    console.error("[GET /api/gate/code-info] error:", error);
    return NextResponse.json({ name: null });
  }
}
