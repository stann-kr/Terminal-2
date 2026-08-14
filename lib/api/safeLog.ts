const SENSITIVE_KEYS = new Set([
  'accessCode',
  'authorization',
  'code',
  'cookie',
  'email',
  'instagram',
  'message',
  'name',
  'password',
  'secret',
  'token',
]);

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 3) return '[TRUNCATED]';
  if (value instanceof Error) return { name: value.name };
  if (Array.isArray(value)) return value.slice(0, 10).map((entry) => sanitize(entry, depth + 1));
  if (typeof value !== 'object' || value === null) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      SENSITIVE_KEYS.has(key) ? '[REDACTED]' : sanitize(entry, depth + 1),
    ]),
  );
}

export function safeLogError(event: string, context: Record<string, unknown> = {}): void {
  console.error(JSON.stringify({ level: 'error', event, ...sanitize(context) as Record<string, unknown> }));
}
