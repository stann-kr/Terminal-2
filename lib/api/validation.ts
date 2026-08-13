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

export function parseEnumQuery<T extends string>(
  searchParams: URLSearchParams,
  key: string,
  allowed: ReadonlySet<T>,
): T | null | undefined {
  const values = searchParams.getAll(key);
  if (values.length === 0) return undefined;
  if (values.length !== 1 || !allowed.has(values[0] as T)) return null;
  return values[0] as T;
}

export function parseIdentifierQuery(
  searchParams: URLSearchParams,
  key: string,
  maxLength = 64,
): string | null | undefined {
  const values = searchParams.getAll(key);
  if (values.length === 0) return undefined;
  if (values.length !== 1) return null;
  const value = values[0].trim();
  return value.length > 0 && value.length <= maxLength && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value)
    ? value
    : null;
}
