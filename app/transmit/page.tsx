'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TerminalPanel from '@/components/TerminalPanel';
import TerminalButton from '@/components/TerminalButton';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import DecodeText from '@/components/DecodeText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';

interface LogEntry {
  id: string;
  handle: string;
  message: string;
  ts: string;
}

const SEED_LOGS: LogEntry[] = [
  { id: 'a1', handle: 'BASSHEAD_KR', message: 'last session nearly killed me. my ears are still ringing. THANK YOU.', ts: '2026.03.28 / 04:11' },
  { id: 'a2', handle: 'NR_OBSERVER', message: 'the sound system in that basement is genuinely illegal. 10/10', ts: '2026.03.27 / 02:33' },
  { id: 'a3', handle: 'VOID_DANCER', message: 'who was that mystery b2b at 7am? need to know', ts: '2026.03.26 / 09:14' },
  { id: 'a4', handle: 'ACID_PILGRIM', message: 'flew in from berlin just for this. worth every km.', ts: '2026.03.25 / 22:05' },
  { id: 'a5', handle: 'GHOST_NODE_77', message: 'REBEKAH playing untitled acid at sunrise should be a human right', ts: '2026.03.24 / 07:52' },
  { id: 'a6', handle: 'DARKROOM_FAN', message: 'when is the next one? my soul needs this.', ts: '2026.03.23 / 18:40' },
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
    if (!handle.trim() || !message.trim()) { setError('HANDLE AND MESSAGE REQUIRED.'); return; }
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
          <TerminalPanel title="NEW_TRANSMISSION — OPEN_CHANNEL" accent="hot">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5 tracking-widest font-mono text-terminal-muted">
                  <DecodeText text="HANDLE_ID:" speed={0.6} scramble={4} />
                </label>
                <input
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  placeholder="ENTER_YOUR_HANDLE"
                  maxLength={24}
                  className="w-full bg-transparent outline-none px-3 py-2 text-xs border border-terminal-accent-purple/30 focus:border-terminal-accent-purple/70 transition-colors font-mono text-terminal-accent-purple caret-terminal-accent-purple"
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 tracking-widest font-mono text-terminal-muted">
                  <span className="flex justify-between w-full">
                    <DecodeText text="MESSAGE:" speed={0.6} scramble={4} />
                    <DecodeText text={`(${message.length}/280)`} speed={0.4} scramble={4} className="inline text-terminal-muted" />
                  </span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="TRANSMIT YOUR MESSAGE TO THE UNDERGROUND..."
                  maxLength={280}
                  rows={3}
                  className="w-full bg-transparent outline-none px-3 py-2 text-xs border border-terminal-accent-purple/30 focus:border-terminal-accent-purple/70 resize-none transition-colors font-mono text-terminal-primary caret-terminal-accent-amber"
                />
              </div>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-mono text-terminal-accent-hot">
                    <DecodeText text={`⚠ ${error}`} speed={0.6} scramble={5} />
                  </motion.div>
                )}
                {sent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-mono text-terminal-accent-amber">
                    <DecodeText text="✓ SIGNAL TRANSMITTED SUCCESSFULLY" speed={0.6} scramble={6} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-end pt-2">
                <TerminalButton type="submit" variant="danger">
                  <DecodeText text="▶ TRANSMIT SIGNAL" speed={0.6} scramble={5} />
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
                      <DecodeText text={entry.handle} speed={0.5} scramble={5} delay={i < 5 ? i * 40 : 0} />
                    </span>
                    <span className="text-xs font-mono text-terminal-muted">
                      <DecodeText text={entry.ts} speed={0.4} scramble={4} delay={i < 5 ? i * 40 : 0} />
                    </span>
                  </div>
                  <div className="text-xs leading-relaxed font-mono text-terminal-subdued group-hover:text-terminal-primary transition-colors">
                    <DecodeText
                      text={`> ${entry.message}`}
                      speed={0.5}
                      scramble={8}
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
