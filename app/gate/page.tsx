"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PageLayout, { itemVariants } from "@/components/PageLayout";
import { LabelText, SubtitleText, MetaText, HeadingText } from "@/components/ui/TerminalText";
import ReturnLink from "@/components/ui/ReturnLink";
import PageHeader from "@/components/ui/PageHeader";
import TerminalButton from "@/components/TerminalButton";
import EventDetail from "./EventDetail";
import { useT } from "@/lib/langContext";
import { fetchEvents, eventKeys } from "@/lib/queries/events";

export default function GatePage() {
  const t = useT();
  const [tab, setTab] = useState<"upcoming" | "archive">("upcoming");
  const [selectedArchive, setSelectedArchive] = useState("");

  const { data: events = [], isLoading: loading, isError: error } = useQuery({
    queryKey: eventKeys.list(),
    queryFn: fetchEvents,
  });

  const upcomingEvent = events.find((e) => e.status === "UPCOMING") || events[0] || null;
  const archivedEvents = events.filter((e) => e.status === "ARCHIVED");
  const effectiveArchiveId = selectedArchive || archivedEvents[0]?.id || "";
  const selectedEvent =
    tab === "upcoming"
      ? upcomingEvent
      : (events.find((e) => e.id === effectiveArchiveId) || archivedEvents[0] || null);

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
          {(["upcoming", "archive"] as const).map((tabKey) => (
            <TerminalButton
              key={tabKey}
              variant={tab === tabKey ? "primary" : "ghost"}
              className="px-4 py-1.5 text-micro"
              onClick={() => setTab(tabKey)}
            >
              {tabKey === "upcoming" ? t.gate.tabUpcoming : t.gate.tabArchive}
            </TerminalButton>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <motion.div variants={itemVariants} className="text-xs font-mono text-terminal-muted text-center py-8">
          <LabelText text={t.gate.loading} />
        </motion.div>
      ) : error ? (
        <motion.div variants={itemVariants} className="border border-terminal-accent-alert/25 bg-terminal-bg-panel px-4 py-8 text-center space-y-2">
          <div className="text-xs font-bold tracking-widest text-terminal-accent-alert font-mono">
            <LabelText text={t.common.signalUnstable} />
          </div>
          <div className="text-xs text-terminal-muted font-mono">
            <MetaText text={t.common.dbUnreachable} />
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
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
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
                      <div className="font-bold tracking-wider shrink-0 text-terminal-accent-secondary font-mono text-micro sm:text-small">
                        <span className="status-pulse mr-1">●</span>
                        <LabelText text="UPCOMING" className="inline" />
                      </div>
                    </div>
                  </div>

                  <EventDetail event={upcomingEvent} showCountdown />

                  <div className="text-center pt-2">
                    <Link href="/gate/request">
                      <TerminalButton className="px-8" variant="primary">
                        {t.gate.requestBtn}
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
                      effectiveArchiveId === ev.id
                        ? "border-terminal-accent-alert/50 bg-terminal-accent-alert/10"
                        : "border-terminal-accent-primary/15 bg-terminal-bg-panel hover:bg-terminal-accent-primary/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className={`font-bold tracking-wider ${effectiveArchiveId === ev.id ? "text-terminal-accent-alert" : "text-terminal-primary"}`}>
                          <SubtitleText autoHeight text={ev.session} />
                        </div>
                        <div className="text-xs mt-0.5 text-terminal-subdued">
                          <MetaText text={`${ev.subtitle} · ${ev.date.replace(/-/g, ".")}`} />
                        </div>
                      </div>
                      <div className="text-xs tracking-wider shrink-0 text-terminal-muted flex items-center">
                        <LabelText
                          autoHeight
                          text={t.gate.archivedLabel}
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
