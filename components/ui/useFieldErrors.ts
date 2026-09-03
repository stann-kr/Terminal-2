'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type FieldErrorMap<Field extends string> = Partial<Record<Field, string>>;

export function useFieldErrors<Field extends string>(fieldIdPrefix: string) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap<Field>>({});
  const focusFrameRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
  }, []);

  const clearFieldError = useCallback((field: Field) => {
    setFieldErrors(current => {
      if (!current[field]) return current;
      const remaining = { ...current };
      delete remaining[field];
      return remaining;
    });
  }, []);

  const showFieldErrors = useCallback((errors: FieldErrorMap<Field>) => {
    setFieldErrors(errors);
    const firstField = Object.keys(errors)[0] as Field | undefined;
    if (!firstField) return;

    if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
    focusFrameRef.current = requestAnimationFrame(() => {
      document.getElementById(`${fieldIdPrefix}-${firstField}`)?.focus();
      focusFrameRef.current = null;
    });
  }, [fieldIdPrefix]);

  return {
    fieldErrors,
    setFieldErrors,
    clearFieldError,
    showFieldErrors,
  };
}
