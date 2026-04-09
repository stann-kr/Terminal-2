import { DataText, MetaText } from '@/components/ui/TerminalText';

interface Props {
  label: string;
  value: string;
  unit: string;
  accent?: 'amber' | 'cyan' | 'hot' | 'green' | 'gold';
  delay?: number;
}

const accentClassMap = {
  amber: 'border-terminal-accent-amber/25 text-terminal-accent-amber drop-shadow-[0_0_12px_rgba(212,146,10,0.4)]',
  cyan: 'border-terminal-accent-cyan/25 text-terminal-accent-cyan drop-shadow-[0_0_12px_rgba(58,152,128,0.4)]',
  hot: 'border-terminal-accent-hot/25 text-terminal-accent-hot drop-shadow-[0_0_12px_rgba(200,80,32,0.4)]',
  green: 'border-terminal-accent-cyan/25 text-terminal-accent-cyan drop-shadow-[0_0_12px_rgba(58,152,128,0.4)]',
  gold: 'border-terminal-accent-gold/25 text-terminal-accent-gold drop-shadow-[0_0_12px_rgba(200,160,48,0.4)]',
};

const labelColorMap = {
  amber: 'text-terminal-accent-amber/50',
  cyan: 'text-terminal-accent-cyan/50',
  hot: 'text-terminal-accent-hot/50',
  green: 'text-terminal-accent-cyan/50',
  gold: 'text-terminal-accent-gold/50',
};

export default function StatusMetric({ label, value, unit, accent = 'amber', delay = 0 }: Props) {
  const accentClasses = accentClassMap[accent];
  const labelColorClass = labelColorMap[accent];

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
