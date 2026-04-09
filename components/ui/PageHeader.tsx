'use client';
import { motion, Variants } from 'framer-motion';
import DecodeText from '@/components/DecodeText';

interface PageHeaderProps {
  path: string;
  title: string;
  accent?: 'amber' | 'cyan' | 'hot' | 'gold' | 'purple';
  variants?: Variants;
}

const defaultVariants = {
  hidden: {},
  visible: {},
};

const accentClassMap = {
  amber: 'text-terminal-accent-amber text-shadow-glow-amber',
  cyan: 'text-terminal-accent-cyan text-shadow-glow-cyan',
  hot: 'text-terminal-accent-hot text-shadow-glow-hot',
  gold: 'text-terminal-accent-gold text-shadow-glow-gold',
  purple: 'text-terminal-accent-purple',
};

export default function PageHeader({ path, title, accent = 'amber', variants = defaultVariants }: PageHeaderProps) {
  return (
    <motion.div variants={variants} className="mb-8 font-mono">
      <div className="text-xs tracking-widest mb-1 text-terminal-muted">
        <DecodeText text={path} speed={0.6} scramble={5} />
      </div>
      <DecodeText
        text={title}
        as="h1"
        speed={0.65}
        scramble={10}
        className={`text-3xl font-bold tracking-[0.2em] ${accentClassMap[accent]}`}
      />
    </motion.div>
  );
}
