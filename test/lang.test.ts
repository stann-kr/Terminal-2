import { describe, expect, it } from 'vitest';
import { parseLang } from '../lib/lang';

describe('language persistence contract', () => {
  it('accepts only supported language values', () => {
    expect(parseLang('ko')).toBe('ko');
    expect(parseLang('en')).toBe('en');
  });

  it.each([null, undefined, '', 'EN', 'ja', 1, {}])('falls back to Korean for invalid value %j', (value) => {
    expect(parseLang(value)).toBe('ko');
  });
});
