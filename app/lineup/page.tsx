'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedHeight from '@/components/ui/AnimatedHeight';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { LabelText, SubtitleText, MetaText, HeadingText } from '@/components/ui/TerminalText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import ArtistRow from './ArtistRow';
import { useT } from '@/lib/langContext';
import { fetchEvents, eventKeys } from '@/lib/queries/events';

export default function LineupPage() {
  const t = useT();
  const [selectedId, setSelectedId] = useState('');

  const { data: events = [], isLoading: loading, isError: error } = useQuery({
    queryKey: eventKeys.list(),
    queryFn: fetchEvents,
  });

  const effectiveSelectedId = selectedId || events.find((e) => e.status === 'UPCOMING')?.id || events[0]?.id || '';
  const selectedEvent = events.find((e) => e.id === effectiveSelectedId) ?? events[0];

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/lineup" title="LINEUP.DAT" accent="warn" variants={itemVariants} />

      {loading ? (
        <motion.div variants={itemVariants} className="font-mono text-terminal-muted text-center py-8">
          <LabelText autoHeight text={t.lineup.loading} />
        </motion.div>
      ) : error ? (
        <motion.div variants={itemVariants} className="border border-terminal-accent-alert/25 bg-terminal-bg-panel px-4 py-8 text-center space-y-2">
          <div className="font-bold tracking-widest text-terminal-accent-alert font-mono">
            <LabelText autoHeight text={t.common.signalUnstable} />
          </div>
          <div className="text-terminal-muted font-mono">
            <MetaText autoHeight text={t.common.dbUnreachable} />
          </div>
        </motion.div>
      ) : (
        <>
          {/* Session selector */}
          <motion.div variants={itemVariants} className="mb-6 space-y-2">
            {events.map((ev) => {
              const isSelected = ev.id === effectiveSelectedId;
              const isUpcoming = ev.status === 'UPCOMING';

              let baseColorClasses = '';
              let textClasses = 'text-terminal-primary';
              if (isSelected) {
                if (isUpcoming) {
                  baseColorClasses = 'border-terminal-accent-secondary/80 bg-terminal-accent-secondary/10';
                  textClasses = 'text-terminal-accent-secondary';
                } else {
                  baseColorClasses = 'border-terminal-accent-alert/80 bg-terminal-accent-alert/10';
                  textClasses = 'text-terminal-accent-alert';
                }
              } else {
                baseColorClasses = 'border-terminal-accent-primary/12 bg-terminal-bg-panel hover:bg-terminal-accent-primary/5 text-terminal-primary';
              }

              return (
                <button
                  key={ev.id}
                  onClick={() => setSelectedId(ev.id)}
                  className={`w-full text-left px-4 py-3 border border-terminal-accent-primary/20 cursor-pointer transition-all duration-200 font-mono ${baseColorClasses}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`tracking-wider ${textClasses}`}>
                          <HeadingText as="span" text={ev.session} />
                        </span>
                        {isUpcoming && (
                          <span className="px-1.5 py-0.5 tracking-widest text-terminal-accent-secondary border border-terminal-accent-secondary/40 bg-terminal-accent-secondary/10">
                            <LabelText text={t.lineup.upcomingTag} />
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-terminal-subdued">
                        <MetaText text={`${ev.subtitle} · ${ev.date.replace(/-/g, '.')}`} className="text-small md:text-body" />
                      </div>
                    </div>
                    <div className="shrink-0 text-terminal-muted">
                      <MetaText text={t.lineup.actCount(ev.artists.length)} className="text-small md:text-body" />
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>

          {/* Artist list */}
          <AnimatedHeight>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {selectedEvent && (
                <>
                  {/* Header */}
                  <div className="px-4 py-2 border-b hidden md:block border-terminal-accent-warn/30">
                    <div className="grid grid-cols-12 gap-2 text-micro md:text-small tracking-widest text-terminal-muted font-mono">
                      <span className="col-span-1"><MetaText text="ID" /></span>
                      <span className="col-span-3"><MetaText text={t.lineup.colArtist} /></span>
                      <span className="col-span-1"><MetaText text="ORG" /></span>
                      <span className="col-span-3"><MetaText text="DOCK" /></span>
                      <span className="col-span-2"><MetaText text={t.lineup.colTimeslot} /></span>
                      <span className={`col-span-2`}><MetaText text={t.lineup.colStatus} /></span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedEvent.artists.map((a) => (
                      <div key={a.id} className="w-full">
                        <ArtistRow artist={a} />
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-center text-terminal-muted font-mono">
                    <SubtitleText
                      text={selectedEvent.status === 'UPCOMING' ? t.lineup.footerUpcoming : t.lineup.footerArchived}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          </AnimatedHeight>
        </>
      )}
    </PageLayout>
  );
}
