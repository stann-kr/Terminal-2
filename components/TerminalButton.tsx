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
    base: 'text-terminal-accent-primary border-terminal-accent-primary/50 bg-terminal-accent-primary/5 shadow-[0_0_12px_rgb(var(--color-accent-primary)/0.18)]',
    hover: 'hover:bg-terminal-accent-primary/10',
  },
  ghost: {
    base: 'text-terminal-subdued border-terminal-accent-primary/15 bg-transparent',
    hover: 'hover:bg-terminal-accent-primary/5',
  },
  danger: {
    base: 'text-terminal-accent-alert border-terminal-accent-alert/50 bg-terminal-accent-alert/5 shadow-[0_0_12px_rgb(var(--color-accent-alert)/0.18)]',
    hover: 'hover:bg-terminal-accent-alert/10',
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
      className={`whitespace-nowrap cursor-pointer font-mono text-xs tracking-widest uppercase px-5 py-2.5 transition-all duration-200 flex items-center justify-center border ${v.base} ${v.hover} disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {typeof children === 'string' ? (
        <LabelText text={children} autoHeight />
      ) : (
        children
      )}
    </button>
  );
}
