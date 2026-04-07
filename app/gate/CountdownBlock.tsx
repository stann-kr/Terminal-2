'use client';
import { useState, useEffect } from 'react';

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
    <div className="grid grid-cols-4 gap-3" suppressHydrationWarning={true}>
      {blocks.map((b) => (
        <div key={b.label} className="text-center border py-4" style={{ borderColor: 'rgba(58,152,128,0.2)', background: 'rgba(0,0,0,0.4)' }}>
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ color: '#3a9880', textShadow: '0 0 16px rgba(58,152,128,0.5)', fontFamily: 'var(--font-mono)' }} suppressHydrationWarning={true}>
            {b.val}
          </div>
          <div className="text-xs mt-1 tracking-widest" style={{ color: '#2a5040', fontFamily: 'var(--font-mono)' }}>{b.label}</div>
        </div>
      ))}
    </div>
  );
}
