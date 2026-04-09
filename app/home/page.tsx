'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DirectoryLink from '@/components/DirectoryLink';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { TitleText, SubtitleText, HeadingText, LabelText, MetaText, BodyText } from '@/components/ui/TerminalText';
import CountdownBlock from '@/components/ui/CountdownBlock';
import type { TerminalEvent } from '@/lib/eventData';

const DIRS = [
  { href: '/about',    label: 'About',    description: 'PLATFORM MANIFESTO / SYSTEM INFORMATION', accent: 'amber' as const },
  { href: '/gate',     label: 'Gate',     description: 'NEXT ENTRY / COUNTDOWN / COORDINATES',     accent: 'cyan' as const },
  { href: '/lineup',   label: 'Lineup',   description: 'ARTIST ROSTER / DOCK',                     accent: 'gold' as const },
  { href: '/status',   label: 'Status',   description: 'SYSTEM DIAGNOSTICS / NETWORK TELEMETRY',   accent: 'hot' as const },
  { href: '/transmit', label: 'Transmit', description: 'VISITOR LOG / NODE SYNC',                 accent: 'purple' as const },
];

export default function HomePage() {
  const [upcomingEvent, setUpcomingEvent] = useState<TerminalEvent | null>(null);
  const [eventError, setEventError] = useState(false);

  useEffect(() => {
    fetch('/api/events?status=UPCOMING')
      .then((res) => res.json() as Promise<TerminalEvent[]>)
      .then((data) => {
        if (data.length > 0) setUpcomingEvent(data[0]);
      })
      .catch(() => setEventError(true));
  }, []);

  const eventDate = upcomingEvent
    ? new Date(`${upcomingEvent.date}T${upcomingEvent.time.replace(' KST', '')}:00`)
    : null;

  const eventDateLabel = upcomingEvent
    ? new Date(upcomingEvent.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()
    : '—';

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
              <BodyText text={`NEXT ENTRY — ${eventDateLabel}`} />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-terminal-accent-amber tracking-[0.2em] drop-shadow-[0_0_16px_rgba(212,146,10,0.4)]">
              <HeadingText text={upcomingEvent?.session ?? '—'} as="span" />
            </div>
            <div className="mt-1 text-[10px] sm:text-xs text-terminal-subdued tracking-[0.1em]">
              <MetaText text={upcomingEvent ? `${upcomingEvent.subtitle} // ${upcomingEvent.venue}` : '—'} />
            </div>
          </div>
          {eventError ? (
            <div className="text-center py-4 space-y-1">
              <div className="text-xs font-bold tracking-widest text-terminal-accent-hot font-mono">
                <LabelText text="⚠ SIGNAL LINK UNSTABLE" />
              </div>
              <div className="text-xs text-terminal-muted font-mono">
                <MetaText text="DATABASE UNREACHABLE — RETRY LATER" />
              </div>
            </div>
          ) : eventDate ? (
            <CountdownBlock targetDate={eventDate} />
          ) : null}
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
