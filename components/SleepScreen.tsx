'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import TerminalButton from '@/components/TerminalButton';

interface SleepScreenProps {
  onWake: () => void;
}

const SCREENSAVER_LINES = [
  'TERMINAL v2.2.0 — SESSION SUSPENDED',
  '> SLEEP MODE ACTIVE',
  '> LAST ACCESS: [TIMESTAMP]',
  '> SIGNAL STRENGTH: ████████░░ 82%',
  '> NETWORK: ONLINE',
  '> DSP ENGINE: STANDBY',
  '> MOVE CURSOR OR TAP TO RESUME...',
];

export default function SleepScreen({ onWake }: SleepScreenProps) {
  const [waking, setWaking] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const n = new Date();
      setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const wake = useCallback(() => {
    if (waking) return;
    setWaking(true);
    setTimeout(onWake, 1200);
  }, [waking, onWake]);

  useEffect(() => {
    const handleKey = () => wake();
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); };
  }, [wake]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-center items-center px-8 md:px-16 select-none bg-black font-mono"
      animate={waking ? { opacity: 0, filter: 'brightness(3) blur(4px)' } : { opacity: 1 }}
      transition={{ duration: 0.5 }}
      exit={{ opacity: 0 }}
    >
      {/* Dimmed scanlines */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 6px)',
      }} />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center">
        {/* Clock */}
        <div className="text-5xl md:text-7xl font-bold mb-8 phosphor-text tracking-[0.1em] text-terminal-accent-amber drop-shadow-[0_0_20px_rgba(212,146,10,0.5)]" suppressHydrationWarning={true}>
          {time}
        </div>

        <div className="mb-8 space-y-2">
          {SCREENSAVER_LINES.map((line, i) => (
            <motion.div
              key={i}
              className="text-xs tracking-wider text-terminal-muted/60"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 3, delay: i * 0.4, repeat: Infinity }}
            >
              {line}
            </motion.div>
          ))}
        </div>

        {!waking ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <TerminalButton onClick={wake} variant="primary" className="px-8">
              [ RESUME SESSION ]
            </TerminalButton>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs tracking-widest text-terminal-accent-amber drop-shadow-[0_0_8px_rgba(212,146,10,0.6)]">
            RESUMING SESSION...
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
