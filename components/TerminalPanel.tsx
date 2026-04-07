'use client';
import { ReactNode } from 'react';
import DecodeText from './DecodeText';

interface TerminalPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  accent?: 'green' | 'cyan' | 'hot' | 'amber';
}

const accentMap = {
  green: { border: 'rgba(212,146,10,0.28)', title: '#d4920a', glow: 'rgba(212,146,10,0.1)' },
  cyan:  { border: 'rgba(58,152,128,0.28)', title: '#3a9880', glow: 'rgba(58,152,128,0.1)' },
  hot:   { border: 'rgba(200,80,32,0.28)',  title: '#c85020', glow: 'rgba(200,80,32,0.1)' },
  amber: { border: 'rgba(200,160,48,0.28)', title: '#c8a030', glow: 'rgba(200,160,48,0.1)' },
};

export default function TerminalPanel({ children, className = '', title, accent = 'green' }: TerminalPanelProps) {
  const colors = accentMap[accent];
  return (
    <div
      className={`relative ${className}`}
      style={{
        border: `1px solid ${colors.border}`,
        background: 'rgba(18,14,8,0.95)',
        boxShadow: `0 0 24px ${colors.glow}, inset 0 0 16px rgba(0,0,0,0.5)`,
      }}
    >
      {title && (
        <div
          className="px-4 py-2 border-b flex items-center gap-2"
          style={{ borderColor: colors.border, background: 'rgba(0,0,0,0.35)' }}
        >
          <span className="text-xs" style={{ color: colors.title }}>▶</span>
          <DecodeText
            text={title}
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: colors.title }}
            speed={0.6}
            scramble={6}
          />
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
