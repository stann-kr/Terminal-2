'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import ReturnLink from '@/components/ui/ReturnLink';
import TerminalPanel from '@/components/TerminalPanel';
import TerminalButton from '@/components/TerminalButton';
import SubmitButton from '@/components/SubmitButton';
import { LabelText, MetaText, SubtitleText } from '@/components/ui/TerminalText';
import ConsentCheckbox from '@/components/ui/ConsentCheckbox';
import ConsentBlock from '@/components/ui/ConsentBlock';
import { FormField, inputClassBase, inputAccentClass } from '@/components/ui/FormField';
import { useLang, useT } from '@/lib/langContext';
import {
  resolveCodeVerificationState,
  resolveRequestEventState,
  type CodeVerificationState,
  type RequestEventState,
} from '@/lib/gate/requestState';

const ACCESS_WINDOW_DAYS = 30;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTAGRAM_PATTERN = /^@?[\w.]+$/;

interface FormState {
  accessCode: string;
  invitedBy: string;
  name: string;
  email: string;
  instagram: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
}

type RequestField = 'accessCode' | 'invitedBy' | 'name' | 'email' | 'instagram' | 'privacyConsent';
type FieldErrors = Partial<Record<RequestField, string>>;

export default function RequestAccessPage() {
  const { lang } = useLang();
  const t = useT();
  const [eventState, setEventState] = useState<RequestEventState>({ kind: 'loading' });
  const [eventRequestVersion, setEventRequestVersion] = useState(0);
  const [form, setForm] = useState<FormState>({
    accessCode: '',
    invitedBy: '',
    name: '',
    email: '',
    instagram: '',
    privacyConsent: false,
    marketingConsent: false,
  });
  const [codeState, setCodeState] = useState<CodeVerificationState>({ kind: 'idle' });
  const [invitedByType, setInvitedByType] = useState<'dj' | 'other'>('dj');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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

  const clearFieldError = (field: RequestField) => {
    setFieldErrors(current => {
      if (!current[field]) return current;
      const { [field]: _cleared, ...remaining } = current;
      return remaining;
    });
  };

  const showFieldErrors = (errors: FieldErrors) => {
    setFieldErrors(errors);
    const firstField = Object.keys(errors)[0] as RequestField | undefined;
    if (firstField) {
      requestAnimationFrame(() => document.getElementById(`request-${firstField}`)?.focus());
    }
  };

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
      .then(async (res) => {
        const data = res.ok
          ? await res.json() as { name?: string | null }
          : undefined;
        return resolveCodeVerificationState({ ok: res.ok, status: res.status, name: data?.name });
      })
      .then((nextState) => {
        if (sequence !== verificationSequenceRef.current) return;
        setCodeState(nextState);
        if (nextState.kind === 'verified') {
          setInvitedByType('dj');
          setForm(previous => ({ ...previous, invitedBy: nextState.artistName }));
          clearFieldError('accessCode');
        }
      })
      .catch(() => {
        if (sequence !== verificationSequenceRef.current || controller.signal.aborted) return;
        setCodeState({ kind: 'unavailable' });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setEventState({ kind: 'loading' });

    void fetch('/api/events?status=UPCOMING', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('Request event fetch failed');
        const data = await res.json() as unknown;
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

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setForm(previous => ({ ...previous, accessCode: code }));
    clearFieldError('accessCode');
    ++verificationSequenceRef.current;
    verificationAbortRef.current?.abort();
    setCodeState(code.trim() ? { kind: 'verifying' } : { kind: 'idle' });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => verifyCode(code), 500);
  };

  const handleChange = (field: keyof Omit<FormState, 'privacyConsent' | 'marketingConsent' | 'accessCode'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(previous => ({ ...previous, [field]: e.target.value }));
      clearFieldError(field);
    };

  const validateForm = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!isCodeVerified) {
      errors.accessCode = codeState.kind === 'unavailable'
        ? t.request.codeVerificationUnavailable
        : t.request.errors.INVALID_ACCESS_CODE;
    }
    if (!form.name.trim()) errors.name = t.request.errors.ALL_FIELDS_REQUIRED;
    if (!form.email.trim()) errors.email = t.request.errors.ALL_FIELDS_REQUIRED;
    else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = t.request.errors.INVALID_EMAIL_FORMAT;
    if (!form.instagram.trim()) errors.instagram = t.request.errors.ALL_FIELDS_REQUIRED;
    else if (!INSTAGRAM_PATTERN.test(form.instagram.trim())) {
      errors.instagram = t.request.errors.INVALID_INSTAGRAM_FORMAT;
    }
    if (invitedByType === 'other' && !form.invitedBy.trim()) {
      errors.invitedBy = t.request.errors.ALL_FIELDS_REQUIRED;
    }
    if (!form.privacyConsent) errors.privacyConsent = t.request.errors.PRIVACY_CONSENT_REQUIRED;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const res = await fetch('/api/gate/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { ok?: boolean; error?: string };

      if (!res.ok) {
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

  const disabledClass = !isCodeVerified
    ? 'opacity-30 select-none'
    : 'transition-opacity duration-300';
  const codeError = fieldErrors.accessCode
    ?? (codeState.kind === 'invalid' ? t.request.errors.INVALID_ACCESS_CODE : undefined)
    ?? (codeState.kind === 'unavailable' ? t.request.codeVerificationUnavailable : undefined);
  const codeStatus = codeState.kind === 'verifying'
    ? t.request.codeVerifying
    : codeState.kind === 'verified'
      ? t.request.codeVerified(codeState.artistName)
      : undefined;

  return (
    <PageLayout centerContent={false}>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/gate/request" title="ACCESS.REQUEST" accent="secondary" variants={itemVariants} />

      {eventState.kind === 'loading' ? (
        <motion.div variants={itemVariants} className="font-mono text-terminal-muted text-center py-8" role="status" aria-live="polite">
          <LabelText text={t.request.loading} />
        </motion.div>
      ) : eventState.kind === 'load-error' ? (
        <motion.div variants={itemVariants}>
          <TerminalPanel title="REQUEST_STATUS" accent="alert">
            <div className="space-y-4 text-center py-4 font-mono" role="alert">
              <MetaText text={t.request.eventLoadFailed} />
              <div className="flex justify-center">
                <TerminalButton onClick={() => setEventRequestVersion(version => version + 1)} variant="ghost">
                  {t.request.retry}
                </TerminalButton>
              </div>
            </div>
          </TerminalPanel>
        </motion.div>
      ) : eventState.kind === 'empty' ? (
        <motion.div variants={itemVariants}>
          <TerminalPanel title="REQUEST_STATUS" accent="alert">
            <div className="font-mono text-terminal-muted text-center py-4" role="status" aria-live="polite">
              <MetaText text={t.request.noEvent} />
            </div>
          </TerminalPanel>
        </motion.div>
      ) : eventState.kind === 'inactive' ? (
        <motion.div variants={itemVariants}>
          <TerminalPanel title="REQUEST_STATUS" accent="alert">
            <div className="space-y-3 text-center py-4">
              <div className="font-bold tracking-widest font-mono text-terminal-accent-alert">
                <LabelText text={t.request.periodInactive} />
              </div>
              <div className="font-mono text-terminal-muted space-y-1">
                <div><MetaText text={t.request.windowInfo(ACCESS_WINDOW_DAYS)} /></div>
                <div><MetaText text={t.request.eventDate(eventState.event.date.replace(/-/g, '.'), eventState.event.time)} /></div>
                <div className="pt-1 text-terminal-accent-primary">
                  <MetaText
                    text={
                      eventState.window.isElapsed
                        ? t.request.eventElapsed
                        : t.request.windowCountdown(eventState.window.opensInDays ?? 0)
                    }
                  />
                </div>
              </div>
            </div>
          </TerminalPanel>
        </motion.div>
      ) : submitted ? (
        <motion.div variants={itemVariants} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <TerminalPanel title="REQUEST_COMMITTED" accent="secondary">
            <div className="text-center py-6 space-y-2" role="status" aria-live="polite" aria-atomic="true">
              <div className="font-bold tracking-widest font-mono text-terminal-accent-secondary">
                <LabelText text={t.request.committed} />
              </div>
              <div className="font-mono text-terminal-muted">
                <MetaText text={t.request.committedSub} />
              </div>
            </div>
          </TerminalPanel>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <TerminalPanel title="INVITATION_BRIEF" accent="secondary">
              <div className="space-y-1.5">
                {invitationLines.map((line, index) => {
                  const isSeparator = line.trim().length > 0 && !/[a-zA-Z가-힣ㄱ-ㆎ\d]/.test(line);
                  return (
                    <div key={index} className={`font-mono text-terminal-subdued tracking-wide${isSeparator ? ' overflow-hidden' : ''}`}>
                      <SubtitleText
                        text={line}
                        delay={index * 40}
                        autoHeight={isSeparator}
                        style={isSeparator ? { whiteSpace: 'nowrap', overflow: 'hidden', display: 'block' } : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            </TerminalPanel>
          </motion.div>

          <motion.div variants={itemVariants}>
            <TerminalPanel title="GUEST_REQUEST_FORM" accent="secondary">
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <FormField label={t.request.labelCode} htmlFor="request-accessCode">
                  <div className="relative">
                    <input
                      id="request-accessCode"
                      name="accessCode"
                      type="text"
                      value={form.accessCode}
                      onChange={handleCodeChange}
                      placeholder={t.request.placeholderCode}
                      autoComplete="off"
                      required
                      aria-required="true"
                      aria-invalid={Boolean(codeError)}
                      aria-describedby={codeError || codeStatus ? 'request-accessCode-message' : undefined}
                      className={`${inputClassBase} ${inputAccentClass.secondary} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-caption pointer-events-none" aria-hidden="true">
                      {codeState.kind === 'verifying' ? (
                        <span className="text-terminal-muted animate-pulse">···</span>
                      ) : isCodeVerified ? (
                        <span className="text-terminal-accent-secondary">✓</span>
                      ) : form.accessCode ? (
                        <span className="text-terminal-accent-alert">✗</span>
                      ) : null}
                    </span>
                  </div>
                </FormField>
                {(codeError || codeStatus) && (
                  <div
                    id="request-accessCode-message"
                    className={`font-mono ${codeError ? 'text-terminal-accent-alert' : 'text-terminal-accent-secondary'}`}
                    role={codeError ? 'alert' : 'status'}
                    aria-live="polite"
                  >
                    <MetaText text={codeError ?? codeStatus ?? ''} />
                    {codeState.kind === 'unavailable' && (
                      <TerminalButton className="ml-3 px-3 py-1 text-micro" variant="ghost" onClick={() => verifyCode(form.accessCode)}>
                        {t.request.retry}
                      </TerminalButton>
                    )}
                  </div>
                )}

                <div className={disabledClass}>
                  <div className="space-y-4">
                    <FormField label={t.request.labelName} htmlFor="request-name">
                      <input
                        id="request-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange('name')}
                        placeholder={t.request.placeholderName}
                        autoComplete="name"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(fieldErrors.name)}
                        aria-describedby={fieldErrors.name ? 'request-name-error' : undefined}
                        disabled={!isCodeVerified}
                        className={`${inputClassBase} ${inputAccentClass.secondary}`}
                      />
                    </FormField>
                    {fieldErrors.name && <FieldError id="request-name-error" message={fieldErrors.name} />}

                    <FormField label={t.request.labelEmail} htmlFor="request-email">
                      <input
                        id="request-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        placeholder={t.request.placeholderEmail}
                        autoComplete="email"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? 'request-email-error' : undefined}
                        disabled={!isCodeVerified}
                        className={`${inputClassBase} ${inputAccentClass.secondary}`}
                      />
                    </FormField>
                    {fieldErrors.email && <FieldError id="request-email-error" message={fieldErrors.email} />}

                    <FormField label={t.request.labelInstagram} htmlFor="request-instagram">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none font-mono text-small md:text-body text-terminal-accent-secondary" aria-hidden="true">@</span>
                        <input
                          id="request-instagram"
                          name="instagram"
                          type="text"
                          value={form.instagram.replace(/^@/, '')}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/^@+/, '');
                            setForm(previous => ({ ...previous, instagram: raw ? `@${raw}` : '' }));
                            clearFieldError('instagram');
                          }}
                          placeholder="USERNAME"
                          autoComplete="username"
                          required
                          aria-required="true"
                          aria-invalid={Boolean(fieldErrors.instagram)}
                          aria-describedby={fieldErrors.instagram ? 'request-instagram-error' : undefined}
                          disabled={!isCodeVerified}
                          className={`${inputClassBase} ${inputAccentClass.secondary} pl-6`}
                        />
                      </div>
                    </FormField>
                    {fieldErrors.instagram && <FieldError id="request-instagram-error" message={fieldErrors.instagram} />}

                    <fieldset>
                      <legend className="mb-1.5 block tracking-widest font-mono text-terminal-subdued">
                        <LabelText text={t.request.labelInvitedBy} autoHeight />
                      </legend>
                      <div className="space-y-2 pt-1">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative shrink-0">
                            <input
                              type="radio"
                              name="invitedByType"
                              checked={isCodeVerified && invitedByType === 'dj'}
                              onChange={() => {
                                setInvitedByType('dj');
                                setForm(previous => ({ ...previous, invitedBy: isCodeVerified && codeState.kind === 'verified' ? codeState.artistName : '' }));
                                clearFieldError('invitedBy');
                              }}
                              disabled={!isCodeVerified}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 border font-mono text-xs flex items-center justify-center transition-colors ${isCodeVerified && invitedByType === 'dj' ? 'border-terminal-accent-secondary bg-terminal-accent-secondary/20 text-terminal-accent-secondary' : 'border-terminal-accent-secondary/30 text-transparent'}`} aria-hidden="true">✓</div>
                          </div>
                          <span className="font-mono text-small text-terminal-primary tracking-wider">
                            {codeState.kind === 'verified' ? codeState.artistName : '—'}
                          </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative shrink-0">
                            <input
                              type="radio"
                              name="invitedByType"
                              checked={isCodeVerified && invitedByType === 'other'}
                              onChange={() => {
                                setInvitedByType('other');
                                setForm(previous => ({ ...previous, invitedBy: '' }));
                              }}
                              disabled={!isCodeVerified}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 border font-mono text-xs flex items-center justify-center transition-colors ${isCodeVerified && invitedByType === 'other' ? 'border-terminal-accent-secondary bg-terminal-accent-secondary/20 text-terminal-accent-secondary' : 'border-terminal-accent-secondary/30 text-transparent'}`} aria-hidden="true">✓</div>
                          </div>
                          <span className="font-mono text-small text-terminal-primary tracking-wider">{t.request.invitedByOther}</span>
                        </label>

                        <AnimatePresence>
                          {invitedByType === 'other' && isCodeVerified && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pl-7">
                              <input
                                id="request-invitedBy"
                                name="invitedBy"
                                type="text"
                                value={form.invitedBy}
                                onChange={handleChange('invitedBy')}
                                placeholder={t.request.invitedByOtherPlaceholder}
                                autoComplete="off"
                                required
                                aria-required="true"
                                aria-invalid={Boolean(fieldErrors.invitedBy)}
                                aria-describedby={fieldErrors.invitedBy ? 'request-invitedBy-error' : undefined}
                                className={`${inputClassBase} ${inputAccentClass.secondary} w-full`}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </fieldset>
                    {fieldErrors.invitedBy && <FieldError id="request-invitedBy-error" message={fieldErrors.invitedBy} />}

                    <ConsentBlock>
                      <ConsentCheckbox
                        id="request-privacyConsent"
                        name="privacyConsent"
                        checked={form.privacyConsent}
                        onChange={checked => {
                          setForm(previous => ({ ...previous, privacyConsent: checked }));
                          clearFieldError('privacyConsent');
                        }}
                        label={t.request.privacyConsent}
                        disabled={!isCodeVerified}
                        required
                        aria-invalid={Boolean(fieldErrors.privacyConsent)}
                        aria-describedby={fieldErrors.privacyConsent ? 'request-privacyConsent-error' : undefined}
                      />
                      {fieldErrors.privacyConsent && <FieldError id="request-privacyConsent-error" message={fieldErrors.privacyConsent} />}
                      <ConsentCheckbox
                        id="request-marketingConsent"
                        name="marketingConsent"
                        checked={form.marketingConsent}
                        onChange={checked => setForm(previous => ({ ...previous, marketingConsent: checked }))}
                        label={t.request.marketingConsent}
                        disabled={!isCodeVerified}
                      />
                    </ConsentBlock>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {formError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-terminal-accent-alert" role="alert" aria-live="assertive">
                      <LabelText text={`⚠ ERROR: ${formError}`} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end pt-2">
                  <SubmitButton isSubmitting={isSubmitting} disabled={!isCodeVerified} variant="primary" defaultText={t.request.submitBtn} loadingText={t.request.submitting} />
                </div>
              </form>
            </TerminalPanel>
          </motion.div>
        </div>
      )}
    </PageLayout>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <div id={id} className="font-mono text-terminal-accent-alert" role="alert">
      <MetaText text={message} />
    </div>
  );
}
