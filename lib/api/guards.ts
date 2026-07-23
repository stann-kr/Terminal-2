import { NextResponse } from 'next/server';

const JSON_CONTENT_TYPE = 'application/json';

export type JsonGuardResult<T> =
  | { ok: true; body: T }
  | { ok: false; response: NextResponse };

export async function readJsonBody<T = Record<string, unknown>>(
  request: Request,
  maxBytes = 16_384,
): Promise<JsonGuardResult<T>> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes(JSON_CONTENT_TYPE)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'UNSUPPORTED_CONTENT_TYPE' }, { status: 415 }),
    };
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength && Number(contentLength) > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'PAYLOAD_TOO_LARGE' }, { status: 413 }),
    };
  }

  let text = '';
  try {
    text = await request.text();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }),
    };
  }

  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'PAYLOAD_TOO_LARGE' }, { status: 413 }),
    };
  }

  try {
    return { ok: true, body: JSON.parse(text) as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }),
    };
  }
}
