'use client';
import { motion } from 'framer-motion';
import DirectoryLink from '@/components/DirectoryLink';
import DecodeText from '@/components/DecodeText';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import CountdownBlock from '@/app/home/CountdownBlock';

const DIRS = [
  { href: '/about',    label: 'About',    description: 'PLATFORM MANIFESTO / SYSTEM INFORMATION', accent: 'amber' as const },
  { href: '/gate',     label: 'Gate',     description: 'NEXT EVENT / COUNTDOWN / COORDINATES',     accent: 'cyan' as const },
  { href: '/lineup',   label: 'Lineup',   description: 'ARTIST ROSTER / SESSION IDs / TRACKLIST',  accent: 'gold' as const },
  { href: '/status',   label: 'Status',   description: 'SYSTEM DIAGNOSTICS / NETWORK TELEMETRY',   accent: 'hot' as const },
  { href: '/transmit', label: 'Transmit', description: 'INCOMING SIGNAL LOG / VISITOR BROADCAST',  accent: 'purple' as const },
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
            <DecodeText text="╔══════════════════════════════════════════╗" speed={0.8} scramble={3} />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-[0.15em] sm:tracking-[0.3em] mb-2"
          >
            <DecodeText
              text="TERMINAL"
              as="span"
              speed={0.7}
              scramble={10}
              className="text-terminal-accent-amber drop-shadow-[0_0_30px_rgba(212,146,10,0.5)]"
            />
          </motion.h1>

          <motion.div variants={itemVariants} className="text-[10px] sm:text-xs">
            <DecodeText
              text="UNDERGROUND TECHNO PLATFORM · SESSION ACTIVE"
              speed={0.5}
              scramble={8}
              delay={100}
              className="text-terminal-subdued text-center tracking-[0.1em]"
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-[8px] sm:text-xs tracking-widest mt-3 text-terminal-muted"
          >
            <DecodeText text="╚══════════════════════════════════════════╝" speed={0.8} scramble={3} />
          </motion.div>
        </div>

        {/* Next Event Countdown */}
        <motion.div
          variants={itemVariants}
          className="mb-8 border py-6 px-4 border-terminal-accent-amber/20 bg-terminal-bg-panel"
        >
          <div className="text-center mb-4">
            <div className="mb-1 text-[10px] sm:text-xs text-terminal-muted tracking-[0.1em]">
              <DecodeText
                text="NEXT EVENT — MAY 08 2026"
                speed={0.45}
                scramble={6}
              />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-terminal-accent-amber tracking-[0.2em] drop-shadow-[0_0_16px_rgba(212,146,10,0.4)]">
              <DecodeText
                text="TERMINAL [02]"
                speed={0.6}
                scramble={10}
              />
            </div>
            <div className="mt-1 text-[10px] sm:text-xs text-terminal-subdued tracking-[0.1em]">
              <DecodeText
                text="Heliopause Outskirts"
                speed={0.4}
                scramble={6}
              />
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
              <DecodeText text="▶ ROOT DIRECTORY — /terminal/" speed={0.6} scramble={6} />
            </span>
            <span className="text-[10px] sm:text-xs text-terminal-muted">
              <DecodeText text="5 MODULE(S)" speed={0.6} scramble={4} />
            </span>
          </div>

          {DIRS.map((dir, i) => (
            <div
              key={dir.href}
            >
              <DirectoryLink {...dir} index={i + 1} />
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex items-center justify-between text-[10px] sm:text-xs text-terminal-muted font-mono"
        >
          <span><DecodeText text="KERNEL 4.2.0-underground" speed={0.4} scramble={4} /></span>
          <span suppressHydrationWarning={true}><DecodeText text={new Date().toISOString().slice(0, 10)} speed={0.4} scramble={4} /></span>
        </motion.div>
    </PageLayout>
  );
}
