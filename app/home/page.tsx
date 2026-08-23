"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AnimatedHeight from "@/components/ui/AnimatedHeight";
import DirectoryLink from "@/components/DirectoryLink";
import TerminalButton from "@/components/TerminalButton";
import TerminalActionLink from "@/components/TerminalActionLink";
import PageLayout, { itemVariants } from "@/components/shell/PageLayout";
import {
  TitleText,
  SubtitleText,
  HeadingText,
  LabelText,
  MetaText,
} from "@/components/ui/TerminalText";
import CountdownBlock from "@/components/events/CountdownBlock";
import LangToggle from "@/components/ui/LangToggle";
import { useT } from "@/lib/langContext";
import { fetchEvents, eventKeys } from "@/lib/events/client";
import { getArchivedOrElapsedEvents, getEventDateTime, getFutureUpcomingEvent } from "@/lib/events/lifecycle";

export default function HomePage() {
  const t = useT();

  const DIRS = [
    { href: "/about",    label: "About",    description: t.dirDesc.about,    accent: "primary" as const },
    { href: "/gate",     label: "Gate",     description: t.dirDesc.gate,     accent: "primary" as const },
    { href: "/lineup",   label: "Lineup",   description: t.dirDesc.lineup,   accent: "primary" as const },
    { href: "/status",   label: "Status",   description: t.dirDesc.status,   accent: "primary" as const },
    { href: "/transmit", label: "Transmit", description: t.dirDesc.transmit, accent: "primary" as const },
    { href: "/signal",   label: "Signal",   description: t.dirDesc.signal,   accent: "primary" as const },
    { href: "/link",     label: "Link",     description: t.dirDesc.link,     accent: "primary" as const },
  ];

  const { data: events = [], isLoading: isEventLoading, isError: eventError, refetch } = useQuery({
    queryKey: eventKeys.list(),
    queryFn: fetchEvents,
  });

  const upcomingEvent = useMemo(() => getFutureUpcomingEvent(events), [events]);

  const countdownTarget = useMemo(() => {
    if (upcomingEvent) {
      return getEventDateTime(upcomingEvent);
    }
    const archived = getArchivedOrElapsedEvents(events);
    if (archived.length > 0) {
      return getEventDateTime(archived[0]);
    }
    return null;
  }, [events, upcomingEvent]);

  const eventDate = countdownTarget;
  const isElapsed = upcomingEvent === null && countdownTarget !== null;
  const displayEvent = upcomingEvent ?? getArchivedOrElapsedEvents(events)[0] ?? null;

  const eventDateLabel = displayEvent
    ? new Date(displayEvent.date)
        .toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
        .toUpperCase()
    : "—";

  return (
    <PageLayout>
      {/* Header */}
      <div id="home-ambient-anchor" className="mb-6 text-center">
        <motion.div
          variants={itemVariants}
          className="flex font-mono text-pico tracking-widest mb-1 sm:mb-3 text-terminal-muted overflow-hidden px-6 sm:px-10 md:px-16"
        >
          <span>╔</span>
          <span className="flex-1 overflow-hidden whitespace-nowrap select-none">{'═'.repeat(60)}</span>
          <span>╗</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-bold tracking-[0.15em] sm:tracking-[0.25em] mb-1 sm:mb-2 leading-none drop-shadow-[0_0_30px_rgb(var(--color-accent-primary)/0.5)] font-pixie"
        >
          <TitleText
            text="TERMINAL"
            as="span"
            autoHeight
            className="text-hero sm:text-[4rem] md:text-display text-terminal-accent-primary"
          />
        </motion.h1>

        <motion.div variants={itemVariants}>
          <SubtitleText
            text="A VOYAGE TO THE UNKNOWN SECTOR"
            delay={100}
            className="text-caption md:text-small text-terminal-subdued text-center tracking-[0.2em] opacity-70"
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex font-mono text-pico tracking-widest mt-1 sm:mt-3 text-terminal-muted overflow-hidden px-6 sm:px-10 md:px-16"
        >
          <span>╚</span>
          <span className="flex-1 overflow-hidden whitespace-nowrap select-none">{'═'.repeat(60)}</span>
          <span>╝</span>
        </motion.div>
      </div>

      {/* Next Event Countdown */}
      <motion.div
        variants={itemVariants}
        className="mb-8 border py-6 px-4 border-terminal-accent-primary/20 bg-terminal-bg-panel"
      >
        {isEventLoading ? (
          <div className="text-center py-4 font-mono text-terminal-muted" role="status" aria-live="polite">
            <LabelText autoHeight text={t.home.loading} />
          </div>
        ) : eventError ? (
          <div className="text-center py-4 space-y-2">
            <div className="font-bold tracking-widest text-terminal-accent-alert font-mono">
              <LabelText
                autoHeight
                text={t.common.signalUnstable}
              />
            </div>
            <div className="text-terminal-muted font-mono">
              <MetaText
                autoHeight
                text={t.common.dbUnreachable}
              />
            </div>
            <div className="flex justify-center">
              <TerminalButton variant="ghost" onClick={() => void refetch()}>{t.common.retry}</TerminalButton>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-4 font-mono text-terminal-muted" role="status" aria-live="polite">
            <MetaText autoHeight text={t.home.noEvents} />
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="mb-1 tracking-[0.1em]">
                <MetaText
                  className="text-terminal-muted"
                  text={`${isElapsed ? t.home.lastEntry : t.home.nextEntry} ${eventDateLabel}`}
                />
              </div>
              <div className="drop-shadow-[0_0_16px_rgb(var(--color-accent-primary)/0.4)]">
                <HeadingText
                  autoHeight
                  className="font-bold text-terminal-accent-primary tracking-[0.2em]"
                  text={displayEvent?.session ?? "—"} as="span"
                />
              </div>
              <div className="mt-1 tracking-[0.1em]">
                <MetaText
                  className="text-terminal-subdued"
                  autoHeight
                  text={
                    displayEvent
                      ? `${displayEvent.subtitle} // ${displayEvent.venue}`
                      : "—"
                  }
                />
              </div>
            </div>
            <AnimatedHeight show={!!eventDate}>
              {eventDate && <CountdownBlock targetDate={eventDate} />}
            </AnimatedHeight>
            {displayEvent && (
              <div className="mt-5 flex justify-center">
                <TerminalActionLink
                  href={isElapsed
                    ? `/gate?view=archive&event=${encodeURIComponent(displayEvent.id)}`
                    : '/gate'}
                  variant={isElapsed ? 'ghost' : 'primary'}
                >
                  {isElapsed ? t.home.viewArchive : t.home.viewEvent}
                </TerminalActionLink>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Directory */}
      <motion.nav
        variants={itemVariants}
        className="border border-terminal-accent-primary/20 bg-terminal-bg-panel"
        aria-labelledby="home-directory-title"
      >
        <div className="px-4 py-2 border-b flex items-center justify-between border-terminal-accent-primary/15 bg-terminal-bg-overlay/40">
          <span id="home-directory-title" className="text-micro sm:text-small tracking-widest text-terminal-accent-primary">
            <LabelText
              autoHeight
              text={t.home.rootDir}
            />
          </span>
          <span className="text-micro sm:text-small text-terminal-muted">
            <LabelText
              autoHeight
              text={t.home.moduleCount(DIRS.length)}
            />
          </span>
        </div>

        <ul className="list-none m-0 p-0">
          {DIRS.map((dir, i) => (
            <li key={dir.href}>
              <DirectoryLink {...dir} index={i + 1} />
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* Footer */}
      <motion.div
        variants={itemVariants}
        className="mt-6 flex items-center justify-between text-micro sm:text-caption text-terminal-muted font-mono"
      >
        <span>
          <MetaText text="TERMINAL · SEOUL" autoHeight />
        </span>
        <LangToggle />
      </motion.div>
    </PageLayout>
  );
}
