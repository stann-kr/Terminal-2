'use client';
import React, { ReactNode } from 'react';
import { LabelText } from './ui/TerminalText';

interface TerminalPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  accent?: 'primary' | 'secondary' | 'alert' | 'warn' | 'green' | 'cyan' | 'hot' | 'amber';
}

const accentClassMap = {
  primary:   { border: 'border-terminal-accent-primary/40', title: 'text-terminal-accent-primary', glow: 'shadow-[0_0_24px_rgb(var(--color-accent-primary)/0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
  secondary: { border: 'border-terminal-accent-secondary/40', title: 'text-terminal-accent-secondary', glow: 'shadow-[0_0_24px_rgb(var(--color-accent-secondary)/0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
  alert:     { border: 'border-terminal-accent-alert/40',  title: 'text-terminal-accent-alert', glow: 'shadow-[0_0_24px_rgb(var(--color-accent-alert)/0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
  warn:      { border: 'border-terminal-accent-warn/40', title: 'text-terminal-accent-warn', glow: 'shadow-[0_0_24px_rgb(var(--color-accent-warn)/0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
  /* Legacy mapping */
  green:     { border: 'border-terminal-accent-primary/40', title: 'text-terminal-accent-primary', glow: 'shadow-[0_0_24px_rgb(var(--color-accent-primary)/0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
  cyan:      { border: 'border-terminal-accent-secondary/40', title: 'text-terminal-accent-secondary', glow: 'shadow-[0_0_24px_rgb(var(--color-accent-secondary)/0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
  hot:       { border: 'border-terminal-accent-alert/40',  title: 'text-terminal-accent-alert', glow: 'shadow-[0_0_24px_rgb(var(--color-accent-alert)/0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
  amber:     { border: 'border-terminal-accent-warn/40', title: 'text-terminal-accent-warn', glow: 'shadow-[0_0_24px_rgb(var(--color-accent-warn)/0.1),inset_0_0_16px_rgba(0,0,0,0.5)]' },
};

export default function TerminalPanel({ children, className = '', title, accent = 'primary' }: TerminalPanelProps) {
  const classes = accentClassMap[accent] || accentClassMap.primary;
  return (
    <div
      className={`relative bg-terminal-bg-panel border ${classes.border} ${classes.glow} ${className}`}
    >
      {title && (
        <div
          className={`px-4 py-2 border-b flex items-center gap-2 bg-[#0c0c10]/40 ${classes.border}`}
        >
          <span className={`text-xs ${classes.title}`}>▶</span>
          <LabelText
            text={title}
            className={`text-xs font-bold tracking-widest uppercase ${classes.title}`}
          />
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
