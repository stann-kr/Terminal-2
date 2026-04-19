'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import ReturnLink from '@/components/ui/ReturnLink';
import TerminalPanel from '@/components/TerminalPanel';
import TerminalButton from '@/components/TerminalButton';
import SubmitButton from '@/components/SubmitButton';
import { LabelText, MetaText, SubtitleText } from '@/components/ui/TerminalText';
import { FormField, inputClassBase, inputAccentClass } from '@/components/ui/FormField';
import { useLang } from '@/lib/langContext';
import { requestKo } from '@/lib/i18n';
import type { TerminalEvent } from '@/lib/eventData';

const ACCESS_WINDOW_DAYS = 30;

const DEFAULT_INVITATION_LINES = [
  'YOU HAVE BEEN GRANTED ACCESS TO THIS CHANNEL.',
  'THIS INVITATION IS PERSONAL AND NON-TRANSFERABLE.',
  'TERMINAL IS A PRIVATE EVENT — ENTRY BY AUTHORIZATION ONLY.',
  'SUBMIT YOUR REQUEST BELOW TO BE CONSIDERED FOR ADMISSION.',
  'AN ACCESS CODE IS REQUIRED. IF YOU DO NOT HAVE ONE,',
  'CONTACT YOUR INVITER FOR THE CURRENT SESSION CODE.',
];

interface FormState {
  name: string;
  email: string;
  instagram: string;
  invitedBy: string;
  accessCode: string;
  privacyConsent: boolean;
}

