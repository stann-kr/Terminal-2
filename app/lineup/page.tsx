'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import DecodeText from '@/components/DecodeText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import ArtistRow from './ArtistRow';
import { EVENTS, UPCOMING_EVENT } from '@/lib/eventData';

export default function LineupPage() {
  const [selectedId, setSelectedId] = useState(UPCOMING_EVENT.id);
  const selectedEvent = EVENTS.find(e => e.id === selectedId) ?? UPCOMING_EVENT;

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/lineup" title="LINEUP.DAT" accent="gold" variants={itemVariants} />

        {/* Session selector */}
        <motion.div variants={itemVariants} className="mb-6 space-y-2">
          {EVENTS.map((ev) => {
            const isSelected = ev.id === selectedId;
            const isUpcoming = ev.status === 'UPCOMING';
            
            let baseColorClasses = '';
            let textClasses = 'text-terminal-primary';
            if (isSelected) {
              if (isUpcoming) {
                baseColorClasses = 'border-terminal-accent-cyan/80 bg-terminal-accent-cyan/10';
                textClasses = 'text-terminal-accent-cyan';
              } else {
                baseColorClasses = 'border-terminal-accent-hot/80 bg-terminal-accent-hot/10';
                textClasses = 'text-terminal-accent-hot';
              }
            } else {
              baseColorClasses = 'border-terminal-accent-amber/12 bg-terminal-bg-panel hover:bg-terminal-accent-amber/5 text-terminal-primary';
            }

            return (
              <button
                key={ev.id}
                onClick={() => setSelectedId(ev.id)}
                className={`w-full text-left px-4 py-3 border border-terminal-accent-amber/20 cursor-pointer transition-all duration-200 font-mono ${baseColorClasses}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold tracking-wider ${textClasses}`}>
                        <DecodeText text={ev.session} speed={0.6} scramble={4} />
                      </span>
                      {isUpcoming && (
                        <span className="text-xs px-1.5 py-0.5 tracking-widest text-terminal-accent-cyan border border-terminal-accent-cyan/40 bg-terminal-accent-cyan/10">
                          <DecodeText text="UPCOMING" speed={0.5} scramble={4} />
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5 text-terminal-subdued">
                      <DecodeText text={`${ev.subtitle} · ${ev.date.replace(/-/g, '.')}`} speed={0.5} scramble={4} />
                    </div>
                  </div>
                  <div className="text-xs shrink-0 text-terminal-muted">
                    <DecodeText text={`${ev.artists.length} ACTS`} speed={0.5} scramble={3} />
                  </div>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Artist list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-3 px-4 py-2 border-b hidden md:block border-terminal-accent-gold/30">
              <div className="grid grid-cols-12 gap-2 text-xs tracking-widest text-terminal-muted font-mono">
                <span className="col-span-1"><DecodeText text="ID" speed={0.4} scramble={2} /></span>
                <span className="col-span-3"><DecodeText text="ARTIST" speed={0.4} scramble={2} /></span>
                <span className="col-span-1"><DecodeText text="ORG" speed={0.4} scramble={2} /></span>
                <span className="col-span-3"><DecodeText text="GENRE" speed={0.4} scramble={2} /></span>
                <span className="col-span-2"><DecodeText text="TIMESLOT" speed={0.4} scramble={2} /></span>
                <span className="col-span-2"><DecodeText text="STATUS" speed={0.4} scramble={2} /></span>
              </div>
            </div>

            <div className="space-y-2">
              {selectedEvent.artists.map((a, i) => (
                <div
                  key={a.id}
                  className="w-full"
                >
                  <ArtistRow artist={a} />
                </div>
              ))}
            </div>

            <div className="mt-6 text-xs text-center text-terminal-muted font-mono">
              <DecodeText
                text={selectedEvent.status === 'UPCOMING'
                  ? '— MORE ACTS TBA — STAY TUNED TO TERMINAL —'
                  : `— SESSION COMPLETE — ${selectedEvent.artists.length} ACTS TRANSMITTED —`}
                speed={0.5}
                scramble={6}
              />
            </div>
          </motion.div>
        </AnimatePresence>
    </PageLayout>
  );
}