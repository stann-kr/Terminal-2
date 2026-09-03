import { getTableConfig } from 'drizzle-orm/sqlite-core';
import { describe, expect, it } from 'vitest';
import { accessRequests, signal } from '../lib/db/schema';

function uniqueIndexColumns(
  table: Parameters<typeof getTableConfig>[0],
): Record<string, Array<string | null>> {
  return Object.fromEntries(
    getTableConfig(table)
      .indexes
      .filter((index) => index.config.unique)
      .map((index) => [
        index.config.name,
        index.config.columns.map((column) => ('name' in column ? column.name : null)),
      ]),
  );
}

describe('D1 schema concurrency boundaries', () => {
  it('declares the unique indexes required by Gate and Signal conflict handling', () => {
    expect(uniqueIndexColumns(accessRequests)).toMatchObject({
      access_requests_event_email_idx: ['event_id', 'email'],
    });
    expect(uniqueIndexColumns(signal)).toMatchObject({
      signal_email_idx: ['email'],
    });
  });
});
