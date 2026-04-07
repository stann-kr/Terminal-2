'use client';
import { ReactNode, MouseEvent } from 'react';
import DecodeText from './DecodeText';

interface TerminalButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const variants = {
  primary: {
    color: '#d4920a',
    border: 'rgba(212,146,10,0.5)',
    bg: 'rgba(212,146,10,0.05)',
    hover: 'rgba(212,146,10,0.12)',
    glow: 'rgba(212,146,10,0.18)',
  },
  ghost: {
    color: '#6a5030',
    border: 'rgba(212,146,10,0.15)',
    bg: 'transparent',
    hover: 'rgba(212,146,10,0.05)',
    glow: 'transparent',
  },
  danger: {
    color: '#c85020',
    border: 'rgba(200,80,32,0.5)',
    bg: 'rgba(200,80,32,0.05)',
    hover: 'rgba(200,80,32,0.12)',
    glow: 'rgba(200,80,32,0.18)',
  },
};

export default function TerminalButton({
  children, onClick, variant = 'primary', className = '', disabled, type = 'button',
}: TerminalButtonProps) {
  const v = variants[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`whitespace-nowrap cursor-pointer font-mono text-xs tracking-widest uppercase px-5 py-2.5 transition-all duration-200 flex items-center justify-center ${className}`}
      style={{
        color: v.color,
        border: `1px solid ${v.border}`,
        background: v.bg,
        boxShadow: `0 0 12px ${v.glow}`,
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = v.hover; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = v.bg; }}
    >
      {typeof children === 'string' ? (
        <DecodeText text={children} speed={0.7} scramble={5} />
      ) : (
        children
      )}
    </button>
  );
}
