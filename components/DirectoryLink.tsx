'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { LabelText, HeadingText, SubtitleText } from '@/components/ui/TerminalText';

type AccentColor = 'primary' | 'secondary' | 'warn' | 'alert' | 'tertiary';

interface DirectoryLinkProps {
  href: string;
  label: string;
  description: string;
  index: number;
  accent?: AccentColor | 'amber' | 'cyan' | 'gold' | 'hot' | 'purple';
  external?: boolean;
}

const accentClassMap: Record<string, { hover: string; text: string; glow: string }> = {
  primary:   { hover: 'group-hover:border-terminal-accent-primary group-hover:bg-terminal-accent-primary/5 group-hover:shadow-[0_0_20px_rgb(var(--color-accent-primary)/0.07)]', text: 'text-terminal-accent-primary', glow: 'group-hover:drop-shadow-[0_0_8px_rgb(var(--color-accent-primary)/0.6)]' },
  secondary: { hover: 'group-hover:border-terminal-accent-secondary group-hover:bg-terminal-accent-secondary/5 group-hover:shadow-[0_0_20px_rgb(var(--color-accent-secondary)/0.07)]', text: 'text-terminal-accent-secondary', glow: 'group-hover:drop-shadow-[0_0_8px_rgb(var(--color-accent-secondary)/0.6)]' },
  warn:      { hover: 'group-hover:border-terminal-accent-warn group-hover:bg-terminal-accent-warn/5 group-hover:shadow-[0_0_20px_rgb(var(--color-accent-warn)/0.07)]', text: 'text-terminal-accent-warn', glow: 'group-hover:drop-shadow-[0_0_8px_rgb(var(--color-accent-warn)/0.6)]' },
  alert:     { hover: 'group-hover:border-terminal-accent-alert group-hover:bg-terminal-accent-alert/5 group-hover:shadow-[0_0_20px_rgb(var(--color-accent-alert)/0.07)]', text: 'text-terminal-accent-alert', glow: 'group-hover:drop-shadow-[0_0_8px_rgb(var(--color-accent-alert)/0.6)]' },
  tertiary:  { hover: 'group-hover:border-terminal-accent-tertiary group-hover:bg-terminal-accent-tertiary/5 group-hover:shadow-[0_0_20px_rgb(var(--color-accent-tertiary)/0.07)]', text: 'text-terminal-accent-tertiary', glow: 'group-hover:drop-shadow-[0_0_8px_rgb(var(--color-accent-tertiary)/0.6)]' },
  /* Legacy mapping */
  amber:     { hover: 'group-hover:border-terminal-accent-primary group-hover:bg-terminal-accent-primary/5 group-hover:shadow-[0_0_20px_rgb(var(--color-accent-primary)/0.07)]', text: 'text-terminal-accent-primary', glow: 'group-hover:drop-shadow-[0_0_8px_rgb(var(--color-accent-primary)/0.6)]' },
  cyan:      { hover: 'group-hover:border-terminal-accent-secondary group-hover:bg-terminal-accent-secondary/5 group-hover:shadow-[0_0_20px_rgb(var(--color-accent-secondary)/0.07)]', text: 'text-terminal-accent-secondary', glow: 'group-hover:drop-shadow-[0_0_8px_rgb(var(--color-accent-secondary)/0.6)]' },
  gold:      { hover: 'group-hover:border-terminal-accent-warn group-hover:bg-terminal-accent-warn/5 group-hover:shadow-[0_0_20px_rgb(var(--color-accent-warn)/0.07)]', text: 'text-terminal-accent-warn', glow: 'group-hover:drop-shadow-[0_0_8px_rgb(var(--color-accent-warn)/0.6)]' },
  hot:       { hover: 'group-hover:border-terminal-accent-alert group-hover:bg-terminal-accent-alert/5 group-hover:shadow-[0_0_20px_rgb(var(--color-accent-alert)/0.07)]', text: 'text-terminal-accent-alert', glow: 'group-hover:drop-shadow-[0_0_8px_rgb(var(--color-accent-alert)/0.6)]' },
  purple:    { hover: 'group-hover:border-terminal-accent-tertiary group-hover:bg-terminal-accent-tertiary/5 group-hover:shadow-[0_0_20px_rgb(var(--color-accent-tertiary)/0.07)]', text: 'text-terminal-accent-tertiary', glow: 'group-hover:drop-shadow-[0_0_8px_rgb(var(--color-accent-tertiary)/0.6)]' },
};

export default function DirectoryLink({ href, label, description, index, accent = 'primary', external = false }: DirectoryLinkProps) {
  const [hovered, setHovered] = useState(false);
  const v = accentClassMap[accent] || accentClassMap.primary;

  const inner = (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ z: 8, scale: 1.005 }}
      className={`flex items-start gap-4 py-3 px-4 border-b border-terminal-accent-primary/10 bg-transparent transition-all duration-200 ${v.hover}`}
    >
      <span className={`text-xs pt-0.5 w-6 shrink-0 transition-colors ${hovered ? v.text : 'text-terminal-muted'}`}>
        <LabelText text={String(index).padStart(2, '0')} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-0.5">
          <span
            className={`text-sm font-bold tracking-widest uppercase transition-all duration-150 ${hovered ? `${v.text} ${v.glow}` : 'text-terminal-primary'}`}
          >
            <HeadingText text={`[${label}]`} as="span" className="text-inherit drop-shadow-inherit" />
          </span>
          {hovered && (
            <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className={`text-xs ${v.text}`}>
              ──▶
            </motion.span>
          )}
        </div>
        <span className="text-terminal-subdued">
          <SubtitleText text={description} delay={50} className="text-inherit" />
        </span>
      </div>
      <span className={`text-xs shrink-0 pt-0.5 transition-colors ${hovered ? v.text : 'text-terminal-muted'}`}>
        {hovered ? (external ? '▶ OPEN' : '▶ ENTER') : '○'}
      </span>
    </motion.div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer">
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className="block group cursor-pointer">
      {inner}
    </Link>
  );
}
