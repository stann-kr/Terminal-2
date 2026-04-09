"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout, { itemVariants } from "@/components/PageLayout";
import { LabelText, SubtitleText, MetaText, HeadingText } from "@/components/ui/TerminalText";
import ReturnLink from "@/components/ui/ReturnLink";
import PageHeader from "@/components/ui/PageHeader";
import TerminalButton from "@/components/TerminalButton";
import EventDetail from "./EventDetail";
import type { TerminalEvent } from "@/lib/eventData";

export default function GatePage() {
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

  const upcomingEvent = events.find((e) => e.status === "UPCOMING") ?? events[0];
  const archivedEvents = events.filter((e) => e.status === "ARCHIVED");
  const selectedEvent =
    tab === "upcoming"
      ? upcomingEvent
      : (events.find((e) => e.id === selectedArchive) ?? archivedEvents[0]);

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader
        path="/terminal/gate"
        title="GATE.EXE"
        accent="cyan"
        variants={itemVariants}
      />

      {/* Tab switcher */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="inline-flex p-1 gap-1 bg-black/50 border border-terminal-accent-amber/15">
          {(["upcoming", "archive"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs tracking-widest cursor-pointer transition-all duration-200 whitespace-nowrap font-mono border ${
                tab === t
                  ? "bg-terminal-accent-amber/15 text-terminal-accent-amber border-terminal-accent-amber/40"
                  : "bg-transparent text-terminal-muted border-transparent hover:text-terminal-subdued"
              }`}
            >
              <LabelText text={t === "upcoming" ? "▶ UPCOMING" : "◼ ARCHIVE"} />
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <motion.div variants={itemVariants} className="text-xs font-mono text-terminal-muted text-center py-8">
          <LabelText text="▸ LOADING GATE DATA..." />
        </motion.div>
      ) : error ? (
        <motion.div variants={itemVariants} className="border border-terminal-accent-hot/25 bg-terminal-bg-panel px-4 py-8 text-center space-y-2">
          <div className="text-xs font-bold tracking-widest text-terminal-accent-hot font-mono">
            <LabelText text="⚠ SIGNAL LINK UNSTABLE" />
          </div>
          <div className="text-xs text-terminal-muted font-mono">
            <MetaText text="DATABASE UNREACHABLE — RETRY LATER" />
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
                  {/* Event header */}
                  <div className="border border-terminal-accent-cyan/30 px-4 py-4 bg-terminal-bg-panel">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs tracking-widest mb-1 font-mono text-terminal-muted">
                          <MetaText text={`${upcomingEvent.date.replace(/-/g, ".")} · ${upcomingEvent.time}`} />
                        </div>
                        <div className="drop-shadow-[0_0_12px_rgba(58,152,128,0.4)]">
                          <HeadingText
                            text={upcomingEvent.session}
                            as="span"
                            className="text-xl font-bold tracking-[0.15em] text-terminal-accent-cyan"
                          />
                        </div>
                        <SubtitleText
                          text={upcomingEvent.subtitle}
                          className="text-xs mt-1 text-terminal-subdued tracking-[0.1em]"
                        />
                      </div>
                      <div className="text-xs font-bold tracking-wider shrink-0 text-terminal-accent-cyan font-mono">
                        <span className="status-pulse mr-1">●</span>
                        <LabelText text="UPCOMING" className="inline" />
                      </div>
                    </div>
                  </div>

                  <EventDetail event={upcomingEvent} showCountdown />

                  <div className="text-center pt-2">
                    <TerminalButton className="px-8" variant="primary">
                      ▶ REQUEST ACCESS PASS
                    </TerminalButton>
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
                        ? "border-terminal-accent-hot/50 bg-terminal-accent-hot/10"
                        : "border-terminal-accent-amber/15 bg-terminal-bg-panel hover:bg-terminal-accent-amber/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className={`text-sm font-bold tracking-wider ${selectedArchive === ev.id ? "text-terminal-accent-hot" : "text-terminal-primary"}`}>
                          <SubtitleText text={ev.session} />
                        </div>
                        <div className="text-xs mt-0.5 text-terminal-subdued">
                          <MetaText text={`${ev.subtitle} · ${ev.date.replace(/-/g, ".")}`} />
                        </div>
                      </div>
                      <div className="text-xs tracking-wider shrink-0 text-terminal-muted">
                        <LabelText text="◼ ARCHIVED" />
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
                  transition={{ duration: 0.2 }}
                >
                  <EventDetail event={selectedEvent} showCountdown={false} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </PageLayout>
  );
}
