import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { signal } from "@/lib/db/schema";
import { generateId } from "@/lib/utils/id";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;

    const email = (body?.email as string | undefined)?.trim().toLowerCase() ?? "";
    const instagram = (body?.instagram as string | undefined)?.trim() ?? "";
    const consent = Boolean(body?.consent);

    // 1. 필수 필드 검증
    if (!email || !instagram) {
      return NextResponse.json({ error: "ALL_FIELDS_REQUIRED" }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "CONSENT_REQUIRED" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "INVALID_EMAIL_FORMAT" }, { status: 400 });
    }
    const cleanInstagram = instagram.replace(/^@/, "");
    if (cleanInstagram.length === 0 || cleanInstagram.length > 30 || !/^[\w.]+$/.test(cleanInstagram)) {
      return NextResponse.json({ error: "INVALID_INSTAGRAM_FORMAT" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = getDb(env.DB);

    // 2. 이메일 중복 확인
    const existing = await db
      .select({ id: signal.id })
      .from(signal)
      .where(eq(signal.email, email))
      .get();

    if (existing) {
      return NextResponse.json({ error: "EMAIL_ALREADY_SUBSCRIBED" }, { status: 409 });
    }

    // 3. DB INSERT
    const id = generateId('sig');
    const createdAt = new Date().toISOString();

    await db.insert(signal).values({
      id,
      name: null,
      email,
      instagram,
      source: 'signal',
      createdAt,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/signal] error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
