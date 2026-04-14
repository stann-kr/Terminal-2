'use client';
import { motion, Variants } from 'framer-motion';
import { HeadingText, LabelText } from '@/components/ui/TerminalText';

interface PageHeaderProps {
  path: string;
  title: string;
  accent?: 'primary' | 'secondary' | 'alert' | 'warn' | 'tertiary' | 'amber' | 'cyan' | 'hot' | 'gold' | 'purple';
  variants?: Variants;
}

const defaultVariants = {
  hidden: {},
  visible: {},
};

const accentClassMap: Record<string, string> = {
  primary:   'text-terminal-accent-primary text-shadow-glow-primary',
  secondary: 'text-terminal-accent-secondary text-shadow-glow-secondary',
  alert:     'text-terminal-accent-alert text-shadow-glow-alert',
  warn:      'text-terminal-accent-warn text-shadow-glow-warn',
  tertiary:  'text-terminal-accent-tertiary',
  /* Legacy mapping */
  amber:  'text-terminal-accent-primary text-shadow-glow-primary',
  cyan:   'text-terminal-accent-secondary text-shadow-glow-secondary',
  hot:    'text-terminal-accent-alert text-shadow-glow-alert',
  gold:   'text-terminal-accent-warn text-shadow-glow-warn',
  purple: 'text-terminal-accent-tertiary',
};

export default function PageHeader({ path, title, accent = 'primary', variants = defaultVariants }: PageHeaderProps) {
  const accentClass = accentClassMap[accent] || accentClassMap.primary;
  return (
    <motion.div variants={variants} className="mb-8 font-mono">
      <div className="text-xs tracking-widest mb-1 text-terminal-muted">
        <LabelText text={path} />
      </div>
      <HeadingText
        text={title}
        className={`text-xl md:text-2xl font-bold tracking-[0.2em] ${accentClass}`}
      />
    </motion.div>
  );
}
