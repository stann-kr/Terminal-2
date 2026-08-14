'use client';

import { useCallback, useSyncExternalStore } from 'react';

const QUERY_STATE_EVENT = 'terminal-query-state';

export function buildQuerySelectionUrl(currentUrl: string, key: string, value: string): string {
  const url = new URL(currentUrl, 'https://terminal.local');
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Keeps lightweight selectors in browser history without changing route structure. */
export function useUrlQueryState(key: string): [string, (value: string) => void] {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener('popstate', onStoreChange);
    window.addEventListener(QUERY_STATE_EVENT, onStoreChange);
    return () => {
      window.removeEventListener('popstate', onStoreChange);
      window.removeEventListener(QUERY_STATE_EVENT, onStoreChange);
    };
  }, []);
  const getSnapshot = useCallback(
    () => new URLSearchParams(window.location.search).get(key) ?? '',
    [key],
  );
  const value = useSyncExternalStore(subscribe, getSnapshot, () => '');

  const update = useCallback((nextValue: string) => {
    const nextUrl = buildQuerySelectionUrl(window.location.href, key, nextValue);
    window.history.pushState(null, '', nextUrl);
    window.dispatchEvent(new Event(QUERY_STATE_EVENT));
  }, [key]);

  return [value, update];
}
