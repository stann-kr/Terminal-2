import { describe, expect, it } from 'vitest';
import { isJsonContentType, readJsonBody } from '../lib/api/guards';
import {
  isBoolean,
  isJsonObject,
  parsePositiveInteger,
  parseEnumQuery,
  parseIdentifierQuery,
} from '../lib/api/validation';

describe('public API runtime validation', () => {
  it.each([null, [], 'text', 42, false])('does not treat %j as a JSON object', (value) => {
    expect(isJsonObject(value)).toBe(false);
  });

  it('accepts only top-level JSON objects in request bodies', async () => {
    const bodies = ['null', '[]', '"text"', '42', 'false'];

    for (const body of bodies) {
      const result = await readJsonBody(new Request('https://terminal.test/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }));

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(400);
    }
  });

  it('parses the JSON media type exactly', () => {
    expect(isJsonContentType('application/json')).toBe(true);
    expect(isJsonContentType('Application/JSON; charset=utf-8')).toBe(true);
    expect(isJsonContentType('text/application/json')).toBe(false);
    expect(isJsonContentType('application/jsonp')).toBe(false);
  });

  it('stops reading a streaming request after the byte limit', async () => {
    const request = new Request('https://terminal.test/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{"value":"'));
          controller.enqueue(new Uint8Array(64).fill(97));
          controller.enqueue(new TextEncoder().encode('"}'));
          controller.close();
        },
      }),
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });

    const result = await readJsonBody(request, 32);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it('validates enum and identifier query parameters without duplicates', () => {
    const statuses = new Set(['UPCOMING', 'LIVE'] as const);
    expect(parseEnumQuery(new URLSearchParams('status=UPCOMING'), 'status', statuses)).toBe('UPCOMING');
    expect(parseEnumQuery(new URLSearchParams('status=INVALID'), 'status', statuses)).toBeNull();
    expect(parseEnumQuery(new URLSearchParams('status=LIVE&status=UPCOMING'), 'status', statuses)).toBeNull();
    expect(parseIdentifierQuery(new URLSearchParams('eventId=TRM-02'), 'eventId')).toBe('TRM-02');
    expect(parseIdentifierQuery(new URLSearchParams('eventId=../../secret'), 'eventId')).toBeNull();
  });

  it('does not coerce boolean-like values', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean('false')).toBe(false);
    expect(isBoolean(1)).toBe(false);
    expect(isBoolean({})).toBe(false);
  });

  it('accepts bounded positive integer query parameters only', () => {
    expect(parsePositiveInteger('1', 1_000)).toBe(1);
    expect(parsePositiveInteger('1000', 1_000)).toBe(1_000);
    expect(parsePositiveInteger(null, 1_000)).toBeNull();
    expect(parsePositiveInteger('0', 1_000)).toBeNull();
    expect(parsePositiveInteger('-1', 1_000)).toBeNull();
    expect(parsePositiveInteger('1.5', 1_000)).toBeNull();
    expect(parsePositiveInteger('1e3', 1_000)).toBeNull();
    expect(parsePositiveInteger('1001', 1_000)).toBeNull();
    expect(parsePositiveInteger('9007199254740992', Number.MAX_SAFE_INTEGER)).toBeNull();
  });
});
