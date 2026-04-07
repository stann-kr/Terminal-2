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
    <div className="grid grid-cols-4 gap-2 sm:gap-4" suppressHydrationWarning={true}>
      {blocks.map((b) => (
        <div key={b.label} className="text-center">
          <div 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold py-3 sm:py-4 border" 
            style={{ 
              color: '#d4920a', 
              textShadow: '0 0 24px rgba(212,146,10,0.6), 0 0 48px rgba(212,146,10,0.3)',
              fontFamily: 'var(--font-mono)',
              borderColor: 'rgba(212,146,10,0.25)',
              background: 'rgba(0,0,0,0.5)'
            }} 
            suppressHydrationWarning={true}
          >
            {b.val}
          </div>
          <div className="text-xs mt-2 tracking-widest" style={{ color: '#5a4820', fontFamily: 'var(--font-mono)' }}>{b.label}</div>
        </div>
      ))}
    </div>
  );
}