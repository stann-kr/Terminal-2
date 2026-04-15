"use client";
import { useState, useEffect } from "react";
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
import { useLang } from "@/lib/langContext";
import { dirDescKo, homeKo, commonKo } from "@/lib/i18n";
import type { TerminalEvent } from "@/lib/eventData";

export default function HomePage() {
  const { lang } = useLang();

  const DIRS = [
    {
      href: "/about",
      label: "About",
      description:
        lang === "ko"
          ? dirDescKo.about
          : "PLATFORM MANIFESTO / SYSTEM INFORMATION",
      accent: "primary" as const,
    },
    {
      href: "/gate",
      label: "Gate",
      description:
        lang === "ko"
          ? dirDescKo.gate
          : "NEXT ENTRY / COUNTDOWN / REQUEST ACCESS",
      accent: "primary" as const,
    },
    {
      href: "/lineup",
      label: "Lineup",
      description: lang === "ko" ? dirDescKo.lineup : "ARTIST ROSTER / DOCK",
      accent: "primary" as const,
    },
    {
      href: "/status",
      label: "Status",
      description:
        lang === "ko"
          ? dirDescKo.status
          : "SYSTEM DIAGNOSTICS / NETWORK TELEMETRY",
      accent: "primary" as const,
    },
    {
      href: "/transmit",
      label: "Transmit",
      description:
        lang === "ko" ? dirDescKo.transmit : "VISITOR LOG / NODE SYNC",
      accent: "primary" as const,
    },
    {
      href: "/link",
      label: "Link",
      description:
        lang === "ko" ? dirDescKo.link : "EXTERNAL CHANNELS / OFFICIAL LINKS",
      accent: "primary" as const,
    },
  ];

  const [upcomingEvent, setUpcomingEvent] = useState<TerminalEvent | null>(
    null,
  );
  const [countdownTarget, setCountdownTarget] = useState<Date | null>(null);
  const [eventError, setEventError] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<TerminalEvent[]>;
      })
      .then((data) => {
        const upcoming = data.find((e) => e.status === "UPCOMING") ?? null;
        setUpcomingEvent(upcoming);

        if (upcoming) {
          // T- 카운트다운: UPCOMING 이벤트 날짜까지
          setCountdownTarget(
            new Date(
              `${upcoming.date}T${upcoming.time.replace(" KST", "")}:00+09:00`,
            ),
          );
        } else {
          // T+ 경과: 가장 최근 ARCHIVED 이벤트 날짜 기준
          const archived = data.filter((e) => e.status === "ARCHIVED");
          if (archived.length > 0) {
            const latest = archived.sort((a, b) =>
              b.date.localeCompare(a.date),
            )[0];
            setCountdownTarget(
              new Date(`${latest.date}T${latest.time.replace(" KST", "")}:00+09:00`),
            );
          }
        }
      })
      .catch(() => setEventError(true));
  }, []);

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
          className="text-[8px] sm:text-xs tracking-widest mb-3 text-terminal-muted"
        >
          <LabelText text="╔══════════════════════════════════════════╗" />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-bold tracking-[0.15em] sm:tracking-[0.25em] mb-2 drop-shadow-[0_0_30px_rgb(var(--color-accent-primary)/0.5)] font-pixie"
        >
          <TitleText
            text="TERMINAL"
            as="span"
            className="text-5xl sm:text-7xl md:text-8xl text-terminal-accent-primary"
          />
        </motion.h1>

        <motion.div variants={itemVariants}>
          <SubtitleText
            text="A VOYAGE TO THE UNKNOWN SECTOR"
            delay={100}
            className="text-[9px] sm:text-[11px] md:text-[11px] text-terminal-subdued text-center tracking-[0.2em] opacity-70"
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
        className="mb-8 border py-6 px-4 border-terminal-accent-primary/20 bg-terminal-bg-panel"
      >
        {eventError ? (
          <div className="text-center py-4 space-y-2">
            <div className="text-xs font-bold tracking-widest text-terminal-accent-alert font-mono">
              <LabelText
                text={
                  lang === "ko"
                    ? commonKo.signalUnstable
                    : "⚠ SIGNAL LINK UNSTABLE"
                }
              />
            </div>
            <div className="text-xs text-terminal-muted font-mono">
              <MetaText
                text={
                  lang === "ko"
                    ? commonKo.dbUnreachable
                    : "DATABASE UNREACHABLE — RETRY LATER"
                }
              />
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="mb-1 tracking-[0.1em]">
                <BodyText
                  className="text-[10px] sm:text-xs text-terminal-muted"
                  text={`${lang === "ko" ? homeKo.nextEntry : "NEXT LAUNCH —"} ${eventDateLabel}`}
                />
              </div>
              <div className="drop-shadow-[0_0_16px_rgb(var(--color-accent-primary)/0.4)]">
                <HeadingText 
                  className="text-xl sm:text-2xl font-bold text-terminal-accent-primary tracking-[0.2em]"
                  text={upcomingEvent?.session ?? "—"} as="span" 
                />
              </div>
              <div className="mt-1 tracking-[0.1em]">
                <MetaText
                  className="text-[10px] sm:text-xs text-terminal-subdued"
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
          <span className="text-[10px] sm:text-xs tracking-widest text-terminal-accent-primary">
            <LabelText
              text={
                lang === "ko" ? homeKo.rootDir : "▶ ROOT DIRECTORY — /terminal/"
              }
            />
          </span>
          <span className="text-[10px] sm:text-xs text-terminal-muted">
            <LabelText
              text={lang === "ko" ? homeKo.moduleCount : "6 MODULE(S)"}
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
        className="mt-6 flex items-center justify-between text-[10px] sm:text-xs text-terminal-muted font-mono"
      >
        <span>
          <MetaText text="KERNEL 2.2.0-heliopause_build" />
        </span>
        <LangToggle />
      </motion.div>
    </PageLayout>
  );
}
