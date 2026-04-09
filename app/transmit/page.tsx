'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TerminalPanel from '@/components/TerminalPanel';
import TerminalButton from '@/components/TerminalButton';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { LabelText, SubtitleText, MetaText, DataText } from '@/components/ui/TerminalText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';

interface LogEntry {
  id: string;
  handle: string;
  message: string;
  ts: string;
  createdAt?: string;
}

export default function TransmitPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);

  // 페이지 진입 시 DB에서 방명록 목록 로드
  useEffect(() => {
    fetch('/api/transmit')
      .then(res => { if (!res.ok) throw new Error(); return res.json() as Promise<LogEntry[]>; })
      .then((data) => setLogs(data))
      .catch(() => setError('SIGNAL LINK UNSTABLE.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || !message.trim()) { setError('ALIAS AND MESSAGE REQUIRED.'); return; }
    if (message.length > 280) { setError('MESSAGE EXCEEDS 280 CHARS.'); return; }

    try {
      const res = await fetch('/api/transmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim(), message: message.trim() }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'TRANSMISSION FAILED.');
        return;
      }

      const entry = await res.json() as LogEntry;
      setLogs(prev => [entry, ...prev]);
      setHandle('');
      setMessage('');
      setError('');
      setSent(true);
      setTimeout(() => setSent(false), 2500);
      logRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('TRANSMISSION FAILED. CHECK CONNECTION.');
    }
  };

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
                onChange={e => setHandle(e.target.value)}
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
          <TerminalPanel title={loading ? 'SIGNAL_LOG — SYNCING...' : `SIGNAL_LOG — ${logs.length} ENTRIES`} accent="green">
            <div ref={logRef} className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-terminal-accent-amber/20">
              {loading ? (
                <div className="text-xs font-mono text-terminal-muted text-center py-4">
                  <LabelText text="▸ SYNCHRONIZING WITH DATABASE..." />
                </div>
              ) : logs.map((entry, i) => (
                <div
                  key={entry.id}
                  className="border-b border-terminal-accent-cyan/10 pb-4"
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xs font-bold tracking-wider font-mono text-terminal-accent-purple">
                      <SubtitleText text={entry.handle} delay={i < 5 ? i * 40 : 0} />
                    </span>
                    <span className="text-xs font-mono text-terminal-muted">
                      <MetaText text={entry.ts} delay={i < 5 ? i * 40 : 0} />
                    </span>
                  </div>
                  <div className="text-xs leading-relaxed font-mono text-terminal-subdued group-hover:text-terminal-primary transition-colors">
                    <SubtitleText
                      text={`> ${entry.message}`}
                      delay={i < 5 ? i * 40 : 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TerminalPanel>
        </motion.div>
    </PageLayout>
  );
}
