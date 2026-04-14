import { DataText, MetaText } from '@/components/ui/TerminalText';

interface Props {
  label: string;
  value: string;
  unit: string;
  accent?: 'primary' | 'secondary' | 'alert' | 'warn' | 'tertiary' | 'amber' | 'cyan' | 'hot' | 'green' | 'gold';
  delay?: number;
}

const accentClassMap = {
  primary:   'border-terminal-accent-primary/25 text-terminal-accent-primary drop-shadow-[0_0_12px_rgb(var(--color-accent-primary)/0.4)]',
  secondary: 'border-terminal-accent-secondary/25 text-terminal-accent-secondary drop-shadow-[0_0_12px_rgb(var(--color-accent-secondary)/0.4)]',
  alert:     'border-terminal-accent-alert/25 text-terminal-accent-alert drop-shadow-[0_0_12px_rgb(var(--color-accent-alert)/0.4)]',
  warn:      'border-terminal-accent-warn/25 text-terminal-accent-warn drop-shadow-[0_0_12px_rgb(var(--color-accent-warn)/0.4)]',
  tertiary:  'border-terminal-accent-tertiary/25 text-terminal-accent-tertiary drop-shadow-[0_0_12px_rgb(var(--color-accent-tertiary)/0.4)]',
  /* Legacy mapping */
  amber: 'border-terminal-accent-primary/25 text-terminal-accent-primary drop-shadow-[0_0_12px_rgb(var(--color-accent-primary)/0.4)]',
  cyan:  'border-terminal-accent-secondary/25 text-terminal-accent-secondary drop-shadow-[0_0_12px_rgb(var(--color-accent-secondary)/0.4)]',
  hot:   'border-terminal-accent-alert/25 text-terminal-accent-alert drop-shadow-[0_0_12px_rgb(var(--color-accent-alert)/0.4)]',
  green: 'border-terminal-accent-primary/25 text-terminal-accent-primary drop-shadow-[0_0_12px_rgb(var(--color-accent-primary)/0.4)]',
  gold:  'border-terminal-accent-warn/25 text-terminal-accent-warn drop-shadow-[0_0_12px_rgb(var(--color-accent-warn)/0.4)]',
};

const labelColorMap = {
  primary:   'text-terminal-accent-primary/50',
  secondary: 'text-terminal-accent-secondary/50',
  alert:     'text-terminal-accent-alert/50',
  warn:      'text-terminal-accent-warn/50',
  tertiary:  'text-terminal-accent-tertiary/50',
  /* Legacy mapping */
  amber: 'text-terminal-accent-primary/50',
  cyan:  'text-terminal-accent-secondary/50',
  hot:   'text-terminal-accent-alert/50',
  green: 'text-terminal-accent-primary/50',
  gold:  'text-terminal-accent-warn/50',
};

export default function StatusMetric({ label, value, unit, accent = 'primary', delay = 0 }: Props) {
  const accentClasses = accentClassMap[accent] || accentClassMap.primary;
  const labelColorClass = labelColorMap[accent] || labelColorMap.primary;

  return (
    <div
      className={`border text-center py-5 px-3 bg-terminal-bg-panel transition-colors duration-300 ${accentClasses.split(' ')[0]}`}
    >
      <div className={`text-2xl font-bold mb-1 font-mono ${accentClasses.split(' ').slice(1).join(' ')}`}>
        <DataText text={value} />
      </div>
      <div className={`text-xs mb-2 font-mono ${labelColorClass}`}>
        <MetaText text={unit} />
      </div>
      <div className="text-xs tracking-widest text-terminal-muted font-mono">
        <MetaText text={label} />
      </div>
    </div>
  );
}
