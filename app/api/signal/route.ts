import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { signal } from "@/lib/db/schema";
import { readJsonBody } from "@/lib/api/guards";
import { hasOnlyKeys, isBoolean, isString } from "@/lib/api/validation";
import { generateId } from "@/lib/utils/id";

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
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const instagram = body.instagram.trim();
    const consent = body.consent;

    // 1. 필수 필드 검증
    if (!email || !instagram) {
      return NextResponse.json({ error: "ALL_FIELDS_REQUIRED" }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "CONSENT_REQUIRED" }, { status: 400 });
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "INVALID_EMAIL_FORMAT" }, { status: 400 });
    }
    const cleanInstagram = instagram.replace(/^@/, "");
    if (cleanInstagram.length === 0 || cleanInstagram.length > 30 || !/^[\w.]+$/.test(cleanInstagram)) {
      return NextResponse.json({ error: "INVALID_INSTAGRAM_FORMAT" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = getDb(env.DB);

    // The unique email index is the concurrency boundary for subscriptions.
    const id = generateId('sig');
    const createdAt = new Date().toISOString();

    const created = await db
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

    if (!created) {
      return NextResponse.json({ error: "EMAIL_ALREADY_SUBSCRIBED" }, { status: 409 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/signal] error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
