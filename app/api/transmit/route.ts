import { getCloudflareContext } from "@opennextjs/cloudflare";
import { desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { transmitLogs } from "@/lib/db/schema";
import { readJsonBody } from "@/lib/api/guards";
import { hasOnlyKeys, isString, parsePositiveInteger } from "@/lib/api/validation";
import { toPublicTransmitLog } from "@/lib/api/publicDtos";

const PAGE_SIZE = 5;
const MAX_PAGE = 1_000;

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
    const pageParam = searchParams.get("page");
    const page = pageParam === null ? 1 : parsePositiveInteger(pageParam, MAX_PAGE);
    if (page === null) {
      return NextResponse.json({ error: "INVALID_PAGE" }, { status: 400 });
    }
    const offset = (page - 1) * PAGE_SIZE;

    const { env } = getCloudflareContext();
    const db = getDb(env.DB);

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(transmitLogs)
      .all();

    const logs = await db
      .select({
        id: transmitLogs.id,
        handle: transmitLogs.handle,
        message: transmitLogs.message,
        ts: transmitLogs.ts,
        createdAt: transmitLogs.createdAt,
      })
      .from(transmitLogs)
      .orderBy(desc(transmitLogs.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset)
      .all();

    return NextResponse.json({
      logs: logs.map(toPublicTransmitLog),
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
 */
export async function POST(request: Request) {
  try {
    const parsed = await readJsonBody(request, 8_192);
    if (!parsed.ok) return parsed.response;
    const body = parsed.body;
    if (!hasOnlyKeys(body, ["handle", "message"]) || !isString(body.handle) || !isString(body.message)) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const rawHandle = body.handle;
    const rawMessage = body.message;

    const handle = rawHandle.trim().replace(/\s+/g, "_").toUpperCase();
    const message = rawMessage.trim();

    if (!handle) return NextResponse.json({ error: "HANDLE_REQUIRED" }, { status: 400 });
    if (handle.length > 24) return NextResponse.json({ error: "HANDLE_TOO_LONG" }, { status: 400 });
    if (!message) return NextResponse.json({ error: "MESSAGE_REQUIRED" }, { status: 400 });
    if (message.length > 280) return NextResponse.json({ error: "MESSAGE_TOO_LONG" }, { status: 400 });

    const now = new Date();
    const id = crypto.randomUUID();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const ts = `${kst.getUTCFullYear()}.${String(kst.getUTCMonth() + 1).padStart(2, "0")}.${String(kst.getUTCDate()).padStart(2, "0")} / ${String(kst.getUTCHours()).padStart(2, "0")}:${String(kst.getUTCMinutes()).padStart(2, "0")}`;

    const { env } = getCloudflareContext();
    const db = getDb(env.DB);

    const newLog = { id, handle, message, ts, createdAt: now.toISOString() };
    await db.insert(transmitLogs).values(newLog);

    return NextResponse.json(toPublicTransmitLog(newLog), { status: 201 });
  } catch (error) {
    console.error("[POST /api/transmit] error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
