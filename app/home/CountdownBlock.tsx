'use client';
import { useState, useEffect } from 'react';
import DecodeText from '@/components/DecodeText';

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
    <div className="grid grid-cols-4 gap-2 sm:gap-4" suppressHydrationWarning={true}>
      {blocks.map((b) => (
        <div
          key={b.label}
          className="text-center border py-3 sm:py-4 border-terminal-accent-amber/25 bg-black/50"
        >
            <DecodeText
              text={b.val}
              speed={0.8}
              scramble={2}
              scrambleOnUpdate={false}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-terminal-accent-amber font-mono flex items-center justify-center drop-shadow-[0_0_24px_rgba(212,146,10,0.6)]"
            />
          <div className="text-xs mt-2 tracking-widest text-terminal-muted font-mono">
            <DecodeText text={b.label} speed={0.4} scramble={6} />
          </div>
        </div>
      ))}
    </div>
  );
}