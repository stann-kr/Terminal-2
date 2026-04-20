"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AnimatedHeight from "@/components/ui/AnimatedHeight";
import DirectoryLink from "@/components/DirectoryLink";
import PageLayout, { itemVariants } from "@/components/PageLayout";
import {
  TitleText,
  SubtitleText,
  HeadingText,
  LabelText,
  MetaText,
  BodyText,
} from "@/components/ui/TerminalText";
import CountdownBlock from "@/components/ui/CountdownBlock";
import LangToggle from "@/components/ui/LangToggle";
import { useT } from "@/lib/langContext";
import { fetchEvents, eventKeys } from "@/lib/queries/events";

export default function HomePage() {
  const t = useT();

  const DIRS = [
    { href: "/about",    label: "About",    description: t.dirDesc.about,    accent: "primary" as const },
    { href: "/gate",     label: "Gate",     description: t.dirDesc.gate,     accent: "primary" as const },
    { href: "/lineup",   label: "Lineup",   description: t.dirDesc.lineup,   accent: "primary" as const },
    { href: "/status",   label: "Status",   description: t.dirDesc.status,   accent: "primary" as const },
    { href: "/transmit", label: "Transmit", description: t.dirDesc.transmit, accent: "primary" as const },
    { href: "/link",     label: "Link",     description: t.dirDesc.link,     accent: "primary" as const },
  ];

  const { data: events = [], isError: eventError } = useQuery({
    queryKey: eventKeys.list(),
    queryFn: fetchEvents,
  });

  const upcomingEvent = events.find((e) => e.status === "UPCOMING") ?? null;

  const countdownTarget = (() => {
    if (upcomingEvent) {
      return new Date(`${upcomingEvent.date}T${upcomingEvent.time.replace(" KST", "")}:00+09:00`);
    }
    const archived = events.filter((e) => e.status === "ARCHIVED");
    if (archived.length > 0) {
      const latest = archived.sort((a, b) => b.date.localeCompare(a.date))[0];
      return new Date(`${latest.date}T${latest.time.replace(" KST", "")}:00+09:00`);
    }
    return null;
  })();

  const eventDate = countdownTarget;

  const eventDateLabel = upcomingEvent
    ? new Date(upcomingEvent.date)
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
      <div className="mb-6 text-center">
        <motion.div
          variants={itemVariants}
          className="text-pico tracking-widest mb-1 sm:mb-3 text-terminal-muted"
        >
          <LabelText text="╔══════════════════════════════════════════╗" autoHeight />
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
            className="text-nano sm:text-caption md:text-caption text-terminal-subdued text-center tracking-[0.2em] opacity-70"
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="text-pico tracking-widest mt-1 sm:mt-3 text-terminal-muted"
        >
          <LabelText text="╚══════════════════════════════════════════╝" autoHeight />
        </motion.div>
      </div>

      {/* Next Event Countdown */}
      <motion.div
        variants={itemVariants}
        className="mb-8 border py-6 px-4 border-terminal-accent-primary/20 bg-terminal-bg-panel"
      >
        {eventError ? (
          <div className="text-center py-4 space-y-2">
            <div className="text-xs font-bold tracking-widest text-terminal-accent-alert font-mono">
              <LabelText
                autoHeight
                text={t.common.signalUnstable}
              />
            </div>
            <div className="text-xs text-terminal-muted font-mono">
              <MetaText
                autoHeight
                text={t.common.dbUnreachable}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="mb-1 tracking-[0.1em]">
                <BodyText
                  className="text-micro sm:text-small text-terminal-muted"
                  text={`${t.home.nextEntry} ${eventDateLabel}`}
                />
              </div>
              <div className="drop-shadow-[0_0_16px_rgb(var(--color-accent-primary)/0.4)]">
                <HeadingText
                  autoHeight
                  className="text-h2 sm:text-h1 font-bold text-terminal-accent-primary tracking-[0.2em]"
                  text={upcomingEvent?.session ?? "—"} as="span"
                />
              </div>
              <div className="mt-1 tracking-[0.1em]">
                <MetaText
                  className="text-micro sm:text-small text-terminal-subdued"
                  autoHeight
                  text={
                    upcomingEvent
                      ? `${upcomingEvent.subtitle} // ${upcomingEvent.venue}`
                      : "—"
                  }
                />
              </div>
            </div>
            <AnimatedHeight show={!!eventDate}>
              {eventDate && <CountdownBlock targetDate={eventDate} />}
            </AnimatedHeight>
          </>
        )}
      </motion.div>

      {/* Directory */}
      <motion.div
        variants={itemVariants}
        className="border border-terminal-accent-primary/20 bg-terminal-bg-panel"
      >
        <div className="px-4 py-2 border-b flex items-center justify-between border-terminal-accent-primary/15 bg-terminal-bg-overlay/40">
          <span className="text-micro sm:text-small tracking-widest text-terminal-accent-primary">
            <LabelText
              autoHeight
              text={t.home.rootDir}
            />
          </span>
          <span className="text-micro sm:text-small text-terminal-muted">
            <LabelText
              autoHeight
              text={t.home.moduleCount}
            />
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
        className="mt-6 flex items-center justify-between text-micro sm:text-xs text-terminal-muted font-mono"
      >
        <span>
          <MetaText text="KERNEL 2.2.0-heliopause_build" autoHeight />
        </span>
        <LangToggle />
      </motion.div>
    </PageLayout>
  );
}
