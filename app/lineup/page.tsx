'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedHeight from '@/components/ui/AnimatedHeight';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { LabelText, SubtitleText, MetaText } from '@/components/ui/TerminalText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import ArtistRow from './ArtistRow';
import { useLang } from '@/lib/langContext';
import { lineupKo, commonKo } from '@/lib/i18n';
import type { TerminalEvent } from '@/lib/eventData';

export default function LineupPage() {
  const { lang } = useLang();
  const [events, setEvents] = useState<TerminalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    fetch('/api/events')
      .then((res) => { if (!res.ok) throw new Error(); return res.json() as Promise<TerminalEvent[]>; })
      .then((data) => {
        setEvents(data);
        const upcoming = data.find((e) => e.status === 'UPCOMING');
        setSelectedId(upcoming?.id ?? data[0]?.id ?? '');
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const selectedEvent = events.find((e) => e.id === selectedId) ?? events[0];

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/lineup" title="LINEUP.DAT" accent="warn" variants={itemVariants} />

      {loading ? (
        <motion.div variants={itemVariants} className="text-xs font-mono text-terminal-muted text-center py-8">
          <LabelText text={lang === 'ko' ? lineupKo.loading : '▸ LOADING LINEUP DATA...'} />
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
        <>
          {/* Session selector */}
          <motion.div variants={itemVariants} className="mb-6 space-y-2">
            {events.map((ev) => {
              const isSelected = ev.id === selectedId;
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
                        <span className={`text-sm font-bold tracking-wider ${textClasses}`}>
                          <LabelText text={ev.session} />
                        </span>
                        {isUpcoming && (
                          <span className="text-xs px-1.5 py-0.5 tracking-widest text-terminal-accent-secondary border border-terminal-accent-secondary/40 bg-terminal-accent-secondary/10">
                            <LabelText text={lang === 'ko' ? lineupKo.upcomingTag : 'UPCOMING'} />
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5 text-terminal-subdued">
                        <MetaText text={`${ev.subtitle} · ${ev.date.replace(/-/g, '.')}`} />
                      </div>
                    </div>
                    <div className="text-xs shrink-0 text-terminal-muted">
                      <MetaText text={lang === 'ko' ? lineupKo.actCount(ev.artists.length) : `${ev.artists.length} ACTS`} />
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
                    <div className="grid grid-cols-12 gap-2 text-xs tracking-widest text-terminal-muted font-mono">
                      <span className="col-span-1"><MetaText text="ID" /></span>
                      <span className="col-span-3"><MetaText text={lang === 'ko' ? lineupKo.colArtist : 'ARTIST'} /></span>
                      <span className="col-span-1"><MetaText text="ORG" /></span>
                      <span className="col-span-3"><MetaText text="DOCK" /></span>
                      <span className="col-span-2"><MetaText text={lang === 'ko' ? lineupKo.colTimeslot : 'TIMESLOT'} /></span>
                      <span className="col-span-2"><MetaText text={lang === 'ko' ? lineupKo.colStatus : 'STATUS'} /></span>
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
                      text={selectedEvent.status === 'UPCOMING'
                        ? (lang === 'ko' ? lineupKo.footerUpcoming : '— DECRYPTING ADDITIONAL ROSTER — STANDBY —')
                        : (lang === 'ko' ? lineupKo.footerArchived : '— SECTOR 01 COMPLETE — ANALOG DATA PURGED —')}
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