export default function RequestAccessPage() {
  const { lang } = useLang();
  const [event, setEvent] = useState<TerminalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [daysUntil, setDaysUntil] = useState(0);

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    instagram: '',
    invitedBy: '',
    accessCode: '',
    privacyConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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
      .catch(() => setError('SIGNAL LINK UNSTABLE.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof Omit<FormState, 'privacyConsent'>) =>
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
        const errorMapEn: Record<string, string> = {
          ALL_FIELDS_REQUIRED: 'ALL FIELDS ARE REQUIRED.',
          PRIVACY_CONSENT_REQUIRED: 'PRIVACY CONSENT IS REQUIRED.',
          INVALID_EMAIL_FORMAT: 'INVALID EMAIL FORMAT.',
          NO_UPCOMING_EVENT: 'NO UPCOMING EVENT FOUND.',
          REQUEST_PERIOD_INACTIVE: 'REQUEST PERIOD IS NOT ACTIVE.',
          INVALID_ACCESS_CODE: 'INVALID ACCESS CODE.',
          EMAIL_ALREADY_REGISTERED: 'THIS EMAIL HAS ALREADY BEEN REGISTERED.',
          INTERNAL_SERVER_ERROR: 'TRANSMISSION FAILED. RETRY LATER.',
        };
        const errorMapKo = requestKo.errors;
        const errKey = data.error ?? '';
        if (lang === 'ko') {
          setError(
            errorMapKo[errKey as keyof typeof errorMapKo] ?? errorMapKo.TRANSMISSION_FAILED
          );
        } else {
          setError(errorMapEn[errKey] ?? 'TRANSMISSION FAILED.');
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setError(lang === 'ko' ? requestKo.errors.CONNECTION_ERROR : 'TRANSMISSION FAILED. CHECK CONNECTION.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const invitationLines = lang === 'ko'
    ? (event?.invitationLines?.ko ?? requestKo.invitationLines)
    : (event?.invitationLines?.en ?? DEFAULT_INVITATION_LINES);

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
          <LabelText text={lang === 'ko' ? requestKo.loading : '▸ LOADING REQUEST DATA...'} />
        </motion.div>
      ) : !isActive ? (
        /* 비활성 기간 안내 */
        <motion.div variants={itemVariants}>
          <TerminalPanel title="REQUEST_STATUS" accent="alert">
            <div className="space-y-3 text-center py-4">
              <div className="text-sm font-bold tracking-widest font-mono text-terminal-accent-alert">
                <LabelText text={lang === 'ko' ? requestKo.periodInactive : '⚠ REQUEST PERIOD INACTIVE'} />
              </div>
              <div className="text-xs font-mono text-terminal-muted space-y-1">
                {event ? (
                  <>
                    <div>
                      <MetaText text={lang === 'ko'
                        ? requestKo.windowInfo(ACCESS_WINDOW_DAYS)
                        : `NEXT RESPONSE WINDOW OPENS ${ACCESS_WINDOW_DAYS} DAYS BEFORE EVENT`} />
                    </div>
                    <div>
                      <MetaText text={lang === 'ko'
                        ? requestKo.eventDate(event.date.replace(/-/g, '.'), event.time)
                        : `EVENT DATE — ${event.date.replace(/-/g, '.')} · ${event.time}`} />
                    </div>
                    <div className="pt-1 text-terminal-accent-primary">
                      <MetaText text={lang === 'ko'
                        ? requestKo.windowCountdown(daysUntil - ACCESS_WINDOW_DAYS)
                        : `WINDOW OPENS IN T-${daysUntil - ACCESS_WINDOW_DAYS} DAYS`} />
                    </div>
                  </>
                ) : (
                  <MetaText text={lang === 'ko' ? requestKo.noEvent : 'NO UPCOMING EVENT SCHEDULED. CHECK BACK LATER.'} />
                )}
              </div>
            </div>
          </TerminalPanel>
        </motion.div>
      ) : submitted ? (
        /* 제출 성공 */
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <TerminalPanel title="REQUEST_COMMITTED" accent="secondary">
            <div className="text-center py-6 space-y-2">
              <div className="text-sm font-bold tracking-widest font-mono text-terminal-accent-secondary">
                <LabelText text={lang === 'ko' ? requestKo.committed : '✓ REQUEST COMMITTED — AWAIT CONFIRMATION'} />
              </div>
              <div className="text-xs font-mono text-terminal-muted">
                <MetaText text={lang === 'ko' ? requestKo.committedSub : 'YOUR REQUEST HAS BEEN RECORDED. FURTHER INSTRUCTIONS WILL FOLLOW.'} />
              </div>
            </div>
          </TerminalPanel>
        </motion.div>
      ) : (
        /* 활성 폼 */
        <div className="space-y-4">
          {/* 초대 메시지 */}
          <motion.div variants={itemVariants}>
            <TerminalPanel title="INVITATION_BRIEF" accent="secondary">
              <div className="space-y-1.5">
                {invitationLines.map((line, i) => (
                  <div key={i} className="font-mono text-terminal-subdued tracking-wide">
                    <SubtitleText text={`> ${line}`} delay={i * 40} />
                  </div>
                ))}
              </div>
            </TerminalPanel>
          </motion.div>

          {/* 신청 폼 */}
          <motion.div variants={itemVariants}>
            <TerminalPanel title="GUEST_REQUEST_FORM" accent="secondary">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* 이름 */}
                <FormField label={lang === 'ko' ? requestKo.labelName : 'NAME:'}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder={lang === 'ko' ? requestKo.placeholderName : 'FULL NAME'}
                    className={`${inputClassBase} ${inputAccentClass.secondary}`}
                  />
                </FormField>

                {/* 이메일 */}
                <FormField label={lang === 'ko' ? requestKo.labelEmail : 'EMAIL:'}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder={lang === 'ko' ? requestKo.placeholderEmail : 'YOUR@EMAIL.COM'}
                    className={`${inputClassBase} ${inputAccentClass.secondary}`}
                  />
                </FormField>

                {/* 인스타그램 */}
                <FormField label={lang === 'ko' ? requestKo.labelInstagram : 'INSTAGRAM_ID:'}>
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

                {/* 초대인 */}
                <FormField label={lang === 'ko' ? requestKo.labelInvitedBy : 'INVITED_BY:'}>
                  <input
                    type="text"
                    value={form.invitedBy}
                    onChange={handleChange('invitedBy')}
                    placeholder={lang === 'ko' ? requestKo.placeholderInvitedBy : 'NAME OF YOUR INVITER'}
                    className={`${inputClassBase} ${inputAccentClass.secondary}`}
                  />
                </FormField>

                {/* 인증 코드 */}
                <FormField label={lang === 'ko' ? requestKo.labelCode : 'ACCESS_CODE:'}>
                  <input
                    type="text"
                    value={form.accessCode}
                    onChange={handleChange('accessCode')}
                    placeholder={lang === 'ko' ? requestKo.placeholderCode : 'SESSION ACCESS CODE'}
                    className={`${inputClassBase} ${inputAccentClass.secondary}`}
                  />
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
                      }`}>
                        ✓
                      </div>
                    </div>
                    <span className="font-mono text-terminal-muted leading-relaxed group-hover:text-terminal-subdued transition-colors">
                      <MetaText text={lang === 'ko' ? requestKo.privacyConsent : 'I CONSENT TO THE COLLECTION AND USE OF MY PERSONAL INFORMATION (NAME, EMAIL, INSTAGRAM ID) FOR THE PURPOSE OF EVENT GUEST MANAGEMENT. DATA WILL NOT BE SHARED WITH THIRD PARTIES.'} />
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
                    defaultText={lang === 'ko' ? requestKo.submitBtn : '▶ SUBMIT REQUEST'}
                    loadingText={lang === 'ko' ? requestKo.submitting : '▸ TRANSMITTING...'}
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
