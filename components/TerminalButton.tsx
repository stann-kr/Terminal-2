'use client';
import { ReactNode, MouseEvent } from 'react';
import { LabelText } from './ui/TerminalText';

interface TerminalButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const variantClassMap = {
  primary: {
    base: 'text-terminal-accent-amber border-terminal-accent-amber/50 bg-terminal-accent-amber/5 shadow-[0_0_12px_rgba(212,146,10,0.18)]',
    hover: 'hover:bg-terminal-accent-amber/10',
  },
  ghost: {
    base: 'text-terminal-subdued border-terminal-accent-amber/15 bg-transparent',
    hover: 'hover:bg-terminal-accent-amber/5',
  },
  danger: {
    base: 'text-terminal-accent-hot border-terminal-accent-hot/50 bg-terminal-accent-hot/5 shadow-[0_0_12px_rgba(200,80,32,0.18)]',
    hover: 'hover:bg-terminal-accent-hot/10',
  },
};

export default function TerminalButton({
  children, onClick, variant = 'primary', className = '', disabled, type = 'button',
}: TerminalButtonProps) {
  const v = variantClassMap[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`whitespace-nowrap cursor-pointer font-mono text-xs tracking-widest uppercase px-5 py-2.5 transition-all duration-200 flex items-center justify-center border ${v.base} ${v.hover} disabled:opacity-40 ${className}`}
    >
      {typeof children === 'string' ? (
        <LabelText text={children} autoHeight />
      ) : (
        children
      )}
    </button>
  );
}
