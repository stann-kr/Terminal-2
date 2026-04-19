'use client';
import { motion } from 'framer-motion';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import DirectoryLink from '@/components/DirectoryLink';
import { LabelText } from '@/components/ui/TerminalText';
import { useLang } from '@/lib/langContext';
import { linkKo } from '@/lib/i18n';

const LINKS_EN = [
  {
    href: 'https://lumo.stann.kr',
    label: 'Stann Lumo Web',
    description: 'OFFICIAL WEBSITE / VISUAL ARCHIVE',
    accent: 'primary' as const,
  },
  {
    href: 'https://www.instagram.com/stannlumo/',
    label: 'Stann Lumo Instagram',
    description: 'SOCIAL CHANNEL / UPDATES',
    accent: 'primary' as const,
  },
  {
    href: 'https://www.instagram.com/terminal_hub/',
    label: 'Terminal Instagram',
    description: 'EVENT FEED / SIGNAL BROADCAST',
    accent: 'primary' as const,
  },
];

export default function LinkPage() {
  const { lang } = useLang();

  const LINKS = lang === 'ko' ? [
    { ...LINKS_EN[0], description: linkKo.descriptions.stannWeb },
    { ...LINKS_EN[1], description: linkKo.descriptions.stannInsta },
    { ...LINKS_EN[2], description: linkKo.descriptions.terminalInsta },
  ] : LINKS_EN;

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
            <LabelText text={lang === 'ko' ? linkKo.externalChannels : '▶ EXTERNAL CHANNELS — /terminal/link/'} />
          </span>
          <span className="text-micro sm:text-small text-terminal-muted font-mono">
            <LabelText text={lang === 'ko' ? linkKo.nodeCount : '3 NODE(S)'} />
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
