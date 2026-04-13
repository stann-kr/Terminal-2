'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedHeight from '@/components/ui/AnimatedHeight';
import TerminalPanel from '@/components/TerminalPanel';
import TerminalButton from '@/components/TerminalButton';
import SubmitButton from '@/components/SubmitButton';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { LabelText, SubtitleText, MetaText, DataText } from '@/components/ui/TerminalText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import { getNodeId, setNodeId } from '@/lib/nodeId';
import { useLang } from '@/lib/langContext';
import { transmitKo } from '@/lib/i18n';

interface LogEntry {
  id: string;
  handle: string;
  message: string;
  ts: string;
  createdAt?: string;
  deviceId?: string | null;
}

interface LogPage {
  logs: LogEntry[];
  total: number;
  page: number;
  totalPages: number;
}

export default function TransmitPage() {
  const { lang } = useLang();
  const [logPage, setLogPage] = useState<LogPage>({ logs: [], total: 0, page: 1, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const fetchPage = (page: number) => {
    setIsFetching(true);
    fetch(`/api/transmit?page=${page}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json() as Promise<LogPage>; })
      .then(data => { setLogPage(data); setCurrentPage(data.page); })
      .catch(() => setError(lang === 'ko' ? transmitKo.errors.linkUnstable : 'SIGNAL LINK UNSTABLE.'))
      .finally(() => {
        setIsInitialLoad(false);
        setIsFetching(false);
      });
  };

  useEffect(() => {
    setHandle(getNodeId());
    fetchPage(1);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!handle.trim() || !message.trim()) { setError(lang === 'ko' ? transmitKo.errors.required : 'ALIAS AND MESSAGE REQUIRED.'); return; }
    if (message.length > 280) { setError(lang === 'ko' ? transmitKo.errors.tooLong : 'MESSAGE EXCEEDS 280 CHARS.'); return; }

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: handle.trim(),
          message: message.trim(),
          deviceId: getNodeId(),
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(lang === 'ko' ? (transmitKo.errors.failed) : (data.error ?? 'TRANSMISSION FAILED.'));
        return;
      }

      setHandle(getNodeId());
      setMessage('');
      setError('');
      setSent(true);
      setTimeout(() => setSent(false), 2500);
      fetchPage(1);
    } catch {
      setError(lang === 'ko' ? transmitKo.errors.connection : 'TRANSMISSION FAILED. CHECK CONNECTION.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const { logs, total, totalPages } = logPage;

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/transmit" title="TRANSMIT.LOG" accent="tertiary" variants={itemVariants} />

      {/* Input Form */}
      <motion.div variants={itemVariants} className="mb-8">
        <TerminalPanel title="VISITOR_LOG — NODE_SYNC" accent="alert">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="w-full text-xs mb-1.5 tracking-widest font-mono text-terminal-muted">
                <LabelText text={lang === 'ko' ? transmitKo.labelAlias : 'ALIAS:'} />
              </div>
              <input
                value={handle}
                onChange={e => { setHandle(e.target.value); setNodeId(e.target.value); }}
                placeholder={lang === 'ko' ? transmitKo.placeholderAlias : 'ENTER_ALIAS'}
                maxLength={24}
                className="w-full bg-transparent outline-none px-3 py-2 text-xs border border-terminal-accent-tertiary/30 focus:border-terminal-accent-tertiary/70 transition-colors font-mono text-terminal-accent-tertiary caret-terminal-accent-tertiary"
              />
            </div>
            <div>
              <div className="flex justify-between items-center w-full text-xs mb-1.5 tracking-widest font-mono text-terminal-muted">
                <span className="flex-1 min-w-0">
                  <LabelText text={lang === 'ko' ? transmitKo.labelMessage : 'MESSAGE:'} />
                </span>
                <DataText text={`(${message.length}/280)`} className="shrink-0 text-terminal-muted" />
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={lang === 'ko' ? transmitKo.placeholderMsg : 'WRITE TO DATABASE...'}
                maxLength={280}
                rows={3}
                className="w-full bg-transparent outline-none px-3 py-2 text-xs border border-terminal-accent-tertiary/30 focus:border-terminal-accent-tertiary/70 resize-none transition-colors font-mono text-terminal-primary caret-terminal-accent-primary"
              />
            </div>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-mono text-terminal-accent-alert">
                  <LabelText text={`⚠ ERROR: ${error}`} />
                </motion.div>
              )}
              {sent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-mono text-terminal-accent-primary">
                  <LabelText text={lang === 'ko' ? transmitKo.committed : '✓ SIGNAL COMMITTED TO DATABASE'} />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-end pt-2">
              <SubmitButton
                isSubmitting={isSubmitting}
                variant="danger"
                defaultText={lang === 'ko' ? transmitKo.submitBtn : '▶ COMMIT SIGNAL'}
                loadingText={lang === 'ko' ? transmitKo.submitting : '▸ TRANSMITTING...'}
              />
            </div>
          </form>
        </TerminalPanel>
      </motion.div>

      {/* Log */}
      <motion.div variants={itemVariants}>
        <TerminalPanel
          title={isInitialLoad
            ? (lang === 'ko' ? transmitKo.logSyncing : 'SIGNAL_LOG — SYNCING...')
            : (lang === 'ko' ? transmitKo.logTitle(total) : `SIGNAL_LOG — ${total} ENTRIES`)}
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
                    <LabelText text={lang === 'ko' ? transmitKo.syncing : '▸ SYNCHRONIZING WITH DATABASE...'} />
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
                    <MetaText text={lang === 'ko' ? transmitKo.noEntries : 'NO ENTRIES FOUND.'} />
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isFetching ? 0.5 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 w-full"
                  >
                    {logs.map((entry, i) => (
                      <div key={entry.id} className="border-b border-terminal-accent-secondary/10 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-xs font-bold tracking-wider font-mono text-terminal-accent-tertiary">
                            <SubtitleText text={entry.handle} delay={i * 40} />
                          </span>
                          <span className="text-xs font-mono text-terminal-muted">
                            <MetaText text={entry.ts} delay={i * 40} />
                          </span>
                        </div>
                        <div className="text-xs leading-relaxed font-mono text-terminal-subdued">
                          <SubtitleText text={`> ${entry.message}`} delay={i * 40} />
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
                onClick={() => fetchPage(currentPage - 1)}
                disabled={currentPage <= 1 || isFetching || isInitialLoad || isSubmitting}
                className="text-xs font-mono tracking-widest text-terminal-subdued hover:text-terminal-accent-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {lang === 'ko' ? transmitKo.prevBtn : '◀ PREV'}
              </button>
              <span className="text-xs font-mono text-terminal-subdued">
                {currentPage} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => fetchPage(currentPage + 1)}
                disabled={currentPage >= totalPages || isFetching || isInitialLoad || isSubmitting}
                className="text-xs font-mono tracking-widest text-terminal-subdued hover:text-terminal-accent-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {lang === 'ko' ? transmitKo.nextBtn : 'NEXT ▶'}
              </button>
            </div>
          </div>
        </TerminalPanel>
      </motion.div>
    </PageLayout>
  );
}
