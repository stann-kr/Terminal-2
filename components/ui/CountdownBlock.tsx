'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DataText, MetaText } from '@/components/ui/TerminalText';

interface Props {
  targetDate: Date;
  /** 'primary' = home/gate primary 테마, 'secondary' = gate 카운트다운 테마 */
  accent?: 'primary' | 'secondary' | 'amber' | 'cyan';
}

interface TimeDelta {
  elapsed: boolean;
  d: number;
  h: number;
  m: number;
  s: number;
}

function getTimeDelta(target: Date): TimeDelta {
  const diff = target.getTime() - Date.now();
  const abs = Math.abs(diff);
  return {
    elapsed: diff < 0,
    d: Math.floor(abs / 86400000),
    h: Math.floor((abs % 86400000) / 3600000),
    m: Math.floor((abs % 3600000) / 60000),
    s: Math.floor((abs % 60000) / 1000),
  };
}

interface AccentStyle {
  border: string;
  value: string;
  glow: string;
  label: string;
  wrapperClass: string;
  cellClass: string;
  valueSize: string;
  labelClass: string;
  modeLabel: string;
}

const primaryStyle: AccentStyle = {
  border: 'border-terminal-accent-primary/25',
  value: 'text-terminal-accent-primary',
  glow: 'drop-shadow-[0_0_24px_rgb(var(--color-accent-primary)/0.6)]',
  label: 'text-terminal-muted',
  wrapperClass: 'grid grid-cols-4 gap-2 sm:gap-4',
  cellClass: 'text-center border py-3 sm:py-4 bg-terminal-bg-overlay/50',
  valueSize: 'text-4xl md:text-5xl lg:text-6xl font-bold font-mono flex items-center justify-center',
  labelClass: 'text-xs mt-2 tracking-widest font-mono',
  modeLabel: 'text-terminal-accent-primary/60',
};

const secondaryStyle: AccentStyle = {
  border: 'border-terminal-accent-secondary/20',
  value: 'text-terminal-accent-secondary text-shadow-glow-secondary',
  glow: '',
  label: 'text-terminal-accent-secondary/50',
  wrapperClass: 'grid grid-cols-4 gap-3 font-mono',
  cellClass: 'text-center border bg-terminal-bg-overlay/40 py-4',
  valueSize: 'text-3xl sm:text-4xl md:text-5xl font-bold flex items-center justify-center',
  labelClass: 'text-xs mt-1 tracking-widest',
  modeLabel: 'text-terminal-accent-secondary/60',
};

const accentStyles: Record<string, AccentStyle> = {
  primary: primaryStyle,
  secondary: secondaryStyle,
  amber: primaryStyle,    // Legacy alias
  cyan: secondaryStyle,   // Legacy alias
};

export default function CountdownBlock({ targetDate, accent = 'primary' }: Props) {
  const [delta, setDelta] = useState<TimeDelta>({ elapsed: false, d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    setDelta(getTimeDelta(targetDate));
    const interval = setInterval(() => setDelta(getTimeDelta(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const blocks = [
    { label: 'DAYS',    val: String(delta.d).padStart(2, '0') },
    { label: 'HOURS',   val: String(delta.h).padStart(2, '0') },
    { label: 'MINUTES', val: String(delta.m).padStart(2, '0') },
    { label: 'SECONDS', val: String(delta.s).padStart(2, '0') },
  ];

  const s = accentStyles[accent] || accentStyles.primary;

  return (
    <motion.div
      suppressHydrationWarning={true}
      initial={{ y: 8 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* T+/T- 모드 레이블 */}
      <div className={`text-center mb-2 text-[10px] tracking-[0.2em] font-mono font-bold ${s.modeLabel}`}>
        <MetaText text={delta.elapsed ? 'T+ ELAPSED' : 'T- COUNTDOWN'} />
      </div>

      <div className={s.wrapperClass}>
        {blocks.map((b) => (
          <div key={b.label} className={`${s.cellClass} ${s.border}`}>
            <div className={s.glow}>
              <DataText
                text={b.val}
                className={`${s.valueSize} ${s.value}`}
              />
            </div>
            <div className={`${s.labelClass} ${s.label}`}>
              <MetaText text={b.label} autoHeight />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
