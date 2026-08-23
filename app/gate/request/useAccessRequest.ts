'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useFieldErrors, type FieldErrorMap } from '@/components/ui/useFieldErrors';
import { useLang, useT } from '@/lib/langContext';
import {
  resolveCodeVerificationState,
  resolveRequestEventState,
  type CodeVerificationState,
  type RequestEventState,
} from './requestState';
import { ACCESS_WINDOW_DAYS } from '@/lib/gate/requestPolicy';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTAGRAM_PATTERN = /^@?[\w.]+$/;

interface AccessRequestFormState {
  accessCode: string;
  name: string;
  email: string;
  instagram: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
}

type TextField = 'name' | 'email';
export type RequestField = 'accessCode' | TextField | 'instagram' | 'privacyConsent';

const INITIAL_FORM: AccessRequestFormState = {
  accessCode: '',
  name: '',
  email: '',
  instagram: '',
  privacyConsent: false,
  marketingConsent: false,
};

export function useAccessRequest() {
  const { lang } = useLang();
  const t = useT();
  const [eventState, setEventState] = useState<RequestEventState>({ kind: 'loading' });
  const [eventRequestVersion, setEventRequestVersion] = useState(0);
  const [form, setForm] = useState<AccessRequestFormState>(INITIAL_FORM);
  const [codeState, setCodeState] = useState<CodeVerificationState>({ kind: 'idle' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { fieldErrors, setFieldErrors, clearFieldError, showFieldErrors } = useFieldErrors<RequestField>('request');
  const [formError, setFormError] = useState('');

  const submittingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verificationAbortRef = useRef<AbortController | null>(null);
  const verificationSequenceRef = useRef(0);

  const isCodeVerified = codeState.kind === 'verified';
  const event = eventState.kind === 'ready' || eventState.kind === 'inactive'
    ? eventState.event
    : null;
  const invitationLines = event?.invitationLines?.[lang] ?? t.request.invitationLines;

  const verifyCode = useCallback((code: string) => {
    const normalizedCode = code.trim();
    const sequence = ++verificationSequenceRef.current;

    verificationAbortRef.current?.abort();
    if (!normalizedCode) {
      setCodeState({ kind: 'idle' });
      return;
    }

    const controller = new AbortController();
    verificationAbortRef.current = controller;
    setCodeState({ kind: 'verifying' });

    void fetch('/api/gate/code-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: normalizedCode }),
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = response.ok
          ? await response.json() as { name?: string | null }
          : undefined;
        return resolveCodeVerificationState({
          ok: response.ok,
          status: response.status,
          name: data?.name,
        });
      })
      .then((nextState) => {
        if (sequence !== verificationSequenceRef.current) return;
        setCodeState(nextState);
        if (nextState.kind === 'verified') clearFieldError('accessCode');
      })
      .catch(() => {
        if (sequence !== verificationSequenceRef.current || controller.signal.aborted) return;
        setCodeState({ kind: 'unavailable' });
      });
  }, [clearFieldError]);

  useEffect(() => {
    const controller = new AbortController();
    setEventState({ kind: 'loading' });

    void fetch('/api/events?status=UPCOMING', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Request event fetch failed');
        const data = await response.json() as unknown;
        if (!Array.isArray(data)) throw new Error('Request event response was not an array');
        return data;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setEventState(resolveRequestEventState(data, ACCESS_WINDOW_DAYS));
      })
      .catch(() => {
        if (!controller.signal.aborted) setEventState({ kind: 'load-error' });
      });

    return () => controller.abort();
  }, [eventRequestVersion]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    verificationAbortRef.current?.abort();
  }, []);

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const code = event.target.value;
    setForm(previous => ({ ...previous, accessCode: code }));
    clearFieldError('accessCode');
    ++verificationSequenceRef.current;
    verificationAbortRef.current?.abort();
    setCodeState(code.trim() ? { kind: 'verifying' } : { kind: 'idle' });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => verifyCode(code), 500);
  };

  const handleTextChange = (field: TextField) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm(previous => ({ ...previous, [field]: event.target.value }));
    clearFieldError(field);
  };

  const handleInstagramChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/^@+/, '');
    setForm(previous => ({ ...previous, instagram: raw ? `@${raw}` : '' }));
    clearFieldError('instagram');
  };

  const handlePrivacyConsentChange = (checked: boolean) => {
    setForm(previous => ({ ...previous, privacyConsent: checked }));
    clearFieldError('privacyConsent');
  };

  const handleMarketingConsentChange = (checked: boolean) => {
    setForm(previous => ({ ...previous, marketingConsent: checked }));
  };

  const validateForm = (): FieldErrorMap<RequestField> => {
    const errors: FieldErrorMap<RequestField> = {};
    if (!isCodeVerified) {
      errors.accessCode = codeState.kind === 'unavailable'
        ? t.request.codeVerificationUnavailable
        : t.request.errors.INVALID_ACCESS_CODE;
    }
    if (!form.name.trim()) errors.name = t.request.errors.ALL_FIELDS_REQUIRED;
    if (!form.email.trim()) errors.email = t.request.errors.ALL_FIELDS_REQUIRED;
    else if (!EMAIL_PATTERN.test(form.email.trim())) {
      errors.email = t.request.errors.INVALID_EMAIL_FORMAT;
    }
    if (!form.instagram.trim()) errors.instagram = t.request.errors.ALL_FIELDS_REQUIRED;
    else if (!INSTAGRAM_PATTERN.test(form.instagram.trim())) {
      errors.instagram = t.request.errors.INVALID_INSTAGRAM_FORMAT;
    }
    if (!form.privacyConsent) {
      errors.privacyConsent = t.request.errors.PRIVACY_CONSENT_REQUIRED;
    }
    return errors;
  };

  const applyApiError = (errorKey: string) => {
    const message = t.request.errors[errorKey as keyof typeof t.request.errors]
      ?? t.request.errors.TRANSMISSION_FAILED;
    const fieldByError: Partial<Record<string, RequestField>> = {
      INVALID_ACCESS_CODE: 'accessCode',
      INVALID_EMAIL_FORMAT: 'email',
      INVALID_INSTAGRAM_FORMAT: 'instagram',
      PRIVACY_CONSENT_REQUIRED: 'privacyConsent',
    };
    const field = fieldByError[errorKey];
    if (field) {
      showFieldErrors({ [field]: message });
      return;
    }
    setFormError(message);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormError('');
      showFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setFormError('');
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/gate/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json() as { ok?: boolean; error?: string };

      if (!response.ok) {
        applyApiError(data.error ?? '');
        return;
      }
      setSubmitted(true);
    } catch {
      setFormError(t.request.errors.CONNECTION_ERROR);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const codeError = fieldErrors.accessCode
    ?? (codeState.kind === 'invalid' ? t.request.errors.INVALID_ACCESS_CODE : undefined)
    ?? (codeState.kind === 'unavailable' ? t.request.codeVerificationUnavailable : undefined);
  const codeStatus = codeState.kind === 'verifying'
    ? t.request.codeVerifying
    : codeState.kind === 'verified'
      ? t.request.codeVerified(codeState.artistName)
      : undefined;

  return {
    t,
    eventState,
    retryEvent: () => setEventRequestVersion(version => version + 1),
    invitationLines,
    form,
    codeState,
    isCodeVerified,
    codeError,
    codeStatus,
    verifyCode,
    handleCodeChange,
    handleTextChange,
    handleInstagramChange,
    handlePrivacyConsentChange,
    handleMarketingConsentChange,
    handleSubmit,
    isSubmitting,
    submitted,
    fieldErrors,
    formError,
  };
}
