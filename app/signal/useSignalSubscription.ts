'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useFieldErrors, type FieldErrorMap } from '@/components/ui/useFieldErrors';
import { useT } from '@/lib/langContext';
import {
  SIGNAL_SUBSCRIPTION_FIELDS,
  validateSignalSubscriptionInput,
  type SignalSubscriptionField,
  type SignalSubscriptionFieldErrors,
} from '@/lib/signal/subscriptionPolicy';

interface SignalSubscriptionForm {
  email: string;
  instagram: string;
  consent: boolean;
}

const INITIAL_FORM: SignalSubscriptionForm = {
  email: '',
  instagram: '',
  consent: false,
};

export function useSignalSubscription() {
  const t = useT();
  const [form, setForm] = useState<SignalSubscriptionForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { fieldErrors, setFieldErrors, clearFieldError, showFieldErrors } =
    useFieldErrors<SignalSubscriptionField>('signal');
  const [formError, setFormError] = useState('');
  const submittingRef = useRef(false);

  const localizeFieldErrors = (
    errors: SignalSubscriptionFieldErrors,
  ): FieldErrorMap<SignalSubscriptionField> => {
    const localized: FieldErrorMap<SignalSubscriptionField> = {};
    for (const field of SIGNAL_SUBSCRIPTION_FIELDS) {
      const error = errors[field];
      if (error) localized[field] = t.signal.errors[error];
    }
    return localized;
  };

  const applyApiError = (errorKey: string) => {
    const message = t.signal.errors[errorKey as keyof typeof t.signal.errors]
      ?? t.signal.errors.TRANSMISSION_FAILED;
    const fieldByError: Partial<Record<string, SignalSubscriptionField>> = {
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

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm(previous => ({ ...previous, email: event.target.value }));
    clearFieldError('email');
  };

  const handleInstagramChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/^@+/, '');
    setForm(previous => ({ ...previous, instagram: raw ? `@${raw}` : '' }));
    clearFieldError('instagram');
  };

  const handleConsentChange = (checked: boolean) => {
    setForm(previous => ({ ...previous, consent: checked }));
    clearFieldError('consent');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const validation = validateSignalSubscriptionInput(form);
    if (!validation.ok) {
      setFormError('');
      if (Object.keys(validation.fieldErrors).length > 0) {
        showFieldErrors(localizeFieldErrors(validation.fieldErrors));
      } else {
        setFormError(t.signal.errors.TRANSMISSION_FAILED);
      }
      return;
    }

    setFieldErrors({});
    setFormError('');
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.input),
      });
      const data = await response.json() as { ok?: boolean; error?: string };

      if (!response.ok) {
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

  return {
    t,
    form,
    handleEmailChange,
    handleInstagramChange,
    handleConsentChange,
    handleSubmit,
    isSubmitting,
    submitted,
    fieldErrors,
    formError,
  };
}
