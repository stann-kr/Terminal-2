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

export default function TransmitPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [handle, setHandle] = useState(() => getNodeId());
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { data: logPage, isLoading: isInitialLoad, isFetching } = useQuery({
    queryKey: transmitKeys.list(currentPage),
    queryFn: () => fetchTransmitLogs(currentPage),
    placeholderData: keepPreviousData,
  });

  const { mutate: submitLog, isPending: isSubmitting } = useMutation({
    mutationFn: postTransmitLog,
    onSuccess: () => {
      setMessage('');
      setError('');
      setSent(true);
      setCurrentPage(1);
      queryClient.invalidateQueries({ queryKey: transmitKeys.all });
      setTimeout(() => setSent(false), 2500);
    },
    onError: () => {
      setError(t.transmit.errors.failed);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!handle.trim() || !message.trim()) { setError(t.transmit.errors.required); return; }
    if (message.length > 280) { setError(t.transmit.errors.tooLong); return; }

    submitLog({ handle: handle.trim(), message: message.trim(), deviceId: getNodeId() });
  };

  const { logs = [], total = 0, totalPages = 1 } = logPage ?? {};

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/transmit" title="TRANSMIT.LOG" accent="tertiary" variants={itemVariants} />

      {/* Input Form */}
      <motion.div variants={itemVariants} className="mb-8">
        <TerminalPanel title="VISITOR_LOG — NODE_SYNC" accent="alert">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label={t.transmit.labelAlias}>
              <input
                value={handle}
                onChange={e => { setHandle(e.target.value); setNodeId(e.target.value); }}
                placeholder={t.transmit.placeholderAlias}
                maxLength={24}
                className={`${inputClassBase} ${inputAccentClass.tertiary}`}
              />
            </FormField>
            <div>
              <div className="flex justify-between items-center mb-1.5 tracking-widest font-mono text-terminal-muted">
                <span className="flex-1 min-w-0">
                  <LabelText text={t.transmit.labelMessage} />
                </span>
                <DataText text={`(${message.length}/280)`} className="shrink-0 text-terminal-muted" />
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t.transmit.placeholderMsg}
                maxLength={280}
                rows={3}
                className={`${inputClassBase} ${inputAccentClass.primary} resize-none`}
              />
            </div>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-terminal-accent-alert">
                  <LabelText text={`⚠ ERROR: ${error}`} />
                </motion.div>
              )}
              {sent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-terminal-accent-primary">
                  <LabelText text={t.transmit.committed} />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-end pt-2">
              <SubmitButton
                isSubmitting={isSubmitting}
                variant="danger"
                defaultText={t.transmit.submitBtn}
                loadingText={t.transmit.submitting}
              />
            </div>
          </form>
        </TerminalPanel>
      </motion.div>

      {/* Log */}
      <motion.div variants={itemVariants}>
        <TerminalPanel
          title={isInitialLoad ? t.transmit.logSyncing : t.transmit.logTitle(total)}
          accent="primary"
        >
          <div className="space-y-4">
            {/* 로그 목록 */}
            <AnimatedHeight>
              <AnimatePresence mode="popLayout" initial={false}>
                {isInitialLoad ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-mono text-terminal-muted text-center py-4"
                  >
                    <LabelText text={t.transmit.syncing} />
                  </motion.div>
                ) : logs.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-mono text-terminal-muted text-center py-4"
                  >
                    <MetaText text={t.transmit.noEntries} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    animate={{ opacity: isFetching ? 0.4 : 1 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4 w-full"
                  >
                    {logs.map((entry) => (
                      <div key={entry.id} className="border-b border-terminal-accent-secondary/10 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-baseline gap-2 mb-1.5 overflow-hidden">
                          <span className="font-bold tracking-wider font-mono text-terminal-accent-tertiary shrink-0">
                            <SubtitleText autoHeight text={entry.handle} />
                          </span>
                          <span className="font-mono text-terminal-muted/50 shrink-0">
                            <MetaText autoHeight text={entry.ts} />
                          </span>
                        </div>
                        <div className="font-mono whitespace-pre-wrap break-words">
                          <SubtitleText autoHeight text={entry.message} className="text-terminal-subdued" />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </AnimatedHeight>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-between pt-2 border-t border-terminal-accent-secondary/10">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage <= 1 || isFetching || isInitialLoad || isSubmitting}
                className="text-small font-mono tracking-widest text-terminal-subdued hover:text-terminal-accent-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {t.transmit.prevBtn}
              </button>
              <span className="text-small font-mono text-terminal-subdued">
                {currentPage} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= totalPages || isFetching || isInitialLoad || isSubmitting}
                className="text-small font-mono tracking-widest text-terminal-subdued hover:text-terminal-accent-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {t.transmit.nextBtn}
              </button>
            </div>
          </div>
        </TerminalPanel>
      </motion.div>
    </PageLayout>
  );
}
