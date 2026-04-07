'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DecodeText from './DecodeText';

interface DirectoryLinkProps {
  href: string;
  label: string;
  description: string;
  index: number;
  accent?: string;
}

export default function DirectoryLink({ href, label, description, index, accent = '#d4920a' }: DirectoryLinkProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href} className="block group cursor-pointer">
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ z: 8, scale: 1.005 }}
        className="flex items-start gap-4 py-3 px-4 border-b transition-all duration-200"
        style={{
          borderColor: hovered ? accent : 'rgba(212,146,10,0.1)',
          background: hovered ? `rgba(212,146,10,0.04)` : 'transparent',
          boxShadow: hovered ? `0 0 20px rgba(212,146,10,0.07)` : 'none',
        }}
      >
        <span className="text-xs pt-0.5 w-6 shrink-0" style={{ color: hovered ? accent : '#4a3818' }}>
          <DecodeText text={String(index).padStart(2, '0')} speed={0.8} scramble={5} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-0.5">
            <span
              className="text-sm font-bold tracking-widest uppercase transition-all duration-150"
              style={{
                color: hovered ? accent : '#e8d890',
                textShadow: hovered ? `0 0 8px ${accent}99` : 'none',
              }}
            >
              [<DecodeText text={label} speed={0.65} scramble={8} style={{ display: 'inline', color: 'inherit', textShadow: 'inherit' }} />]
            </span>
            {hovered && (
              <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-xs" style={{ color: accent }}>
                ──▶
              </motion.span>
            )}
          </div>
          <span style={{ color: '#8a7040' }}>
            <DecodeText text={description} speed={0.5} scramble={6} delay={50} style={{ color: 'inherit' }} />
          </span>
        </div>
        <span className="text-xs shrink-0 pt-0.5" style={{ color: hovered ? accent : '#4a3818' }}>
          {hovered ? '▶ ENTER' : '○'}
        </span>
      </motion.div>
    </Link>
  );
}
