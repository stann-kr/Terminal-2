"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PageLayout, { itemVariants } from "@/components/PageLayout";
import { LabelText, SubtitleText, MetaText, HeadingText } from "@/components/ui/TerminalText";
import ReturnLink from "@/components/ui/ReturnLink";
import PageHeader from "@/components/ui/PageHeader";
import TerminalButton from "@/components/TerminalButton";
import EventDetail from "./EventDetail";
import { useLang } from "@/lib/langContext";
import { gateKo, commonKo } from "@/lib/i18n";
import type { TerminalEvent } from "@/lib/eventData";

export default function GatePage() {
  const { lang } = useLang();
  const [tab, setTab] = useState<"upcoming" | "archive">("upcoming");
  const [events, setEvents] = useState<TerminalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState("");

  useEffect(() => {
    fetch("/api/events")
      .then((res) => { if (!res.ok) throw new Error(); return res.json() as Promise<TerminalEvent[]>; })
      .then((data) => {
        setEvents(data);
        const firstArchived = data.find((e) => e.status === "ARCHIVED");
        if (firstArchived) setSelectedArchive(firstArchived.id);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const upcomingEvent = events.find((e) => e.status === "UPCOMING") || events[0] || null;
  const archivedEvents = events.filter((e) => e.status === "ARCHIVED");
  const selectedEvent =
    tab === "upcoming"
      ? upcomingEvent
      : (events.find((e) => e.id === selectedArchive) || archivedEvents[0] || null);

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader
        path="/terminal/gate"
        title="GATE.SEC"
        accent={tab === "upcoming" ? "cyan" : "amber"}
        variants={itemVariants}
      />

      {/* Tab switcher */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="inline-flex p-1 gap-1 bg-terminal-bg-overlay/50 border border-terminal-accent-primary/15">
          {(["upcoming", "archive"] as const).map((t) => (
            <TerminalButton
              key={t}
              variant={tab === t ? "primary" : "ghost"}
              className="px-4 py-1.5 text-[10px]"
              onClick={() => setTab(t)}
            >
              {t === "upcoming"
                ? (lang === "ko" ? gateKo.tabUpcoming : "▶ UPCOMING")
                : (lang === "ko" ? gateKo.tabArchive : "◼ ARCHIVE")}
            </TerminalButton>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <motion.div variants={itemVariants} className="text-xs font-mono text-terminal-muted text-center py-8">
          <LabelText text={lang === 'ko' ? gateKo.loading : '▸ LOADING GATE DATA...'} />
        </motion.div>
      ) : error ? (
        <motion.div variants={itemVariants} className="border border-terminal-accent-alert/25 bg-terminal-bg-panel px-4 py-8 text-center space-y-2">
          <div className="text-xs font-bold tracking-widest text-terminal-accent-alert font-mono">
            <LabelText text={lang === 'ko' ? commonKo.signalUnstable : '⚠ SIGNAL LINK UNSTABLE'} />
          </div>
          <div className="text-xs text-terminal-muted font-mono">
            <MetaText text={lang === 'ko' ? commonKo.dbUnreachable : 'DATABASE UNREACHABLE — RETRY LATER'} />
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {tab === "upcoming" ? (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {upcomingEvent && (
                <>
                  {/* Event header - 정보 가독성 유지 */}
                  <div className="border border-terminal-accent-secondary/30 px-4 py-4 bg-terminal-bg-panel">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="tracking-widest mb-1 font-mono text-terminal-muted">
                          <MetaText text={`${upcomingEvent.date.replace(/-/g, ".")} · ${upcomingEvent.time}`} />
                        </div>
                        <div className="drop-shadow-[0_0_12px_rgb(var(--color-accent-secondary)/0.4)]">
                          <HeadingText
                            text={upcomingEvent.session}
                            as="span"
                            className="tracking-[0.15em] text-terminal-accent-secondary"
                          />
                        </div>
                        <SubtitleText
                          autoHeight
                          text={upcomingEvent.subtitle}
                          className="mt-1 text-terminal-subdued tracking-[0.1em]"
                        />
                      </div>
                      <div className="font-bold tracking-wider shrink-0 text-terminal-accent-secondary font-mono">
                        <span className="status-pulse mr-1">●</span>
                        <LabelText text="UPCOMING" className="inline" />
                      </div>
                    </div>
                  </div>

                  <EventDetail event={upcomingEvent} showCountdown />

                  <div className="text-center pt-2">
                    <Link href="/gate/request">
                      <TerminalButton className="px-8" variant="primary">
                        {lang === 'ko' ? gateKo.requestBtn : '▶ REQUEST ACCESS PASS'}
                      </TerminalButton>
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="archive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Archive session list */}
              <div className="space-y-2">
                {archivedEvents.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedArchive(ev.id)}
                    className={`w-full text-left px-4 py-3 border cursor-pointer transition-all duration-200 font-mono ${
                      selectedArchive === ev.id
                        ? "border-terminal-accent-alert/50 bg-terminal-accent-alert/10"
                        : "border-terminal-accent-primary/15 bg-terminal-bg-panel hover:bg-terminal-accent-primary/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className={`text-sm font-bold tracking-wider ${selectedArchive === ev.id ? "text-terminal-accent-alert" : "text-terminal-primary"}`}>
                          <SubtitleText autoHeight text={ev.session} />
                        </div>
                        <div className="text-xs mt-0.5 text-terminal-subdued">
                          <MetaText text={`${ev.subtitle} · ${ev.date.replace(/-/g, ".")}`} />
                        </div>
                      </div>
                      <div className="text-xs tracking-wider shrink-0 text-terminal-muted flex items-center">
                        <LabelText
                          autoHeight
                          text={lang === 'ko' ? gateKo.archivedLabel : '◼ ARCHIVED'}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected archive detail */}
              {selectedEvent && (
                <motion.div
                  key={selectedEvent.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <EventDetail event={selectedEvent} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </PageLayout>
  );
}
