'use client';
import { ReactNode, MouseEvent } from 'react';
import { LabelText } from './ui/TerminalText';

export type TerminalButtonVariant = 'primary' | 'ghost' | 'danger';

interface TerminalButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: TerminalButtonVariant;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const variantClassMap: Record<TerminalButtonVariant, { base: string; hover: string }> = {
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

export function getTerminalButtonClassName(
  variant: TerminalButtonVariant = 'primary',
  className = '',
) {
  const v = variantClassMap[variant];
  return `min-h-11 whitespace-nowrap cursor-pointer font-mono text-small tracking-widest uppercase px-5 py-2.5 transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 flex items-center justify-center border active:translate-y-px ${v.base} ${v.hover} disabled:opacity-40 disabled:cursor-not-allowed ${className}`;
}

export default function TerminalButton({
  children, onClick, variant = 'primary', className = '', disabled, type = 'button',
}: TerminalButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={getTerminalButtonClassName(variant, className)}
    >
      {typeof children === 'string' ? (
        <LabelText text={children} autoHeight />
      ) : (
        children
      )}
    </button>
  );
}
