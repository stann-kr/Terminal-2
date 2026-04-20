'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import TerminalPanel from '@/components/TerminalPanel';
import StatusMetric from './StatusMetric';
import GlobeMapDynamic from './GlobeMapDynamic';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { LabelText, SubtitleText, MetaText } from '@/components/ui/TerminalText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import { useT } from '@/lib/langContext';
import { fetchEvents, eventKeys } from '@/lib/queries/events';

export default function StatusPage() {
  const t = useT();

  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: eventKeys.list(),
    queryFn: fetchEvents,
  });

  const archivedCount  = events.filter(e => e.status === 'ARCHIVED').length;
  const upcomingEvent  = events.find(e => e.status === 'UPCOMING');
  const confirmedCount = new Set(events.flatMap(e => e.artists).map(a => a.name)).size;

  const nextLaunchValue = upcomingEvent ? upcomingEvent.id : '—';
  const nextLaunchUnit  = upcomingEvent
    ? upcomingEvent.date.replace(/-/g, '.')
    : t.status.unitStandby;

  const statusColorClass = (status: string) =>
    status === 'UPCOMING' ? 'text-terminal-accent-secondary' :
    status === 'LIVE'     ? 'text-terminal-accent-primary'  :
                            'text-terminal-accent-alert';

  const statusSymbol = (status: string) =>
    status === 'ARCHIVED' ? '◼' : '●';

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/status" title="STATUS.SYS" accent="alert" variants={itemVariants} />

      {/* Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatusMetric
          label={t.status.labelSessionsRun}
          value={String(archivedCount).padStart(2, '0')}
          unit={t.status.unitArchived}
          accent="alert"
          delay={0.2}
        />
        <StatusMetric
          label={t.status.labelNextLaunch}
          value={nextLaunchValue}
          unit={nextLaunchUnit}
          accent="secondary"
          delay={0.3}
        />
        <StatusMetric
          label={t.status.labelArtistNodes}
          value={String(confirmedCount).padStart(2, '0')}
          unit={t.status.unitConfirmed}
          accent="primary"
          delay={0.4}
        />
      </motion.div>

      {/* Node Map */}
      <motion.div variants={itemVariants} className="mb-6">
        <TerminalPanel title="GALACTIC_NODE_MAP — REALTIME" accent="alert">
          <GlobeMapDynamic />
        </TerminalPanel>
      </motion.div>

      {/* Session Log */}
      <motion.div variants={itemVariants}>
        <TerminalPanel title={t.status.sessionLogTitle} accent="primary">
          {isLoading ? (
            <div className="text-xs font-mono text-terminal-muted py-4 text-center">
              <LabelText text={t.status.loading} />
            </div>
          ) : isError || events.length === 0 ? (
            <div className="text-xs font-mono text-terminal-muted py-4 text-center">
              <MetaText text={t.status.noSessions} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* 데스크탑 헤더 */}
              <div className="hidden md:grid grid-cols-12 gap-2 pb-2 border-b border-terminal-accent-primary/15 font-mono">
                <span className="col-span-2 text-terminal-muted"><LabelText text={t.status.colSession} /></span>
                <span className="col-span-4 text-terminal-muted"><LabelText text="ID / NAME" /></span>
                <span className="col-span-2 text-terminal-muted"><LabelText text={t.status.colDate} /></span>
                <span className="col-span-2 text-terminal-muted"><LabelText text={t.status.colArtists} /></span>
                <span className="col-span-2 text-terminal-muted"><LabelText text={t.status.colStatus} /></span>
              </div>

              {events.map((event, i) => {
                const colorClass  = statusColorClass(event.status);
                const symbol      = statusSymbol(event.status);
                const isPulsing   = event.status !== 'ARCHIVED';
                const artistCount = event.artists.length;

                return (
                  <div key={event.id} className="border-b border-terminal-accent-primary/10 pb-4 last:border-0 last:pb-0">
                    {/* Mobile */}
                    <div className="md:hidden space-y-1.5 font-mono">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-terminal-primary">
                          <LabelText text={event.id} delay={i * 30} autoHeight />
                        </span>
                        <span className={`tracking-wider shrink-0 ${colorClass}`}>
                          {isPulsing && <span className="status-pulse mr-1">●</span>}
                          <LabelText text={`${symbol} ${event.status}`} className="inline" delay={i * 30} autoHeight />
                        </span>
                      </div>
                      <div className="text-terminal-accent-secondary">
                        <SubtitleText text={event.session} delay={i * 30} autoHeight />
                      </div>
                      <div className="text-terminal-subdued">
                        <MetaText text={event.subtitle} delay={i * 30} autoHeight />
                      </div>
                      <div className="flex gap-4 text-terminal-muted">
                        <MetaText text={event.date.replace(/-/g, '.')} delay={i * 30} autoHeight />
                        <MetaText text={`${artistCount} NODES`} delay={i * 30} autoHeight />
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-2 items-start font-mono">
                      <span className="col-span-2 font-bold text-terminal-primary">
                        <LabelText text={event.id} delay={i * 30} />
                      </span>
                      <div className="col-span-4">
                        <div className="text-terminal-accent-secondary">
                          <SubtitleText text={event.session} delay={i * 30} />
                        </div>
                        <div className="text-terminal-subdued mt-0.5">
                          <MetaText text={event.subtitle} delay={i * 30} />
                        </div>
                      </div>
                      <span className="col-span-2 text-terminal-subdued">
                        <MetaText text={event.date.replace(/-/g, '.')} delay={i * 30} />
                      </span>
                      <span className="col-span-2 text-terminal-muted">
                        <MetaText text={`${artistCount} NODES`} delay={i * 30} />
                      </span>
                      <span className={`col-span-2 font-bold tracking-wider flex items-center gap-1 ${colorClass}`}>
                        {isPulsing && <span className="status-pulse flex-shrink-0">●</span>}
                        {!isPulsing && <span className="flex-shrink-0">{symbol}</span>}
                        <LabelText text={event.status} delay={i * 30} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TerminalPanel>
      </motion.div>
    </PageLayout>
  );
}
