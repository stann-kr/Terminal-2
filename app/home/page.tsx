'use client';
import { motion } from 'framer-motion';
import DirectoryLink from '@/components/DirectoryLink';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { TitleText, SubtitleText, HeadingText, LabelText, MetaText, BodyText } from '@/components/ui/TerminalText';
import CountdownBlock from '@/app/home/CountdownBlock';

const DIRS = [
  { href: '/about',    label: 'About',    description: 'PLATFORM MANIFESTO / SYSTEM INFORMATION', accent: 'amber' as const },
  { href: '/gate',     label: 'Gate',     description: 'NEXT ENTRY / COUNTDOWN / COORDINATES',     accent: 'cyan' as const },
  { href: '/lineup',   label: 'Lineup',   description: 'ARTIST ROSTER / DOCK',                     accent: 'gold' as const },
  { href: '/status',   label: 'Status',   description: 'SYSTEM DIAGNOSTICS / NETWORK TELEMETRY',   accent: 'hot' as const },
  { href: '/transmit', label: 'Transmit', description: 'VISITOR LOG / NODE SYNC',                 accent: 'purple' as const },
];

const EVENT_DATE = new Date('2026-05-08T23:00:00');

export default function HomePage() {
  return (
    <PageLayout>
        {/* Header */}
        <div className="mb-6 text-center">
          <motion.div
            variants={itemVariants}
            className="text-[8px] sm:text-xs tracking-widest mb-3 text-terminal-muted"
          >
            <LabelText text="╔══════════════════════════════════════════╗" />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-[0.15em] sm:tracking-[0.3em] mb-2 drop-shadow-[0_0_30px_rgba(212,146,10,0.5)]"
          >
            <TitleText
              text="TERMINAL"
              as="span"
              className="text-terminal-accent-amber"
            />
          </motion.h1>

          <motion.div variants={itemVariants} className="text-[10px] sm:text-xs">
            <SubtitleText
              text="A VOYAGE TO THE UNKNOWN SECTOR"
              delay={100}
              className="text-terminal-subdued text-center tracking-[0.1em]"
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-[8px] sm:text-xs tracking-widest mt-3 text-terminal-muted"
          >
            <LabelText text="╚══════════════════════════════════════════╝" />
          </motion.div>
        </div>

        {/* Next Event Countdown */}
        <motion.div
          variants={itemVariants}
          className="mb-8 border py-6 px-4 border-terminal-accent-amber/20 bg-terminal-bg-panel"
        >
          <div className="text-center mb-4">
            <div className="mb-1 text-[10px] sm:text-xs text-terminal-muted tracking-[0.1em]">
              <BodyText text="NEXT ENTRY — MAY 08 2026" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-terminal-accent-amber tracking-[0.2em] drop-shadow-[0_0_16px_rgba(212,146,10,0.4)]">
              <HeadingText text="TERMINAL [02]" as="span" />
            </div>
            <div className="mt-1 text-[10px] sm:text-xs text-terminal-subdued tracking-[0.1em]">
              <MetaText text="Heliopause Outskirts // Faust Seoul" />
            </div>
          </div>
          <CountdownBlock targetDate={EVENT_DATE} />
        </motion.div>

        {/* Directory */}
        <motion.div
          variants={itemVariants}
          className="border border-terminal-accent-amber/20 bg-terminal-bg-panel"
        >
          <div className="px-4 py-2 border-b flex items-center justify-between border-terminal-accent-amber/15 bg-black/40">
            <span className="text-[10px] sm:text-xs tracking-widest text-terminal-accent-amber">
              <LabelText text="▶ ROOT DIRECTORY — /terminal/" />
            </span>
            <span className="text-[10px] sm:text-xs text-terminal-muted">
              <LabelText text="5 MODULE(S)" />
            </span>
          </div>

          {DIRS.map((dir, i) => (
            <div key={dir.href}>
              <DirectoryLink {...dir} index={i + 1} />
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex items-center justify-between text-[10px] sm:text-xs text-terminal-muted font-mono"
        >
          <span><MetaText text="KERNEL 2.2.0-heliopause_build" /></span>
          <span suppressHydrationWarning={true}><MetaText text={new Date().toISOString().slice(0, 10)} /></span>
        </motion.div>
    </PageLayout>
  );
}
