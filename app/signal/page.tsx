'use client';

import { motion, AnimatePresence } from 'framer-motion';
import PageLayout, { itemVariants } from '@/components/shell/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import ReturnLink from '@/components/ui/ReturnLink';
import TerminalPanel from '@/components/TerminalPanel';
import SubmitButton from '@/components/SubmitButton';
import { LabelText, SubtitleText, MetaText } from '@/components/ui/TerminalText';
import ConsentCheckbox from '@/components/ui/ConsentCheckbox';
import ConsentBlock from '@/components/ui/ConsentBlock';
import FieldError from '@/components/ui/FieldError';
import { FormField, inputClassBase, inputAccentClass } from '@/components/ui/FormField';
import { useSignalSubscription } from './useSignalSubscription';

export default function SignalPage() {
  const {
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
  } = useSignalSubscription();

  return (
    <PageLayout centerContent={false}>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/signal" title="SIGNAL_SUBSCRIPTION" accent="tertiary" variants={itemVariants} />

      {submitted ? (
        <motion.div variants={itemVariants} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <TerminalPanel title="REQUEST_COMMITTED" accent="tertiary" headingLevel={2}>
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
            <TerminalPanel title="SIGNAL_BRIEF" accent="tertiary" headingLevel={2}>
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
            <TerminalPanel title="SIGNAL_SUBSCRIPTION" accent="tertiary" headingLevel={2}>
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <FormField label={t.signal.labelEmail} htmlFor="signal-email">
                  <input
                    id="signal-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleEmailChange}
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
                      onChange={handleInstagramChange}
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
                    onChange={handleConsentChange}
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
