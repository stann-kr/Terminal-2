import { getCloudflareContext } from "@opennextjs/cloudflare";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { transmitLogs } from "@/lib/db/schema";
import { readJsonBody } from "@/lib/api/guards";
import { hasOnlyKeys, isString, parsePositiveInteger } from "@/lib/api/validation";
import { toPublicTransmitLog } from "@/lib/api/publicDtos";
import { enforceRateLimit } from "@/lib/api/abuseControl";
import { safeLogError } from "@/lib/api/safeLog";
import { noStoreJson } from "@/lib/api/responses";
import {
  createTransmitId,
  moderateTransmitInput,
  parseIdempotencyKey,
} from "@/lib/transmit/idempotency";

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
      return noStoreJson({ error: "INVALID_PAGE" }, 400);
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

    return noStoreJson({
      logs: logs.map(toPublicTransmitLog),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    safeLogError('transmit.list_failed', { error });
    return noStoreJson({ error: "INTERNAL_SERVER_ERROR" }, 500);
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
      return noStoreJson({ error: "INVALID_INPUT" }, 400);
    }

    const rawHandle = body.handle;
    const rawMessage = body.message;

    const handle = rawHandle.trim().replace(/\s+/g, "_").toUpperCase();
    const message = rawMessage.trim();
    const idempotencyKey = parseIdempotencyKey(request.headers);

    if (!handle) return noStoreJson({ error: "HANDLE_REQUIRED" }, 400);
    if (handle.length > 24) return noStoreJson({ error: "HANDLE_TOO_LONG" }, 400);
    if (!message) return noStoreJson({ error: "MESSAGE_REQUIRED" }, 400);
    if (message.length > 280) return noStoreJson({ error: "MESSAGE_TOO_LONG" }, 400);
    if (!idempotencyKey) {
      return noStoreJson({ error: "IDEMPOTENCY_KEY_REQUIRED" }, 400);
    }
    if (!moderateTransmitInput(handle, message).allowed) {
      return noStoreJson({ error: "CONTENT_REJECTED" }, 400);
    }

    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const ts = `${kst.getUTCFullYear()}.${String(kst.getUTCMonth() + 1).padStart(2, "0")}.${String(kst.getUTCDate()).padStart(2, "0")} / ${String(kst.getUTCHours()).padStart(2, "0")}:${String(kst.getUTCMinutes()).padStart(2, "0")}`;

    const { env } = getCloudflareContext();
    const abuseDecision = await enforceRateLimit(env, 'transmit', request);
    if (!abuseDecision.ok) {
      return noStoreJson({ error: abuseDecision.error }, abuseDecision.status);
    }
    const db = getDb(env.DB);

    const newLog = { id: createTransmitId(idempotencyKey), handle, message, ts, createdAt: now.toISOString() };
    const created = await db
      .insert(transmitLogs)
      .values(newLog)
      .onConflictDoNothing({ target: transmitLogs.id })
      .returning({ id: transmitLogs.id })
      .get();

    if (!created) {
      const existing = await db
        .select({
          id: transmitLogs.id,
          handle: transmitLogs.handle,
          message: transmitLogs.message,
          ts: transmitLogs.ts,
          createdAt: transmitLogs.createdAt,
        })
        .from(transmitLogs)
        .where(eq(transmitLogs.id, newLog.id))
        .get();
      if (existing && existing.handle === handle && existing.message === message) {
        return noStoreJson(toPublicTransmitLog(existing));
      }
      return noStoreJson({ error: "IDEMPOTENCY_CONFLICT" }, 409);
    }

    return noStoreJson(toPublicTransmitLog(newLog), 201);
  } catch (error) {
    safeLogError('transmit.create_failed', { error });
    return noStoreJson({ error: "INTERNAL_SERVER_ERROR" }, 500);
  }
}
