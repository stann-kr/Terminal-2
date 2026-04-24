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

interface FormState {
  email: string;
  instagram: string;
  consent: boolean;
}

export default function SignalPage() {
  const t = useT();

  const [form, setForm] = useState<FormState>({
    email: '',
    instagram: '',
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange =
    (field: keyof Omit<FormState, 'consent'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || !form.consent) return;
    setError('');

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

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        const errKey = data.error ?? '';
        setError(
          t.signal.errors[errKey as keyof typeof t.signal.errors] ??
            t.signal.errors.TRANSMISSION_FAILED,
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setError(t.signal.errors.CONNECTION_ERROR);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout centerContent={false}>
      <ReturnLink variants={itemVariants} />
      <PageHeader
        path="/terminal/signal"
        title="SIGNAL_SUBSCRIPTION"
        accent="tertiary"
        variants={itemVariants}
      />

      {submitted ? (
        <motion.div variants={itemVariants} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <TerminalPanel title="REQUEST_COMMITTED" accent="tertiary">
            <div className="text-center py-6 space-y-2">
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
          {/* 구독 안내 */}
          <motion.div variants={itemVariants}>
            <TerminalPanel title="SIGNAL_BRIEF" accent="tertiary">
              <div className="space-y-1.5">
                {t.signal.description.map((line, i) => (
                  <div key={i} className="font-mono text-terminal-subdued tracking-wide">
                    <SubtitleText text={line} delay={i * 40} />
                  </div>
                ))}
              </div>
            </TerminalPanel>
          </motion.div>

          {/* 구독 폼 */}
          <motion.div variants={itemVariants}>
            <TerminalPanel title="SIGNAL_SUBSCRIPTION" accent="tertiary">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* 이메일 */}
                <FormField label={t.signal.labelEmail}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder={t.signal.placeholderEmail}
                    className={`${inputClassBase} ${inputAccentClass.tertiary}`}
                  />
                </FormField>

                {/* 인스타그램 */}
                <FormField label={t.signal.labelInstagram}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none font-mono text-small md:text-body text-terminal-accent-tertiary">
                      @
                    </span>
                    <input
                      type="text"
                      value={form.instagram.replace(/^@/, '')}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/^@+/, '');
                        setForm(prev => ({ ...prev, instagram: raw ? '@' + raw : '' }));
                      }}
                      placeholder="USERNAME"
                      className={`${inputClassBase} ${inputAccentClass.tertiary} pl-6`}
                    />
                  </div>
                </FormField>

                {/* 동의 체크박스 */}
                <ConsentBlock>
                  <ConsentCheckbox
                    checked={form.consent}
                    onChange={checked => setForm(prev => ({ ...prev, consent: checked }))}
                    label={t.signal.consentLabel}
                  />
                </ConsentBlock>

                {/* 에러 메시지 */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-mono text-terminal-accent-alert"
                    >
                      <LabelText text={`⚠ ERROR: ${error}`} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 제출 버튼 */}
                <div
                  className={`flex justify-end pt-2 ${!form.consent ? 'opacity-30 pointer-events-none' : ''}`}
                >
                  <SubmitButton
                    isSubmitting={isSubmitting}
                    variant="primary"
                    defaultText={t.signal.submitBtn}
                    loadingText={t.signal.submitting}
                  />
                </div>
              </form>
            </TerminalPanel>
          </motion.div>
        </div>
      )}
    </PageLayout>
  );
}
