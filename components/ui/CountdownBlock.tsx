'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DataText, MetaText } from '@/components/ui/TerminalText';

interface Props {
  targetDate: Date;
  /** 'amber' = home/gate amber 테마, 'cyan' = gate 카운트다운 테마 */
  accent?: 'amber' | 'cyan';
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

const accentStyles = {
  amber: {
    border: 'border-terminal-accent-amber/25',
    value: 'text-terminal-accent-amber',
    glow: 'drop-shadow-[0_0_24px_rgba(212,146,10,0.6)]',
    label: 'text-terminal-muted',
    labelGlow: '',
    wrapperClass: 'grid grid-cols-4 gap-2 sm:gap-4',
    cellClass: 'text-center border py-3 sm:py-4 bg-black/50',
    valueSize: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-mono flex items-center justify-center',
    labelClass: 'text-xs mt-2 tracking-widest font-mono',
  },
  cyan: {
    border: 'border-terminal-accent-cyan/20',
    value: 'text-terminal-accent-cyan text-shadow-glow-cyan',
    glow: '',
    label: 'text-terminal-accent-cyan/50',
    labelGlow: '',
    wrapperClass: 'grid grid-cols-4 gap-3 font-mono',
    cellClass: 'text-center border bg-black/40 py-4',
    valueSize: 'text-3xl sm:text-4xl md:text-5xl font-bold flex items-center justify-center',
    labelClass: 'text-xs mt-1 tracking-widest',
  },
};

export default function CountdownBlock({ targetDate, accent = 'amber' }: Props) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    setT(getTimeLeft(targetDate));
    const interval = setInterval(() => setT(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const blocks = [
    { label: 'DAYS',    val: String(t.d).padStart(2, '0') },
    { label: 'HOURS',   val: String(t.h).padStart(2, '0') },
    { label: 'MINUTES', val: String(t.m).padStart(2, '0') },
    { label: 'SECONDS', val: String(t.s).padStart(2, '0') },
  ];

  const s = accentStyles[accent];

  return (
    <motion.div
      className={s.wrapperClass}
      suppressHydrationWarning={true}
      initial={{ y: 8 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {blocks.map((b) => (
        <div key={b.label} className={`${s.cellClass} ${s.border}`}>
          <div className={s.glow}>
            <DataText
              text={b.val}
              className={`${s.valueSize} ${s.value}`}
            />
          </div>
          <div className={`${s.labelClass} ${s.label}`}>
            <MetaText text={b.label} />
          </div>
        </div>
      ))}
    </motion.div>
  );
}
