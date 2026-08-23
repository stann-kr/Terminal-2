'use client';

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
import FieldError from '@/components/ui/FieldError';
import { FormField, inputClassBase, inputAccentClass } from '@/components/ui/FormField';
import { ACCESS_WINDOW_DAYS } from '@/lib/gate/requestPolicy';
import { useAccessRequest } from './useAccessRequest';

export default function RequestAccessPage() {
  const {
    t,
    eventState,
    retryEvent,
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
  } = useAccessRequest();

  const disabledClass = !isCodeVerified
    ? 'opacity-30 select-none'
    : 'transition-opacity duration-300';

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
          <TerminalPanel title="REQUEST_STATUS" accent="alert" headingLevel={2}>
            <div className="space-y-4 text-center py-4 font-mono" role="alert">
              <MetaText text={t.request.eventLoadFailed} />
              <div className="flex justify-center">
                <TerminalButton onClick={retryEvent} variant="ghost">
                  {t.request.retry}
                </TerminalButton>
              </div>
            </div>
          </TerminalPanel>
        </motion.div>
      ) : eventState.kind === 'empty' ? (
        <motion.div variants={itemVariants}>
          <TerminalPanel title="REQUEST_STATUS" accent="alert" headingLevel={2}>
            <div className="font-mono text-terminal-muted text-center py-4" role="status" aria-live="polite">
              <MetaText text={t.request.noEvent} />
            </div>
          </TerminalPanel>
        </motion.div>
      ) : eventState.kind === 'inactive' ? (
        <motion.div variants={itemVariants}>
          <TerminalPanel title="REQUEST_STATUS" accent="alert" headingLevel={2}>
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
          <TerminalPanel title="REQUEST_COMMITTED" accent="secondary" headingLevel={2}>
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
            <TerminalPanel title="INVITATION_BRIEF" accent="secondary" headingLevel={2}>
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
            <TerminalPanel title="GUEST_REQUEST_FORM" accent="secondary" headingLevel={2}>
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
                        onChange={handleTextChange('name')}
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
                        onChange={handleTextChange('email')}
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
                          onChange={handleInstagramChange}
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

                    <FormField label={t.request.labelInvitedBy} htmlFor="request-invitedBy">
                      <output
                        id="request-invitedBy"
                        htmlFor="request-accessCode"
                        aria-live="off"
                        className="flex min-h-11 items-center gap-3 border border-terminal-accent-secondary/30 px-3 py-2 font-mono text-small tracking-wider text-terminal-primary"
                      >
                        <span className="text-terminal-accent-secondary" aria-hidden="true">
                          {isCodeVerified ? '✓' : '○'}
                        </span>
                        {codeState.kind === 'verified' ? codeState.artistName : '—'}
                      </output>
                    </FormField>

                    <ConsentBlock>
                      <ConsentCheckbox
                        id="request-privacyConsent"
                        name="privacyConsent"
                        checked={form.privacyConsent}
                        onChange={handlePrivacyConsentChange}
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
                        onChange={handleMarketingConsentChange}
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
