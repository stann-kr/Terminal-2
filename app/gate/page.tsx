'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import DecodeText from '@/components/DecodeText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import TerminalButton from '@/components/TerminalButton';
import EventDetail from './EventDetail';
import { EVENTS, UPCOMING_EVENT, ARCHIVED_EVENTS } from '@/lib/eventData';

export default function GatePage() {
  const [tab, setTab] = useState<'upcoming' | 'archive'>('upcoming');
  const [selectedArchive, setSelectedArchive] = useState(ARCHIVED_EVENTS[0]?.id ?? '');

  const selectedEvent = tab === 'upcoming'
    ? UPCOMING_EVENT
    : EVENTS.find(e => e.id === selectedArchive) ?? ARCHIVED_EVENTS[0];

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/gate" title="GATE.EXE" accent="cyan" variants={itemVariants} />

      {/* Tab switcher */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="inline-flex p-1 gap-1 bg-black/50 border border-terminal-accent-amber/15">
          {(['upcoming', 'archive'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs tracking-widest cursor-pointer transition-all duration-200 whitespace-nowrap font-mono border ${
                tab === t
                  ? 'bg-terminal-accent-amber/15 text-terminal-accent-amber border-terminal-accent-amber/40'
                  : 'bg-transparent text-terminal-muted border-transparent hover:text-terminal-subdued'
              }`}
            >
              <DecodeText text={t === 'upcoming' ? '▶ UPCOMING [02]' : '◼ ARCHIVE [01]'} speed={0.6} scramble={5} />
            </button>
          ))}
        </div>
      </motion.div>

        <AnimatePresence mode="wait">
          {tab === 'upcoming' ? (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Event header */}
              <div className="border border-terminal-accent-cyan/30 px-4 py-4 bg-terminal-bg-panel">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs tracking-widest mb-1 font-mono text-terminal-muted">
                      <DecodeText text={`${UPCOMING_EVENT.date.replace(/-/g, '.')} · ${UPCOMING_EVENT.time}`} speed={0.5} scramble={5} />
                    </div>
                    <DecodeText
                      text={UPCOMING_EVENT.session}
                      speed={0.6}
                      scramble={8}
                      className="text-xl font-bold tracking-[0.15em] text-terminal-accent-cyan drop-shadow-[0_0_12px_rgba(58,152,128,0.4)]"
                    />
                    <DecodeText
                      text={UPCOMING_EVENT.subtitle}
                      speed={0.4}
                      scramble={5}
                      className="text-xs mt-1 text-terminal-subdued tracking-[0.1em]"
                    />
                  </div>
                  <div className="text-xs font-bold tracking-wider shrink-0 text-terminal-accent-cyan font-mono">
                    <span className="status-pulse mr-1">●</span><DecodeText text="UPCOMING" speed={0.5} scramble={4} className="inline" />
                  </div>
                </div>
              </div>

              <EventDetail event={UPCOMING_EVENT} showCountdown />

              <div className="text-center pt-2">
                <TerminalButton className="px-8" variant="primary">
                  ▶ REQUEST ACCESS PASS
                </TerminalButton>
              </div>
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
                {ARCHIVED_EVENTS.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedArchive(ev.id)}
                    className={`w-full text-left px-4 py-3 border cursor-pointer transition-all duration-200 font-mono ${
                      selectedArchive === ev.id
                        ? 'border-terminal-accent-hot/50 bg-terminal-accent-hot/10'
                        : 'border-terminal-accent-amber/15 bg-terminal-bg-panel hover:bg-terminal-accent-amber/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className={`text-sm font-bold tracking-wider ${selectedArchive === ev.id ? 'text-terminal-accent-hot' : 'text-terminal-primary'}`}>
                          <DecodeText text={ev.session} speed={0.5} scramble={5} />
                        </div>
                        <div className="text-xs mt-0.5 text-terminal-subdued">
                          <DecodeText text={`${ev.subtitle} · ${ev.date.replace(/-/g, '.')}`} speed={0.4} scramble={4} />
                        </div>
                      </div>
                      <div className="text-xs tracking-wider shrink-0 text-terminal-muted">
                        <DecodeText text="◼ ARCHIVED" speed={0.5} scramble={4} />
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
    </PageLayout>
  );
}