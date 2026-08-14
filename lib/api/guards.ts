import { NextResponse } from 'next/server';
import { isJsonObject, type JsonObject } from './validation';

const JSON_CONTENT_TYPE = 'application/json';

export type JsonGuardResult<T> =
  | { ok: true; body: T }
  | { ok: false; response: NextResponse };

function errorResponse(error: string, status: number): NextResponse {
  return NextResponse.json(
    { error },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

export function isJsonContentType(value: string | null): boolean {
  const mediaType = (value ?? '').split(';', 1)[0].trim().toLowerCase();
  return mediaType === JSON_CONTENT_TYPE;
}

async function readBoundedBytes(request: Request, maxBytes: number): Promise<Uint8Array | null> {
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel('payload too large');
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function readJsonBody<T extends JsonObject = JsonObject>(
  request: Request,
  maxBytes = 16_384,
): Promise<JsonGuardResult<T>> {
  if (!isJsonContentType(request.headers.get('content-type'))) {
    return { ok: false, response: errorResponse('UNSUPPORTED_CONTENT_TYPE', 415) };
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) {
      return { ok: false, response: errorResponse('INVALID_CONTENT_LENGTH', 400) };
    }
    if (Number(contentLength) > maxBytes) {
      return { ok: false, response: errorResponse('PAYLOAD_TOO_LARGE', 413) };
    }
  }

  let bytes: Uint8Array | null;
  try {
    bytes = await readBoundedBytes(request, maxBytes);
  } catch {
    return { ok: false, response: errorResponse('INVALID_JSON', 400) };
  }
  if (bytes === null) {
    return { ok: false, response: errorResponse('PAYLOAD_TOO_LARGE', 413) };
  }

  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, response: errorResponse('INVALID_JSON', 400) };
  }

  try {
    const body: unknown = JSON.parse(text);
    if (!isJsonObject(body)) {
      return { ok: false, response: errorResponse('INVALID_JSON', 400) };
    }
    return { ok: true, body: body as T };
  } catch {
    return { ok: false, response: errorResponse('INVALID_JSON', 400) };
  }
}
