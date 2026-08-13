import { NextResponse } from 'next/server';

export const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' } as const;

export function noStoreJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}
