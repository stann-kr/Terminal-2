'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import ReturnLink from '@/components/ui/ReturnLink';
import TerminalPanel from '@/components/TerminalPanel';
import SubmitButton from '@/components/SubmitButton';
import { LabelText, SubtitleText, MetaText } from '@/components/ui/TerminalText';
import ConsentCheckbox from '@/components/ui/ConsentCheckbox';
import ConsentBlock from '@/components/ui/ConsentBlock';
import { FormField, inputClassBase, inputAccentClass } from '@/components/ui/FormField';
import { useT } from '@/lib/langContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTAGRAM_PATTERN = /^@?[\w.]+$/;

interface FormState {
  email: string;
  instagram: string;
  consent: boolean;
}

type SignalField = 'email' | 'instagram' | 'consent';
type FieldErrors = Partial<Record<SignalField, string>>;

export default function SignalPage() {
  const t = useT();
  const [form, setForm] = useState<FormState>({ email: '', instagram: '', consent: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const submittingRef = useRef(false);

  const clearFieldError = (field: SignalField) => {
    setFieldErrors(current => {
      if (!current[field]) return current;
      const { [field]: _cleared, ...remaining } = current;
      return remaining;
    });
  };

  const showFieldErrors = (errors: FieldErrors) => {
    setFieldErrors(errors);
    const firstField = Object.keys(errors)[0] as SignalField | undefined;
    if (firstField) requestAnimationFrame(() => document.getElementById(`signal-${firstField}`)?.focus());
  };

  const validateForm = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!form.email.trim()) errors.email = t.signal.errors.ALL_FIELDS_REQUIRED;
    else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = t.signal.errors.INVALID_EMAIL_FORMAT;
    if (!form.instagram.trim()) errors.instagram = t.signal.errors.ALL_FIELDS_REQUIRED;
    else if (!INSTAGRAM_PATTERN.test(form.instagram.trim())) {
      errors.instagram = t.signal.errors.INVALID_INSTAGRAM_FORMAT;
    }
    if (!form.consent) errors.consent = t.signal.errors.CONSENT_REQUIRED;
    return errors;
  };

  const applyApiError = (errorKey: string) => {
    const message = t.signal.errors[errorKey as keyof typeof t.signal.errors]
      ?? t.signal.errors.TRANSMISSION_FAILED;
    const fieldByError: Partial<Record<string, SignalField>> = {
      INVALID_EMAIL_FORMAT: 'email',
      INVALID_INSTAGRAM_FORMAT: 'instagram',
      CONSENT_REQUIRED: 'consent',
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
      const res = await fetch('/api/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          instagram: form.instagram,
          consent: form.consent,
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };

      if (!res.ok) {
        applyApiError(data.error ?? '');
        return;
      }
      setSubmitted(true);
    } catch {
      setFormError(t.signal.errors.CONNECTION_ERROR);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout centerContent={false}>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/signal" title="SIGNAL_SUBSCRIPTION" accent="tertiary" variants={itemVariants} />

      {submitted ? (
        <motion.div variants={itemVariants} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <TerminalPanel title="REQUEST_COMMITTED" accent="tertiary">
            <div className="text-center py-6 space-y-2" role="status" aria-live="polite" aria-atomic="true">
              <div className="font-bold tracking-widest font-mono text-terminal-accent-tertiary">
                <LabelText text={t.signal.committed} />
              </div>
              <div className="font-mono text-terminal-muted">
                <MetaText text={t.signal.committedSub} />
              </div>
            </div>
          </TerminalPanel>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <TerminalPanel title="SIGNAL_BRIEF" accent="tertiary">
              <div className="space-y-1.5">
                {t.signal.description.map((line, index) => (
                  <div key={index} className="font-mono text-terminal-subdued tracking-wide">
                    <SubtitleText text={line} delay={index * 40} />
                  </div>
                ))}
              </div>
            </TerminalPanel>
          </motion.div>

          <motion.div variants={itemVariants}>
            <TerminalPanel title="SIGNAL_SUBSCRIPTION" accent="tertiary">
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <FormField label={t.signal.labelEmail} htmlFor="signal-email">
                  <input
                    id="signal-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={e => {
                      setForm(previous => ({ ...previous, email: e.target.value }));
                      clearFieldError('email');
                    }}
                    placeholder={t.signal.placeholderEmail}
                    autoComplete="email"
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'signal-email-error' : undefined}
                    className={`${inputClassBase} ${inputAccentClass.tertiary}`}
                  />
                </FormField>
                {fieldErrors.email && <FieldError id="signal-email-error" message={fieldErrors.email} />}

                <FormField label={t.signal.labelInstagram} htmlFor="signal-instagram">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none font-mono text-small md:text-body text-terminal-accent-tertiary" aria-hidden="true">@</span>
                    <input
                      id="signal-instagram"
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
                      aria-describedby={fieldErrors.instagram ? 'signal-instagram-error' : undefined}
                      className={`${inputClassBase} ${inputAccentClass.tertiary} pl-6`}
                    />
                  </div>
                </FormField>
                {fieldErrors.instagram && <FieldError id="signal-instagram-error" message={fieldErrors.instagram} />}

                <ConsentBlock>
                  <ConsentCheckbox
                    id="signal-consent"
                    name="consent"
                    checked={form.consent}
                    onChange={checked => {
                      setForm(previous => ({ ...previous, consent: checked }));
                      clearFieldError('consent');
                    }}
                    label={t.signal.consentLabel}
                    accent="primary"
                    required
                    aria-invalid={Boolean(fieldErrors.consent)}
                    aria-describedby={fieldErrors.consent ? 'signal-consent-error' : undefined}
                  />
                  {fieldErrors.consent && <FieldError id="signal-consent-error" message={fieldErrors.consent} />}
                </ConsentBlock>

                <AnimatePresence mode="wait">
                  {formError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-terminal-accent-alert" role="alert" aria-live="assertive">
                      <LabelText text={`⚠ ERROR: ${formError}`} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end pt-2">
                  <SubmitButton isSubmitting={isSubmitting} variant="primary" defaultText={t.signal.submitBtn} loadingText={t.signal.submitting} />
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
