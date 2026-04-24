'use client';

import { MetaText } from '@/components/ui/TerminalText';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  badge?: string;
  disabled?: boolean;
  accent?: 'primary' | 'secondary' | 'alert' | 'warn';
}

const accentClasses: Record<
  NonNullable<ConsentCheckboxProps['accent']>,
  { border: string; bg: string; text: string; borderMuted: string }
> = {
  secondary: {
    border: 'border-terminal-accent-secondary',
    bg: 'bg-terminal-accent-secondary/20',
    text: 'text-terminal-accent-secondary',
    borderMuted: 'border-terminal-accent-secondary/30',
  },
  primary: {
    border: 'border-terminal-accent-primary',
    bg: 'bg-terminal-accent-primary/20',
    text: 'text-terminal-accent-primary',
    borderMuted: 'border-terminal-accent-primary/30',
  },
  alert: {
    border: 'border-terminal-accent-alert',
    bg: 'bg-terminal-accent-alert/20',
    text: 'text-terminal-accent-alert',
    borderMuted: 'border-terminal-accent-alert/30',
  },
  warn: {
    border: 'border-terminal-accent-warn',
    bg: 'bg-terminal-accent-warn/20',
    text: 'text-terminal-accent-warn',
    borderMuted: 'border-terminal-accent-warn/30',
  },
};

export default function ConsentCheckbox({
  checked,
  onChange,
  label,
  badge,
  disabled = false,
  accent = 'secondary',
}: ConsentCheckboxProps) {
  const cls = accentClasses[accent];

  return (
    <label className={`flex items-start gap-3 group ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 border font-mono text-xs flex items-center justify-center transition-colors ${
            checked
              ? `${cls.border} ${cls.bg} ${cls.text}`
              : `${cls.borderMuted} text-transparent`
          }`}
        >
          ✓
        </div>
      </div>
      <span className="font-mono text-terminal-subdued leading-relaxed group-hover:text-terminal-primary transition-colors">
        <MetaText autoHeight text={label} />
        {badge && (
          <span className="ml-1.5 text-terminal-subdued opacity-60">({badge})</span>
        )}
      </span>
    </label>
  );
}
