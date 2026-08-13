import { describe, expect, it, vi } from 'vitest';
import { safeLogError } from '../lib/api/safeLog';

describe('PII-safe structured logging', () => {
  it('redacts sensitive fields and does not serialize Error messages', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    safeLogError('signal.failed', {
      email: 'guest@example.com',
      nested: { token: 'secret-token', safe: 'route-name' },
      error: new Error('query included guest@example.com'),
    });

    const output = String(errorSpy.mock.calls[0][0]);
    expect(output).toContain('signal.failed');
    expect(output).toContain('route-name');
    expect(output).not.toContain('guest@example.com');
    expect(output).not.toContain('secret-token');
    errorSpy.mockRestore();
  });
});
