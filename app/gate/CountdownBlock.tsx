'use client';
import { useState, useEffect } from 'react';
import { DataText } from '@/components/ui/TerminalText';

interface Props { targetDate: Date; }

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

export default function CountdownBlock({ targetDate }: Props) {
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

  return (
    <div className="grid grid-cols-4 gap-3 font-mono" suppressHydrationWarning={true}>
      {blocks.map((b) => (
        <div key={b.label} className="text-center border border-terminal-accent-cyan/20 bg-black/40 py-4">
          <DataText
            text={b.val}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-terminal-accent-cyan text-shadow-glow-cyan flex items-center justify-center"
          />
          <div className="text-xs mt-1 tracking-widest text-terminal-accent-cyan/50">{b.label}</div>
        </div>
      ))}
    </div>
  );
}
