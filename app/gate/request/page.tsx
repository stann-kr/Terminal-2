'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import ReturnLink from '@/components/ui/ReturnLink';
import TerminalPanel from '@/components/TerminalPanel';
import SubmitButton from '@/components/SubmitButton';
import { LabelText, MetaText, SubtitleText } from '@/components/ui/TerminalText';
import ConsentCheckbox from '@/components/ui/ConsentCheckbox';
import ConsentBlock from '@/components/ui/ConsentBlock';
import { FormField, inputClassBase, inputAccentClass } from '@/components/ui/FormField';
import { useLang, useT } from '@/lib/langContext';
import { getRequestWindowState } from '@/lib/eventLifecycle';
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

export default function RequestAccessPage() {
  const { lang } = useLang();
  const t = useT();
  const [event, setEvent] = useState<TerminalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [daysUntil, setDaysUntil] = useState(0);

  const [form, setForm] = useState<FormState>({
    accessCode: '',
    invitedBy: '',
    name: '',
    email: '',
    instagram: '',
    privacyConsent: false,
    marketingConsent: false,
  });

  // 코드 검증 상태
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeArtistName, setCodeArtistName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [invitedByType, setInvitedByType] = useState<'dj' | 'other'>('dj');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verificationAbortRef = useRef<AbortController | null>(null);
  const verificationSequenceRef = useRef(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const verifyCode = useCallback((code: string) => {
    const normalizedCode = code.trim();
    const sequence = ++verificationSequenceRef.current;

    verificationAbortRef.current?.abort();
    if (!normalizedCode) {
      setCodeVerified(false);
      setCodeArtistName(null);
      setIsVerifying(false);
      return;
    }

    const controller = new AbortController();
    verificationAbortRef.current = controller;
    setIsVerifying(true);
    void fetch('/api/gate/code-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: normalizedCode }),
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Code verification failed');
        return res.json() as Promise<{ name: string | null }>;
      })
      .then((data) => {
        if (sequence !== verificationSequenceRef.current) return;
        if (data.name) {
          setCodeArtistName(data.name);
          setCodeVerified(true);
          setInvitedByType('dj');
          setForm(prev => ({ ...prev, invitedBy: data.name! }));
        } else {
          setCodeVerified(false);
          setCodeArtistName(null);
        }
      })
      .catch(() => {
        if (sequence !== verificationSequenceRef.current || controller.signal.aborted) return;
        setCodeVerified(false);
        setCodeArtistName(null);
      })
      .finally(() => {
        if (sequence === verificationSequenceRef.current) setIsVerifying(false);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/events?status=UPCOMING')
      .then(res => { if (!res.ok) throw new Error(); return res.json() as Promise<TerminalEvent[]>; })
      .then(data => {
        if (cancelled) return;
        if (data.length > 0) {
          const ev = data[0];
          setEvent(ev);
          const windowState = getRequestWindowState(ev, ACCESS_WINDOW_DAYS);
          setDaysUntil(windowState.daysUntil);
          setIsActive(windowState.isActive);
        }
      })
      .catch(() => { if (!cancelled) setError(t.common.signalUnstable); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [t.common.signalUnstable]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    verificationAbortRef.current?.abort();
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setForm(prev => ({ ...prev, accessCode: code }));
    // 코드 변경 시 즉시 미검증 상태로 전환하고 이전 요청을 무효화한다.
    ++verificationSequenceRef.current;
    verificationAbortRef.current?.abort();
    setCodeVerified(false);
    setCodeArtistName(null);
    setIsVerifying(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => verifyCode(code), 500);
  };

  const handleChange = (field: keyof Omit<FormState, 'privacyConsent' | 'marketingConsent' | 'accessCode'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!codeVerified) {
      setError(t.request.errors.INVALID_ACCESS_CODE);
      return;
    }
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

  // 비활성화 공통 클래스
  const disabledClass = !codeVerified
    ? 'opacity-30 select-none'
    : 'transition-opacity duration-300';

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
        <motion.div variants={itemVariants} className="font-mono text-terminal-muted text-center py-8">
          <LabelText text={t.request.loading} />
        </motion.div>
      ) : !isActive ? (
        <motion.div variants={itemVariants}>
          <TerminalPanel title="REQUEST_STATUS" accent="alert">
            <div className="space-y-3 text-center py-4">
              <div className="font-bold tracking-widest font-mono text-terminal-accent-alert">
                <LabelText text={t.request.periodInactive} />
              </div>
              <div className="font-mono text-terminal-muted space-y-1">
                {event ? (
                  <>
                    <div><MetaText text={t.request.windowInfo(ACCESS_WINDOW_DAYS)} /></div>
                    <div><MetaText text={t.request.eventDate(event.date.replace(/-/g, '.'), event.time)} /></div>
                    <div className="pt-1 text-terminal-accent-primary">
                      <MetaText
                        text={
                          daysUntil < 0
                            ? t.request.eventElapsed
                            : t.request.windowCountdown(Math.max(0, daysUntil - ACCESS_WINDOW_DAYS))
                        }
                      />
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
          {/* 초대 메시지 */}
          <motion.div variants={itemVariants}>
            <TerminalPanel title="INVITATION_BRIEF" accent="secondary">
              <div className="space-y-1.5">
                {invitationLines.map((line, i) => {
                  // 알파벳·한글·숫자가 없는 줄 = 순수 구분선 → nowrap + clip 처리
                  const isSeparator = line.trim().length > 0 && !/[a-zA-Z가-힣ㄱ-ㆎ\d]/.test(line);
                  return (
                    <div key={i} className={`font-mono text-terminal-subdued tracking-wide${isSeparator ? ' overflow-hidden' : ''}`}>
                      <SubtitleText
                        text={line}
                        delay={i * 40}
                        autoHeight={isSeparator}
                        style={isSeparator ? { whiteSpace: 'nowrap', overflow: 'hidden', display: 'block' } : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            </TerminalPanel>
          </motion.div>

          {/* 신청 폼 */}
          <motion.div variants={itemVariants}>
            <TerminalPanel title="GUEST_REQUEST_FORM" accent="secondary">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* 인증 코드 — 항상 활성화 */}
                <FormField label={t.request.labelCode} htmlFor="request-access-code">
                  <div className="relative">
                    <input
                      id="request-access-code"
                      type="text"
                      value={form.accessCode}
                      onChange={handleCodeChange}
                      placeholder={t.request.placeholderCode}
                      className={`${inputClassBase} ${inputAccentClass.secondary} pr-8`}
                    />
                    {/* 검증 상태 인디케이터 */}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-caption pointer-events-none">
                      {isVerifying ? (
                        <span className="text-terminal-muted animate-pulse">···</span>
                      ) : codeVerified ? (
                        <span className="text-terminal-accent-secondary">✓</span>
                      ) : form.accessCode ? (
                        <span className="text-terminal-accent-alert">✗</span>
                      ) : null}
                    </span>
                  </div>
                </FormField>

                {!codeVerified && form.accessCode && !isVerifying && (
                  <div className="font-mono text-terminal-accent-alert">
                    <MetaText text={t.request.errors.INVALID_ACCESS_CODE} />
                  </div>
                )}

                {/* 이하 필드 — 코드 미검증 시 비활성화 */}
                <div className={disabledClass}>

                  {/* 이름 */}
                  <div className="space-y-4">
                    <FormField label={t.request.labelName} htmlFor="request-name">
                      <input
                        id="request-name"
                        type="text"
                        value={form.name}
                        onChange={handleChange('name')}
                        placeholder={t.request.placeholderName}
                        disabled={!codeVerified}
                        className={`${inputClassBase} ${inputAccentClass.secondary}`}
                      />
                    </FormField>

                    {/* 이메일 */}
                    <FormField label={t.request.labelEmail} htmlFor="request-email">
                      <input
                        id="request-email"
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        placeholder={t.request.placeholderEmail}
                        disabled={!codeVerified}
                        className={`${inputClassBase} ${inputAccentClass.secondary}`}
                      />
                    </FormField>

                    {/* 인스타그램 */}
                    <FormField label={t.request.labelInstagram} htmlFor="request-instagram">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none font-mono text-small md:text-body text-terminal-accent-secondary">
                          @
                        </span>
                        <input
                          id="request-instagram"
                          type="text"
                          value={form.instagram.replace(/^@/, '')}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/^@+/, '');
                            setForm(prev => ({ ...prev, instagram: raw ? '@' + raw : '' }));
                          }}
                          placeholder="USERNAME"
                          disabled={!codeVerified}
                          className={`${inputClassBase} ${inputAccentClass.secondary} pl-6`}
                        />
                      </div>
                    </FormField>

                    {/* 초대인 — 라디오 선택 */}
                    <FormField label={t.request.labelInvitedBy}>
                      <div className="space-y-2 pt-1">
                        {/* DJ 옵션 */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative shrink-0">
                            <input
                              type="radio"
                              name="invitedByType"
                              checked={codeVerified && invitedByType === 'dj'}
                              onChange={() => {
                                setInvitedByType('dj');
                                setForm(prev => ({ ...prev, invitedBy: codeArtistName ?? '' }));
                              }}
                              disabled={!codeVerified}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 border font-mono text-xs flex items-center justify-center transition-colors ${
                              codeVerified && invitedByType === 'dj'
                                ? 'border-terminal-accent-secondary bg-terminal-accent-secondary/20 text-terminal-accent-secondary'
                                : 'border-terminal-accent-secondary/30 text-transparent'
                            }`}>✓</div>
                          </div>
                          <span className="font-mono text-small text-terminal-primary tracking-wider">
                            {codeArtistName ?? '—'}
                          </span>
                        </label>

                        {/* 기타 옵션 */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative shrink-0">
                            <input
                              type="radio"
                              name="invitedByType"
                              checked={codeVerified && invitedByType === 'other'}
                              onChange={() => {
                                setInvitedByType('other');
                                setForm(prev => ({ ...prev, invitedBy: '' }));
                              }}
                              disabled={!codeVerified}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 border font-mono text-xs flex items-center justify-center transition-colors ${
                              codeVerified && invitedByType === 'other'
                                ? 'border-terminal-accent-secondary bg-terminal-accent-secondary/20 text-terminal-accent-secondary'
                                : 'border-terminal-accent-secondary/30 text-transparent'
                            }`}>✓</div>
                          </div>
                          <span className="font-mono text-small text-terminal-primary tracking-wider">
                            {t.request.invitedByOther}
                          </span>
                        </label>

                        {/* 기타 선택 시 텍스트 입력 */}
                        <AnimatePresence>
                          {invitedByType === 'other' && codeVerified && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden pl-7"
                            >
                              <input
                                type="text"
                                value={form.invitedBy}
                                onChange={handleChange('invitedBy')}
                                placeholder={t.request.invitedByOtherPlaceholder}
                                className={`${inputClassBase} ${inputAccentClass.secondary} w-full`}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </FormField>

                    <ConsentBlock>
                      <ConsentCheckbox
                        checked={form.privacyConsent}
                        onChange={checked => setForm(prev => ({ ...prev, privacyConsent: checked }))}
                        label={t.request.privacyConsent}
                        disabled={!codeVerified}
                      />
                      <ConsentCheckbox
                        checked={form.marketingConsent}
                        onChange={checked => setForm(prev => ({ ...prev, marketingConsent: checked }))}
                        label={t.request.marketingConsent}
                        disabled={!codeVerified}
                      />
                    </ConsentBlock>
                  </div>
                </div>

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
                {!codeVerified && (
                  <div className="font-mono text-terminal-muted">
                    <MetaText text={t.request.errors.INVALID_ACCESS_CODE} />
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <SubmitButton
                    isSubmitting={isSubmitting}
                    disabled={!codeVerified}
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
