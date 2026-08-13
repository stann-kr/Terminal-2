'use client';

import Link from 'next/link';
import { LabelText } from '@/components/ui/TerminalText';
import {
  getTerminalButtonClassName,
  type TerminalButtonVariant,
} from '@/components/TerminalButton';

interface TerminalActionLinkProps {
  href: string;
  children: string;
  variant?: TerminalButtonVariant;
  className?: string;
}

export default function TerminalActionLink({
  href,
  children,
  variant = 'primary',
  className = '',
}: TerminalActionLinkProps) {
  return (
    <Link href={href} className={getTerminalButtonClassName(variant, className)}>
      <LabelText text={children} autoHeight />
    </Link>
  );
}
