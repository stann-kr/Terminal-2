import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { signal } from "@/lib/db/schema";
import { readJsonBody } from "@/lib/api/guards";
import { hasOnlyKeys, isBoolean, isString } from "@/lib/api/validation";
import { generateId } from "@/lib/utils/id";
import { enforceRateLimit } from "@/lib/api/abuseControl";
import { safeLogError } from "@/lib/api/safeLog";
import { noStoreJson } from "@/lib/api/responses";

export async function POST(request: Request) {
  try {
    const parsed = await readJsonBody<Record<string, unknown>>(request, 8_192);
    if (!parsed.ok) return parsed.response;
    const body = parsed.body;

    if (
      !hasOnlyKeys(body, ["email", "instagram", "consent"])
      || !isString(body.email)
      || !isString(body.instagram)
      || !isBoolean(body.consent)
    ) {
      return noStoreJson({ error: "INVALID_INPUT" }, 400);
    }

    const email = body.email.trim().toLowerCase();
    const instagram = body.instagram.trim();
    const consent = body.consent;

    // 1. 필수 필드 검증
    if (!email || !instagram) {
      return noStoreJson({ error: "ALL_FIELDS_REQUIRED" }, 400);
    }
    if (!consent) {
      return noStoreJson({ error: "CONSENT_REQUIRED" }, 400);
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return noStoreJson({ error: "INVALID_EMAIL_FORMAT" }, 400);
    }
    const cleanInstagram = instagram.replace(/^@/, "");
    if (cleanInstagram.length === 0 || cleanInstagram.length > 30 || !/^[\w.]+$/.test(cleanInstagram)) {
      return noStoreJson({ error: "INVALID_INSTAGRAM_FORMAT" }, 400);
    }

    const { env } = getCloudflareContext();
    const abuseDecision = await enforceRateLimit(env, 'signal', request);
    if (!abuseDecision.ok) {
      return noStoreJson({ error: abuseDecision.error }, abuseDecision.status);
    }
    const db = getDb(env.DB);

    // The unique email index is the concurrency boundary for subscriptions.
    const id = generateId('sig');
    const createdAt = new Date().toISOString();

    await db
      .insert(signal)
      .values({
        id,
        name: null,
        email,
        instagram,
        source: 'signal',
        createdAt,
      })
      .onConflictDoNothing({ target: signal.email })
      .returning({ id: signal.id })
      .get();

    return noStoreJson({ ok: true });
  } catch (error) {
    safeLogError('signal.create_failed', { error });
    return noStoreJson({ error: "INTERNAL_SERVER_ERROR" }, 500);
  }
}
