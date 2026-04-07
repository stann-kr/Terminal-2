'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import TerminalPanel from '@/components/TerminalPanel';
import TerminalButton from '@/components/TerminalButton';
import PageLayout from '@/components/PageLayout';
import DecodeText from '@/components/DecodeText';

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

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: {},
  visible: {},
};

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
      <motion.div
        className="w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <Link href="/home" className="text-xs tracking-widest cursor-pointer inline-block px-3 py-1.5 border transition-colors whitespace-nowrap"
            style={{ borderColor: 'rgba(212,146,10,0.25)', color: '#6a5030', fontFamily: 'var(--font-mono)' }}>
            <DecodeText text="◀ RETURN /home" speed={0.8} scramble={4} />
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10' }}>
            <DecodeText text="/terminal/transmit" speed={0.6} scramble={5} />
          </div>
          <DecodeText
            text="TRANSMIT.LOG"
            as="h1"
            speed={0.65}
            scramble={10}
            className="text-3xl font-bold"
            style={{ color: '#8868a8', textShadow: '0 0 16px rgba(136,104,168,0.4)', letterSpacing: '0.2em' }}
          />
        </motion.div>

        {/* Input Form */}
        <motion.div variants={itemVariants} className="mb-6">
          <TerminalPanel title="NEW_TRANSMISSION — OPEN_CHANNEL" accent="hot">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs mb-1.5 tracking-widest" style={{ color: '#3a5a3a', fontFamily: 'var(--font-mono)' }}>
                  <DecodeText text="HANDLE_ID:" speed={0.6} scramble={4} />
                </label>
                <input
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  placeholder="ENTER_YOUR_HANDLE"
                  maxLength={24}
                  className="w-full bg-transparent outline-none px-3 py-2 text-xs border transition-colors"
                  style={{
                    color: '#8868a8', borderColor: 'rgba(136,104,168,0.3)', fontFamily: 'var(--font-mono)',
                    caretColor: '#8868a8',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(136,104,168,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(136,104,168,0.3)')}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 tracking-widest" style={{ color: '#3a5a3a', fontFamily: 'var(--font-mono)' }}>
                  <span className="flex justify-between w-full">
                    <DecodeText text="MESSAGE:" speed={0.6} scramble={4} />
                    <DecodeText text={`(${message.length}/280)`} speed={0.4} scramble={4} style={{ color: '#2a4a2a', display: 'inline' }} />
                  </span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="TRANSMIT YOUR MESSAGE TO THE UNDERGROUND..."
                  maxLength={280}
                  rows={3}
                  className="w-full bg-transparent outline-none px-3 py-2 text-xs border resize-none transition-colors"
                  style={{
                    color: '#e8d890', borderColor: 'rgba(136,104,168,0.3)', fontFamily: 'var(--font-mono)',
                    caretColor: '#d4920a',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(136,104,168,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(136,104,168,0.3)')}
                />
              </div>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs" style={{ color: '#ff2079', fontFamily: 'var(--font-mono)' }}>
                    <DecodeText text={`⚠ ${error}`} speed={0.6} scramble={5} />
                  </motion.div>
                )}
                {sent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs" style={{ color: '#d4920a', fontFamily: 'var(--font-mono)' }}>
                    <DecodeText text="✓ SIGNAL TRANSMITTED SUCCESSFULLY" speed={0.6} scramble={6} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-end">
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
            <div ref={logRef} className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {logs.map((entry, i) => (
                <div
                  key={entry.id}
                  className="border-b pb-3"
                  style={{ borderColor: 'rgba(57,255,20,0.08)' }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold tracking-wider" style={{ color: '#8868a8', fontFamily: 'var(--font-mono)' }}>
                      <DecodeText text={entry.handle} speed={0.5} scramble={5} delay={i < 5 ? i * 40 : 0} />
                    </span>
                    <span className="text-xs" style={{ color: '#2a4a2a', fontFamily: 'var(--font-mono)' }}>
                      <DecodeText text={entry.ts} speed={0.4} scramble={4} delay={i < 5 ? i * 40 : 0} />
                    </span>
                  </div>
                  <div className="text-xs leading-5" style={{ color: '#8a6840', fontFamily: 'var(--font-mono)' }}>
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
      </motion.div>
    </PageLayout>
  );
}
