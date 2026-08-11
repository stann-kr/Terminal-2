/** Runtime validators for untrusted public API input. */
export type JsonObject = Record<string, unknown>;

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Parses a positive, base-10 integer query parameter without accepting
 * partial values such as `1abc`, decimals, or unbounded offsets.
 */
export function parsePositiveInteger(value: string | null, max: number): number | null {
  if (value === null || !/^[1-9]\d*$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= max ? parsed : null;
}

export function hasOnlyKeys(object: JsonObject, allowedKeys: readonly string[]): boolean {
  return Object.keys(object).every((key) => allowedKeys.includes(key));
}
