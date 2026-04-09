'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SleepScreenProps {
  onWake: () => void;
}

const SCREENSAVER_LINES = [
  'TERMINAL v4.2.0 — SESSION SUSPENDED',
  '> SLEEP MODE ACTIVE',
  '> LAST ACCESS: 2026.03.31 / 04:12:09',
  '> SIGNAL STRENGTH: ████████░░ 82%',
  '> UNDERGROUND NETWORK: ONLINE',
  '> DARKROOM PROTOCOL: STANDBY',
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
    const handleMove = () => wake();
    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousemove', handleMove, { once: true });
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('mousemove', handleMove); };
  }, [wake]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none bg-black font-mono"
      onClick={wake}
      animate={waking ? { opacity: 0, filter: 'brightness(3) blur(4px)' } : { opacity: 1 }}
      transition={{ duration: 0.5 }}
      exit={{ opacity: 0 }}
    >
      {/* Dimmed scanlines */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 6px)',
      }} />

      <div className="relative z-10 text-center px-8 max-w-xl">
        {/* Clock */}
        <div className="text-5xl md:text-7xl font-bold mb-8 phosphor-text tracking-[0.1em] text-terminal-accent-amber drop-shadow-[0_0_20px_rgba(212,146,10,0.5)]" suppressHydrationWarning={true}>
          {time}
        </div>

        <div className="mb-8 space-y-2">
          {SCREENSAVER_LINES.map((line, i) => (
            <motion.div
              key={i}
              className="text-xs tracking-wider text-terminal-muted/30"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 3, delay: i * 0.4, repeat: Infinity }}
            >
              {line}
            </motion.div>
          ))}
        </div>

        {!waking ? (
          <motion.div
            className="text-xs tracking-widest text-terminal-accent-amber"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ── TOUCH TO WAKE ──
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
