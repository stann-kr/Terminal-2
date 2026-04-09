'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DecodeText from './DecodeText';

type AccentColor = 'amber' | 'cyan' | 'gold' | 'hot' | 'purple';

interface DirectoryLinkProps {
  href: string;
  label: string;
  description: string;
  index: number;
  accent?: AccentColor;
}

const accentClassMap: Record<AccentColor, { hover: string; text: string; glow: string }> = {
  amber:  { hover: 'group-hover:border-terminal-accent-amber group-hover:bg-terminal-accent-amber/5 group-hover:shadow-[0_0_20px_rgba(212,146,10,0.07)]', text: 'text-terminal-accent-amber', glow: 'group-hover:drop-shadow-[0_0_8px_rgba(212,146,10,0.6)]' },
  cyan:   { hover: 'group-hover:border-terminal-accent-cyan group-hover:bg-terminal-accent-cyan/5 group-hover:shadow-[0_0_20px_rgba(58,152,128,0.07)]', text: 'text-terminal-accent-cyan', glow: 'group-hover:drop-shadow-[0_0_8px_rgba(58,152,128,0.6)]' },
  gold:   { hover: 'group-hover:border-terminal-accent-gold group-hover:bg-terminal-accent-gold/5 group-hover:shadow-[0_0_20px_rgba(200,160,48,0.07)]', text: 'text-terminal-accent-gold', glow: 'group-hover:drop-shadow-[0_0_8px_rgba(200,160,48,0.6)]' },
  hot:    { hover: 'group-hover:border-terminal-accent-hot group-hover:bg-terminal-accent-hot/5 group-hover:shadow-[0_0_20px_rgba(200,80,32,0.07)]', text: 'text-terminal-accent-hot', glow: 'group-hover:drop-shadow-[0_0_8px_rgba(200,80,32,0.6)]' },
  purple: { hover: 'group-hover:border-terminal-accent-purple group-hover:bg-terminal-accent-purple/5 group-hover:shadow-[0_0_20px_rgba(136,104,168,0.07)]', text: 'text-terminal-accent-purple', glow: 'group-hover:drop-shadow-[0_0_8px_rgba(136,104,168,0.6)]' },
};

export default function DirectoryLink({ href, label, description, index, accent = 'amber' }: DirectoryLinkProps) {
  const [hovered, setHovered] = useState(false);
  const v = accentClassMap[accent];

  return (
    <Link href={href} className="block group cursor-pointer">
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ z: 8, scale: 1.005 }}
        className={`flex items-start gap-4 py-3 px-4 border-b border-terminal-accent-amber/10 bg-transparent transition-all duration-200 ${v.hover}`}
      >
        <span className={`text-xs pt-0.5 w-6 shrink-0 transition-colors ${hovered ? v.text : 'text-terminal-muted'}`}>
          <DecodeText text={String(index).padStart(2, '0')} speed={0.8} scramble={5} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-0.5">
            <span
              className={`text-sm font-bold tracking-widest uppercase transition-all duration-150 ${hovered ? `${v.text} ${v.glow}` : 'text-terminal-primary'}`}
            >
              <DecodeText text={`[${label}]`} speed={0.65} scramble={8} className="text-inherit drop-shadow-inherit" />
            </span>
            {hovered && (
              <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className={`text-xs ${v.text}`}>
                ──▶
              </motion.span>
            )}
          </div>
          <span className="text-terminal-subdued">
            <DecodeText text={description} speed={0.5} scramble={6} delay={50} className="text-inherit" />
          </span>
        </div>
        <span className={`text-xs shrink-0 pt-0.5 transition-colors ${hovered ? v.text : 'text-terminal-muted'}`}>
          {hovered ? '▶ ENTER' : '○'}
        </span>
      </motion.div>
    </Link>
  );
}
