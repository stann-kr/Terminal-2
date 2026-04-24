import { getCloudflareContext } from "@opennextjs/cloudflare";
import { desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { transmitLogs } from "@/lib/db/schema";

const PAGE_SIZE = 5;

/**
 * GET /api/transmit?page=1
 * 방명록 목록을 최신순으로 페이지 단위로 반환함.
 *
 * @query page - 페이지 번호 (1-indexed, 기본값 1)
 * @returns { logs, total, page, totalPages }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const offset = (page - 1) * PAGE_SIZE;

    const { env } = getCloudflareContext();
    const db = getDb(env.DB);

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(transmitLogs)
      .all();

    const logs = await db
      .select()
      .from(transmitLogs)
      .orderBy(desc(transmitLogs.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset)
      .all();

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error("[GET /api/transmit] error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * POST /api/transmit
 * 방명록에 새 항목을 추가함.
 *
 * @body handle   - 방문자 별칭 (1–24자, 공백 → 언더스코어, 대문자 저장)
 * @body message  - 방문자 메시지 (1–280자)
 * @body deviceId - NODE-ID 원본 (alias 변경과 무관하게 사용자 특정용)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, string>;
    const rawHandle: string = body?.handle ?? "";
    const rawMessage: string = body?.message ?? "";
    const deviceId: string = body?.deviceId ?? "";

    const handle = rawHandle.trim().replace(/\s+/g, "_").toUpperCase();
    const message = rawMessage.trim();

    if (!handle) return NextResponse.json({ error: "HANDLE_REQUIRED" }, { status: 400 });
    if (handle.length > 24) return NextResponse.json({ error: "HANDLE_TOO_LONG" }, { status: 400 });
    if (!message) return NextResponse.json({ error: "MESSAGE_REQUIRED" }, { status: 400 });
    if (message.length > 280) return NextResponse.json({ error: "MESSAGE_TOO_LONG" }, { status: 400 });

    const now = new Date();
    const id = String(now.getTime());
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const ts = `${kst.getUTCFullYear()}.${String(kst.getUTCMonth() + 1).padStart(2, "0")}.${String(kst.getUTCDate()).padStart(2, "0")} / ${String(kst.getUTCHours()).padStart(2, "0")}:${String(kst.getUTCMinutes()).padStart(2, "0")}`;

    const { env } = getCloudflareContext();
    const db = getDb(env.DB);

    const newLog = { id, handle, message, ts, createdAt: now.toISOString(), deviceId: deviceId || null };
    await db.insert(transmitLogs).values(newLog);

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    console.error("[POST /api/transmit] error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
