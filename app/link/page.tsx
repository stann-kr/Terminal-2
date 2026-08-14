'use client';
import { motion } from 'framer-motion';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import DirectoryLink from '@/components/DirectoryLink';
import { LabelText } from '@/components/ui/TerminalText';
import { useT } from '@/lib/langContext';

export default function LinkPage() {
  const t = useT();

  const LINKS = [
    { href: 'https://stann.kr',                         label: 'STANN OS Hub',         description: t.link.descriptions.stannHub,      accent: 'primary' as const },
    { href: 'https://lumo.stann.kr',                    label: 'Stann Lumo Web',       description: t.link.descriptions.stannWeb,     accent: 'primary' as const },
    { href: 'https://www.instagram.com/stannlumo/',     label: 'Stann Lumo Instagram', description: t.link.descriptions.stannInsta,    accent: 'primary' as const },
    { href: 'https://www.instagram.com/terminal_hub/',  label: 'Terminal Instagram',   description: t.link.descriptions.terminalInsta, accent: 'primary' as const },
  ];

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/link" title="LINK.DAT" accent="primary" variants={itemVariants} />

      <motion.div
        variants={itemVariants}
        className="border border-terminal-accent-primary/20 bg-terminal-bg-panel"
      >
        <div className="px-4 py-2 border-b flex items-center justify-between border-terminal-accent-primary/15 bg-terminal-bg-overlay/40">
          <span className="text-micro sm:text-small tracking-widest text-terminal-accent-primary font-mono">
            <LabelText text={t.link.externalChannels} />
          </span>
          <span className="text-micro sm:text-small text-terminal-muted font-mono">
            <LabelText text={t.link.nodeCount} />
          </span>
        </div>

        {LINKS.map((link, i) => (
          <DirectoryLink
            key={link.href}
            href={link.href}
            label={link.label}
            description={link.description}
            index={i + 1}
            accent={link.accent}
            external
          />
        ))}
      </motion.div>
    </PageLayout>
  );
}
