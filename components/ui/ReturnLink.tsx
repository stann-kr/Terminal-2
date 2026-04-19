'use client';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { LabelText } from '@/components/ui/TerminalText';

interface ReturnLinkProps {
  href?: string;
  text?: string;
  variants?: Variants;
}

const defaultVariants = {
  hidden: {},
  visible: {},
};

export default function ReturnLink({ href = '/home', text = '◀ RETURN /home', variants = defaultVariants }: ReturnLinkProps) {
  return (
    <motion.div variants={variants} className="mb-6">
      <Link
        href={href}
        className="text-small tracking-widest cursor-pointer hover-glow inline-block px-3 py-1.5 border transition-colors whitespace-nowrap border-terminal-bg-panel-border/40 text-terminal-subdued font-mono hover:bg-terminal-bg-panel-border/20"
      >
        <LabelText text={text} />
      </Link>
    </motion.div>
  );
}
