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
}

const SEED_LOGS: LogEntry[] = [
  { id: 'a1', handle: 'SYS_ADMIN', message: 'External data received. Analog noise filtered. Thank you ;)', ts: '2026.04.09 / 14:40' },
  { id: 'a2', handle: 'STANN_LUMO', message: 'Database connected. Ready for Sector 02.', ts: '2026.04.09 / 14:12' },
  { id: 'a3', handle: 'GUEST_09', message: 'System operating normally.', ts: '2026.04.09 / 13:55' },
];

export default function TransmitPage() {
  const [logs, setLogs] = useState<LogEntry[]>(SEED_LOGS);
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('terminal_transmit');
    if (stored) {
      try { setLogs([...JSON.parse(stored), ...SEED_LOGS]); } catch {}
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || !message.trim()) { setError('ALIAS AND MESSAGE REQUIRED.'); return; }
    if (message.length > 280) { setError('MESSAGE EXCEEDS 280 CHARS.'); return; }
    const entry: LogEntry = {
      id: Date.now().toString(),
      handle: handle.trim().toUpperCase().replace(/\s+/g, '_'),
      message: message.trim(),
      ts: new Date().toISOString().slice(0, 16).replace('T', ' / '),
    };
    const newLogs = [entry, ...logs];
    setLogs(newLogs);
    const toStore = newLogs.filter(l => !SEED_LOGS.find(s => s.id === l.id));
    localStorage.setItem('terminal_transmit', JSON.stringify(toStore));
    setHandle('');
    setMessage('');
    setError('');
    setSent(true);
    setTimeout(() => setSent(false), 2500);
    logRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
              <label className="block text-xs mb-1.5 tracking-widest font-mono text-terminal-muted">
                <LabelText text="ALIAS:" />
              </label>
              <input
                value={handle}
                onChange={e => setHandle(e.target.value)}
                placeholder="ENTER_ALIAS"
                maxLength={24}
                className="w-full bg-transparent outline-none px-3 py-2 text-xs border border-terminal-accent-purple/30 focus:border-terminal-accent-purple/70 transition-colors font-mono text-terminal-accent-purple caret-terminal-accent-purple"
              />
            </div>
              <div>
                <label className="block text-xs mb-1.5 tracking-widest font-mono text-terminal-muted">
                  <span className="flex justify-between w-full">
                    <LabelText text="MESSAGE:" />
                    <DataText text={`(${message.length}/280)`} className="inline text-terminal-muted" />
                  </span>
                </label>
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
          <TerminalPanel title={`SIGNAL_LOG — ${logs.length} ENTRIES`} accent="green">
            <div ref={logRef} className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-terminal-accent-amber/20">
              {logs.map((entry, i) => (
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
