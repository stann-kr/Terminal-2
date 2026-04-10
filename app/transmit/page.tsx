'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedHeight from '@/components/ui/AnimatedHeight';
import TerminalPanel from '@/components/TerminalPanel';
import TerminalButton from '@/components/TerminalButton';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { LabelText, SubtitleText, MetaText, DataText } from '@/components/ui/TerminalText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import { getNodeId, setNodeId } from '@/lib/nodeId';

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
  const [logPage, setLogPage] = useState<LogPage>({ logs: [], total: 0, page: 1, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPage = (page: number) => {
    setLoading(true);
    fetch(`/api/transmit?page=${page}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json() as Promise<LogPage>; })
      .then(data => { setLogPage(data); setCurrentPage(data.page); })
      .catch(() => setError('SIGNAL LINK UNSTABLE.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setHandle(getNodeId());
    fetchPage(1);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || !message.trim()) { setError('ALIAS AND MESSAGE REQUIRED.'); return; }
    if (message.length > 280) { setError('MESSAGE EXCEEDS 280 CHARS.'); return; }

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
        setError(data.error ?? 'TRANSMISSION FAILED.');
        return;
      }

      setHandle(getNodeId());
      setMessage('');
      setError('');
      setSent(true);
      setTimeout(() => setSent(false), 2500);
      fetchPage(1);
    } catch {
      setError('TRANSMISSION FAILED. CHECK CONNECTION.');
    }
  };

  const { logs, total, totalPages } = logPage;

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/transmit" title="TRANSMIT.LOG" accent="purple" variants={itemVariants} />

      {/* Input Form */}
      <motion.div variants={itemVariants} className="mb-8">
        <TerminalPanel title="VISITOR_LOG — NODE_SYNC" accent="hot">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="w-full text-xs mb-1.5 tracking-widest font-mono text-terminal-muted">
                <LabelText text="ALIAS:" />
              </div>
              <input
                value={handle}
                onChange={e => { setHandle(e.target.value); setNodeId(e.target.value); }}
                placeholder="ENTER_ALIAS"
                maxLength={24}
                className="w-full bg-transparent outline-none px-3 py-2 text-xs border border-terminal-accent-purple/30 focus:border-terminal-accent-purple/70 transition-colors font-mono text-terminal-accent-purple caret-terminal-accent-purple"
              />
            </div>
            <div>
              <div className="flex justify-between items-center w-full text-xs mb-1.5 tracking-widest font-mono text-terminal-muted">
                <span className="flex-1 min-w-0">
                  <LabelText text="MESSAGE:" />
                </span>
                <DataText text={`(${message.length}/280)`} className="shrink-0 text-terminal-muted" />
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="WRITE TO DATABASE..."
                maxLength={280}
                rows={3}
                className="w-full bg-transparent outline-none px-3 py-2 text-xs border border-terminal-accent-purple/30 focus:border-terminal-accent-purple/70 resize-none transition-colors font-mono text-terminal-primary caret-terminal-accent-amber"
              />
            </div>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-mono text-terminal-accent-hot">
                  <LabelText text={`⚠ ERROR: ${error}`} />
                </motion.div>
              )}
              {sent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-mono text-terminal-accent-amber">
                  <LabelText text="✓ SIGNAL COMMITTED TO DATABASE" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-end pt-2">
              <TerminalButton type="submit" variant="danger">
                ▶ COMMIT SIGNAL
              </TerminalButton>
            </div>
          </form>
        </TerminalPanel>
      </motion.div>

      {/* Log */}
      <motion.div variants={itemVariants}>
        <TerminalPanel
          title={loading ? 'SIGNAL_LOG — SYNCING...' : `SIGNAL_LOG — ${total} ENTRIES`}
          accent="green"
        >
          <div className="space-y-4">
            {/* 로그 목록 */}
            <AnimatedHeight>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-mono text-terminal-muted text-center py-4"
                  >
                    <LabelText text="▸ SYNCHRONIZING WITH DATABASE..." />
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
                    <MetaText text="NO ENTRIES FOUND." />
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {logs.map((entry, i) => (
                      <div key={entry.id} className="border-b border-terminal-accent-cyan/10 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-xs font-bold tracking-wider font-mono text-terminal-accent-purple">
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
            <div className="flex items-center justify-between pt-2 border-t border-terminal-accent-cyan/10">
              <button
                onClick={() => fetchPage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="text-xs font-mono tracking-widest text-terminal-subdued hover:text-terminal-accent-amber disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ◀ PREV
              </button>
              <span className="text-xs font-mono text-terminal-subdued">
                {currentPage} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => fetchPage(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                className="text-xs font-mono tracking-widest text-terminal-subdued hover:text-terminal-accent-amber disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                NEXT ▶
              </button>
            </div>
          </div>
        </TerminalPanel>
      </motion.div>
    </PageLayout>
  );
}
