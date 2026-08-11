import { describe, expect, it } from 'vitest';
import { readJsonBody } from '../lib/api/guards';
import {
  isBoolean,
  isJsonObject,
  parsePositiveInteger,
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
