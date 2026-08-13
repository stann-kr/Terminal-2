'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedHeight from '@/components/ui/AnimatedHeight';
import TerminalPanel from '@/components/TerminalPanel';
import TerminalButton from '@/components/TerminalButton';
import SubmitButton from '@/components/SubmitButton';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { LabelText, SubtitleText, MetaText, DataText } from '@/components/ui/TerminalText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import { FormField, inputClassBase, inputAccentClass } from '@/components/ui/FormField';
import { getNodeId, setNodeId } from '@/lib/nodeId';
import { useT } from '@/lib/langContext';
import { fetchTransmitLogs, postTransmitLog, transmitKeys } from '@/lib/queries/transmit';

type TransmitField = 'handle' | 'message';
type FieldErrors = Partial<Record<TransmitField, string>>;

function formatLocalTime(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} / ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function TransmitPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [handle, setHandle] = useState(() => getNodeId());
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');

  const {
    data: logPage,
    isLoading: isInitialLoad,
    isFetching,
    isError: isLogError,
    refetch,
  } = useQuery({
    queryKey: transmitKeys.list(currentPage),
    queryFn: () => fetchTransmitLogs(currentPage),
    placeholderData: keepPreviousData,
  });

  const clearFieldError = (field: TransmitField) => {
    setFieldErrors(current => {
      if (!current[field]) return current;
      const { [field]: _cleared, ...remaining } = current;
      return remaining;
    });
  };

  const showFieldErrors = (errors: FieldErrors) => {
    setFieldErrors(errors);
    const firstField = Object.keys(errors)[0] as TransmitField | undefined;
    if (firstField) requestAnimationFrame(() => document.getElementById(`transmit-${firstField}`)?.focus());
  };

  const { mutate: submitLog, isPending: isSubmitting } = useMutation({
    mutationFn: postTransmitLog,
    onSuccess: () => {
      setMessage('');
      setFieldErrors({});
      setFormError('');
      setSent(true);
      setCurrentPage(1);
      queryClient.invalidateQueries({ queryKey: transmitKeys.all });
      setTimeout(() => setSent(false), 2500);
    },
    onError: (mutationError) => {
      const errorKey = mutationError instanceof Error ? mutationError.message : '';
      if (errorKey === 'MESSAGE_TOO_LONG') {
        showFieldErrors({ message: t.transmit.errors.tooLong });
      } else if (errorKey === 'HANDLE_REQUIRED' || errorKey === 'MESSAGE_REQUIRED') {
        showFieldErrors({ [errorKey === 'HANDLE_REQUIRED' ? 'handle' : 'message']: t.transmit.errors.required });
      } else {
        setFormError(t.transmit.errors.failed);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: FieldErrors = {};
    if (!handle.trim()) errors.handle = t.transmit.errors.required;
    if (!message.trim()) errors.message = t.transmit.errors.required;
    else if (message.length > 280) errors.message = t.transmit.errors.tooLong;

    if (Object.keys(errors).length > 0) {
      setFormError('');
      showFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError('');
    submitLog({ handle: handle.trim(), message: message.trim() });
  };

  const { logs = [], total = 0, totalPages = 1 } = logPage ?? {};

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/transmit" title="TRANSMIT.LOG" accent="primary" variants={itemVariants} />

      <motion.div variants={itemVariants} className="mb-8">
        <TerminalPanel title="VISITOR_LOG — NODE_SYNC" accent="alert">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField label={t.transmit.labelAlias} htmlFor="transmit-handle">
              <input
                id="transmit-handle"
                name="handle"
                type="text"
                value={handle}
                onChange={e => {
                  setHandle(e.target.value);
                  setNodeId(e.target.value);
                  clearFieldError('handle');
                }}
                placeholder={t.transmit.placeholderAlias}
                autoComplete="nickname"
                required
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.handle)}
                aria-describedby={fieldErrors.handle ? 'transmit-handle-error' : undefined}
                maxLength={24}
                className={`${inputClassBase} ${inputAccentClass.tertiary}`}
              />
            </FormField>
            {fieldErrors.handle && <FieldError id="transmit-handle-error" message={fieldErrors.handle} />}

            <div>
              <div className="flex justify-between items-center mb-1.5 tracking-widest font-mono text-terminal-muted">
                <label htmlFor="transmit-message" className="flex-1 min-w-0">
                  <LabelText text={t.transmit.labelMessage} />
                </label>
                <DataText text={`(${message.length}/280)`} className="shrink-0 text-terminal-muted" />
              </div>
              <textarea
                id="transmit-message"
                name="message"
                value={message}
                onChange={e => {
                  setMessage(e.target.value);
                  clearFieldError('message');
                }}
                placeholder={t.transmit.placeholderMsg}
                autoComplete="off"
                required
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? 'transmit-message-error' : 'transmit-message-count'}
                maxLength={280}
                rows={3}
                className={`${inputClassBase} ${inputAccentClass.primary} resize-none`}
              />
              <span id="transmit-message-count" className="sr-only">{message.length}/280</span>
            </div>
            {fieldErrors.message && <FieldError id="transmit-message-error" message={fieldErrors.message} />}

            <AnimatePresence mode="wait">
              {formError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-terminal-accent-alert" role="alert" aria-live="assertive">
                  <LabelText text={`⚠ ERROR: ${formError}`} />
                </motion.div>
              )}
              {sent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-terminal-accent-primary" role="status" aria-live="polite" aria-atomic="true">
                  <LabelText text={t.transmit.committed} />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-end pt-2">
              <SubmitButton isSubmitting={isSubmitting} variant="danger" defaultText={t.transmit.submitBtn} loadingText={t.transmit.submitting} />
            </div>
          </form>
        </TerminalPanel>
      </motion.div>

      <motion.div variants={itemVariants}>
        <TerminalPanel title={isInitialLoad ? t.transmit.logSyncing : t.transmit.logTitle(total)} accent="primary">
          <div className="space-y-4">
            <AnimatedHeight>
              <AnimatePresence mode="popLayout" initial={false}>
                {isInitialLoad ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="font-mono text-terminal-muted text-center py-4" role="status" aria-live="polite">
                    <LabelText text={t.transmit.syncing} />
                  </motion.div>
                ) : isLogError ? (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="font-mono text-terminal-accent-alert text-center py-4 space-y-3" role="alert">
                    <MetaText text={t.transmit.logLoadFailed} />
                    <div className="flex justify-center"><TerminalButton variant="ghost" onClick={() => void refetch()}>{t.transmit.retry}</TerminalButton></div>
                  </motion.div>
                ) : logs.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="font-mono text-terminal-muted text-center py-4" role="status" aria-live="polite">
                    <MetaText text={t.transmit.noEntries} />
                  </motion.div>
                ) : (
                  <motion.div key="content" animate={{ opacity: isFetching ? 0.4 : 1 }} transition={{ duration: 0.15 }} className="space-y-4 w-full">
                    {logs.map((entry) => (
                      <div key={entry.id} className="border-b border-terminal-accent-secondary/10 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-baseline gap-2 mb-1.5 overflow-hidden">
                          <span className="font-bold tracking-wider font-mono text-terminal-accent-tertiary shrink-0"><SubtitleText autoHeight text={entry.handle} /></span>
                          <span className="font-mono text-terminal-muted/50 shrink-0"><MetaText text={formatLocalTime(entry.createdAt)} /></span>
                        </div>
                        <div className="font-mono whitespace-pre-wrap break-words"><SubtitleText autoHeight text={entry.message} className="text-terminal-subdued" /></div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </AnimatedHeight>

            <div className="flex items-center justify-between pt-2 border-t border-terminal-accent-secondary/10">
              <button onClick={() => setCurrentPage(page => page - 1)} disabled={currentPage <= 1 || isFetching || isInitialLoad || isSubmitting} className="text-small font-mono tracking-widest text-terminal-subdued hover:text-terminal-accent-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer">
                {t.transmit.prevBtn}
              </button>
              <span className="text-small font-mono text-terminal-subdued" aria-live="polite">{currentPage} / {Math.max(1, totalPages)}</span>
              <button onClick={() => setCurrentPage(page => page + 1)} disabled={currentPage >= totalPages || isFetching || isInitialLoad || isSubmitting} className="text-small font-mono tracking-widest text-terminal-subdued hover:text-terminal-accent-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer">
                {t.transmit.nextBtn}
              </button>
            </div>
          </div>
        </TerminalPanel>
      </motion.div>
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
