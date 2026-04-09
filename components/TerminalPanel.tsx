'use client';
import React, { ReactNode } from 'react';
import DecodeText from './DecodeText';

interface TerminalPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  accent?: 'green' | 'cyan' | 'hot' | 'amber';
}

const accentClassMap = {
  green: { border: 'border-terminal-accent-amber/40', title: 'text-terminal-accent-amber', glow: 'shadow-[0_0_24px_rgba(212,146,10,0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
  cyan:  { border: 'border-terminal-accent-cyan/40', title: 'text-terminal-accent-cyan', glow: 'shadow-[0_0_24px_rgba(58,152,128,0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
  hot:   { border: 'border-terminal-accent-hot/40',  title: 'text-terminal-accent-hot', glow: 'shadow-[0_0_24px_rgba(200,80,32,0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
  amber: { border: 'border-terminal-accent-gold/40', title: 'text-terminal-accent-gold', glow: 'shadow-[0_0_24px_rgba(200,160,48,0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
};

export default function TerminalPanel({ children, className = '', title, accent = 'green' }: TerminalPanelProps) {
  const classes = accentClassMap[accent];
  return (
    <div
      className={`relative bg-terminal-bg-panel border ${classes.border} ${classes.glow} ${className}`}
    >
      {title && (
        <div
          className={`px-4 py-2 border-b flex items-center gap-2 bg-black/35 ${classes.border}`}
        >
          <span className={`text-xs ${classes.title}`}>▶</span>
          <DecodeText
            text={title}
            className={`text-xs font-bold tracking-widest uppercase ${classes.title}`}
            speed={0.6}
            scramble={6}
          />
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
