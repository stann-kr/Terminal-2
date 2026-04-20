'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import ReturnLink from '@/components/ui/ReturnLink';
import TerminalPanel from '@/components/TerminalPanel';
import SubmitButton from '@/components/SubmitButton';
import { LabelText, MetaText, SubtitleText } from '@/components/ui/TerminalText';
import { FormField, inputClassBase, inputAccentClass } from '@/components/ui/FormField';
import { useLang, useT } from '@/lib/langContext';
import type { TerminalEvent } from '@/lib/eventData';

const ACCESS_WINDOW_DAYS = 30;

interface FormState {
  accessCode: string;
  invitedBy: string;
  name: string;
  email: string;
  instagram: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
}

function RequestAccessContent() {
  const { lang } = useLang();
  const t = useT();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<TerminalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [daysUntil, setDaysUntil] = useState(0);

  const initialCode = searchParams.get('code') ?? '';
  const [form, setForm] = useState<FormState>({
    accessCode: initialCode,
    invitedBy: '',
    name: '',
    email: '',
    instagram: '',
    privacyConsent: false,
    marketingConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const fetchCodeInfo = (code: string) => {
    if (!code.trim()) return;
    fetch(`/api/gate/code-info?code=${encodeURIComponent(code.trim())}`)
      .then(res => res.json() as Promise<{ name: string | null }>)
      .then(data => {
        if (data.name) {
          setForm(prev => ({ ...prev, invitedBy: data.name! }));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch('/api/events?status=UPCOMING')
      .then(res => { if (!res.ok) throw new Error(); return res.json() as Promise<TerminalEvent[]>; })
      .then(data => {
        if (data.length > 0) {
          const ev = data[0];
          setEvent(ev);
          const days = (new Date(ev.date).getTime() - Date.now()) / 86_400_000;
          setDaysUntil(Math.ceil(days));
          setIsActive(days >= 0 && days <= ACCESS_WINDOW_DAYS);
        }
      })
      .catch(() => setError(t.common.signalUnstable))
      .finally(() => setLoading(false));

    // URL ?code= 파라미터로 접근 시 초기 자동 완성
    if (initialCode) fetchCodeInfo(initialCode);
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setForm(prev => ({ ...prev, accessCode: code }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCodeInfo(code), 500);
  };

  const handleChange = (field: keyof Omit<FormState, 'privacyConsent' | 'marketingConsent' | 'accessCode'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setError('');

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
        const errKey = data.error ?? '';
        setError(
          t.request.errors[errKey as keyof typeof t.request.errors] ?? t.request.errors.TRANSMISSION_FAILED
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setError(t.request.errors.CONNECTION_ERROR);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const invitationLines = event?.invitationLines?.[lang] ?? t.request.invitationLines;

  return (
    <PageLayout centerContent={false}>
      <ReturnLink variants={itemVariants} />
      <PageHeader
        path="/terminal/gate/request"
        title="ACCESS.REQUEST"
        accent="secondary"
        variants={itemVariants}
      />

      {loading ? (
        <motion.div variants={itemVariants} className="text-xs font-mono text-terminal-muted text-center py-8">
          <LabelText text={t.request.loading} />
        </motion.div>
      ) : !isActive ? (
        <motion.div variants={itemVariants}>
          <TerminalPanel title="REQUEST_STATUS" accent="alert">
            <div className="space-y-3 text-center py-4">
              <div className="text-sm font-bold tracking-widest font-mono text-terminal-accent-alert">
                <LabelText text={t.request.periodInactive} />
              </div>
              <div className="text-xs font-mono text-terminal-muted space-y-1">
                {event ? (
                  <>
                    <div><MetaText text={t.request.windowInfo(ACCESS_WINDOW_DAYS)} /></div>
                    <div><MetaText text={t.request.eventDate(event.date.replace(/-/g, '.'), event.time)} /></div>
                    <div className="pt-1 text-terminal-accent-primary">
                      <MetaText text={t.request.windowCountdown(daysUntil - ACCESS_WINDOW_DAYS)} />
                    </div>
                  </>
                ) : (
                  <MetaText text={t.request.noEvent} />
                )}
              </div>
            </div>
          </TerminalPanel>
        </motion.div>
      ) : submitted ? (
        <motion.div variants={itemVariants} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <TerminalPanel title="REQUEST_COMMITTED" accent="secondary">
            <div className="text-center py-6 space-y-2">
              <div className="text-sm font-bold tracking-widest font-mono text-terminal-accent-secondary">
                <LabelText text={t.request.committed} />
              </div>
              <div className="text-xs font-mono text-terminal-muted">
                <MetaText text={t.request.committedSub} />
              </div>
            </div>
          </TerminalPanel>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* 초대 메시지 */}
          <motion.div variants={itemVariants}>
            <TerminalPanel title="INVITATION_BRIEF" accent="secondary">
              <div className="space-y-1.5">
                {invitationLines.map((line, i) => (
                  <div key={i} className="font-mono text-terminal-subdued tracking-wide">
                    <SubtitleText text={line} delay={i * 40} />
                  </div>
                ))}
              </div>
            </TerminalPanel>
          </motion.div>

          {/* 신청 폼 */}
          <motion.div variants={itemVariants}>
            <TerminalPanel title="GUEST_REQUEST_FORM" accent="secondary">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* 인증 코드 */}
                <FormField label={t.request.labelCode}>
                  <input
                    type="text"
                    value={form.accessCode}
                    onChange={handleCodeChange}
                    placeholder={t.request.placeholderCode}
                    className={`${inputClassBase} ${inputAccentClass.secondary}`}
                  />
                </FormField>

                {/* 초대인 (코드 입력 시 자동 완성) */}
                <FormField label={t.request.labelInvitedBy}>
                  <input
                    type="text"
                    value={form.invitedBy}
                    onChange={handleChange('invitedBy')}
                    placeholder={t.request.placeholderInvitedBy}
                    className={`${inputClassBase} ${inputAccentClass.secondary}`}
                  />
                </FormField>

                {/* 이름 */}
                <FormField label={t.request.labelName}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder={t.request.placeholderName}
                    className={`${inputClassBase} ${inputAccentClass.secondary}`}
                  />
                </FormField>

                {/* 이메일 */}
                <FormField label={t.request.labelEmail}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder={t.request.placeholderEmail}
                    className={`${inputClassBase} ${inputAccentClass.secondary}`}
                  />
                </FormField>

                {/* 인스타그램 */}
                <FormField label={t.request.labelInstagram}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none font-mono text-small md:text-body text-terminal-accent-secondary">
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
                      className={`${inputClassBase} ${inputAccentClass.secondary} pl-6`}
                    />
                  </div>
                </FormField>

                {/* 개인정보 동의 */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={form.privacyConsent}
                        onChange={e => setForm(prev => ({ ...prev, privacyConsent: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border font-mono text-xs flex items-center justify-center transition-colors ${
                        form.privacyConsent
                          ? 'border-terminal-accent-secondary bg-terminal-accent-secondary/20 text-terminal-accent-secondary'
                          : 'border-terminal-accent-secondary/30 text-transparent'
                      }`}>✓</div>
                    </div>
                    <span className="font-mono text-terminal-subdued leading-relaxed group-hover:text-terminal-primary transition-colors">
                      <MetaText autoHeight text={t.request.privacyConsent} />
                    </span>
                  </label>
                </div>

                {/* 마케팅 동의 (선택) */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={form.marketingConsent}
                        onChange={e => setForm(prev => ({ ...prev, marketingConsent: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border font-mono text-xs flex items-center justify-center transition-colors ${
                        form.marketingConsent
                          ? 'border-terminal-accent-secondary bg-terminal-accent-secondary/20 text-terminal-accent-secondary'
                          : 'border-terminal-accent-secondary/30 text-transparent'
                      }`}>✓</div>
                    </div>
                    <span className="font-mono text-terminal-subdued leading-relaxed group-hover:text-terminal-primary transition-colors">
                      <MetaText autoHeight text={t.request.marketingConsent} />
                    </span>
                  </label>
                </div>

                {/* 에러 메시지 */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-mono text-terminal-accent-alert"
                    >
                      <LabelText text={`⚠ ERROR: ${error}`} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 제출 버튼 */}
                <div className="flex justify-end pt-2">
                  <SubmitButton
                    isSubmitting={isSubmitting}
                    variant="primary"
                    defaultText={t.request.submitBtn}
                    loadingText={t.request.submitting}
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

export default function RequestAccessPage() {
  return (
    <Suspense>
      <RequestAccessContent />
    </Suspense>
  );
}
