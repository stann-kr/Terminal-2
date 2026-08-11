import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { artists, events } from "@/lib/db/schema";
import { getEventDateTime, withEffectiveEventStatus } from "@/lib/eventLifecycle";
import type { TerminalEvent } from "@/lib/eventData";


/**
 * GET /api/events
 * 전체 이벤트 목록을 아티스트 포함하여 반환함.
 *
 * @query status - "UPCOMING" | "LIVE" | "ARCHIVED" (선택, 없으면 전체 반환)
 */
export async function GET(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const db = getDb(env.DB);

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    // 이벤트 전체 조회
    const eventRows = await db.select().from(events).all();

    // 아티스트 전체 조회 후 메모리 그룹핑 (N+1 방지)
    const allArtistRows = await db.select().from(artists).all();
    const artistsByEventId = allArtistRows.reduce<
      Record<string, typeof allArtistRows>
    >((acc, row) => {
      if (!acc[row.eventId]) acc[row.eventId] = [];
      acc[row.eventId].push(row);
      return acc;
    }, {});

    // data JSON 파싱 후 클라이언트가 기대하는 TerminalEvent 형태로 변환
    const now = new Date();
    const result = eventRows
      .map((row) => {
        const eventData = JSON.parse(row.data) as Record<string, unknown>;
        const eventArtists = (artistsByEventId[row.id] ?? []).map((a) => {
          const { guestCode: _gc, ...artistData } = JSON.parse(a.data as string) as Record<string, unknown>;
          return { id: a.id, eventId: a.eventId, ...artistData };
        });
        const event = { id: row.id, ...eventData, artists: eventArtists } as unknown as TerminalEvent;
        return withEffectiveEventStatus(event, now);
      })
      .filter((event) => (statusFilter ? event.status === statusFilter : true));

    if (statusFilter === "UPCOMING") {
      result.sort((a, b) => getEventDateTime(a).getTime() - getEventDateTime(b).getTime());
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/events] error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
