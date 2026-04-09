'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { LabelText, SubtitleText, MetaText } from '@/components/ui/TerminalText';
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
                        <LabelText text={ev.session} />
                      </span>
                      {isUpcoming && (
                        <span className="text-xs px-1.5 py-0.5 tracking-widest text-terminal-accent-cyan border border-terminal-accent-cyan/40 bg-terminal-accent-cyan/10">
                          <LabelText text="UPCOMING" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5 text-terminal-subdued">
                      <MetaText text={`${ev.subtitle} · ${ev.date.replace(/-/g, '.')}`} />
                    </div>
                  </div>
                  <div className="text-xs shrink-0 text-terminal-muted">
                    <MetaText text={`${ev.artists.length} ACTS`} />
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
                <span className="col-span-1"><MetaText text="ID" /></span>
                <span className="col-span-3"><MetaText text="ARTIST" /></span>
                <span className="col-span-1"><MetaText text="ORG" /></span>
                <span className="col-span-3"><MetaText text="DOCK" /></span>
                <span className="col-span-2"><MetaText text="TIMESLOT" /></span>
                <span className="col-span-2"><MetaText text="STATUS" /></span>
              </div>
            </div>

            <div className="space-y-2">
              {selectedEvent.artists.map((a) => (
                <div key={a.id} className="w-full">
                  <ArtistRow artist={a} />
                </div>
              ))}
            </div>

            <div className="mt-6 text-xs text-center text-terminal-muted font-mono">
              <SubtitleText
                text={selectedEvent.status === 'UPCOMING'
                  ? '— DECRYPTING ADDITIONAL ROSTER — STANDBY —'
                  : '— SECTOR 01 COMPLETE — ANALOG DATA PURGED —'}
              />
            </div>
          </motion.div>
        </AnimatePresence>
    </PageLayout>
  );
}
