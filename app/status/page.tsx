'use client';
import { motion } from 'framer-motion';
import TerminalPanel from '@/components/TerminalPanel';
import StatusMetric from './StatusMetric';
import GlobeMapDynamic from './GlobeMapDynamic';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { LabelText, SubtitleText, MetaText } from '@/components/ui/TerminalText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import { useLang } from '@/lib/langContext';
import { statusKo } from '@/lib/i18n';

const RELAYS = [
  { name: 'TRAPPIST-1',sector: 'AQUARIUS',        lag: 0,    load: 94, status: 'ONLINE' },
  { name: 'KEPLER-452B',sector: 'CYGNUS',          lag: 312,  load: 78, status: 'ONLINE' },
  { name: 'PROXIMA-B',  sector: 'CENTAURUS',      lag: 487,  load: 55, status: 'ONLINE' },
  { name: 'GLIESE-581', sector: 'LIBRA',          lag: 634,  load: 41, status: 'ONLINE' },
  { name: 'ORION-I',    sector: 'ORION_ARM·INNER', lag: 891,  load: 29, status: 'ONLINE' },
  { name: 'SGTR-I',     sector: 'SAGITTARIUS_ARM',  lag: 1204, load: 17, status: 'ONLINE' },
  { name: 'PRSUS-I',    sector: 'PERSEUS_ARM·INNER',lag: 1580, load: 0,  status: 'STANDBY' },
  { name: 'CYGNS-II',   sector: 'CYGNUS_ARM·RELAY', lag: 2340, load: 0,  status: 'STANDBY' },
  { name: 'NRMA-I',     sector: 'NORMA_ARM',        lag: 4120, load: 0,  status: 'DORMANT' },
  { name: 'HALO-I',     sector: 'HALO_CLUSTER',     lag: 8800, load: 0,  status: 'DORMANT' },
];

export default function StatusPage() {
  const { lang } = useLang();
  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/status" title="STATUS.SYS" accent="alert" variants={itemVariants} />

        {/* Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <StatusMetric label={lang === 'ko' ? statusKo.labelActiveRelays : 'ACTIVE_RELAYS'} value="4 / 12" unit={lang === 'ko' ? statusKo.unitNodes : 'NODES'} accent="primary" delay={0.2} />
          <StatusMetric label={lang === 'ko' ? statusKo.labelSignalUptime : 'SIGNAL_UPTIME'} value="100.00" unit="%" accent="secondary" delay={0.3} />
          <StatusMetric label={lang === 'ko' ? statusKo.labelCoreFreq : 'CORE_FREQ'} value="148.3" unit="THz" accent="alert" delay={0.4} />
        </motion.div>

        {/* Node Map */}
        <motion.div variants={itemVariants} className="mb-6">
          <TerminalPanel title="GALACTIC_NODE_MAP — REALTIME" accent="alert">
            <GlobeMapDynamic />
          </TerminalPanel>
        </motion.div>

        {/* Relay Telemetry */}
        <motion.div variants={itemVariants}>
          <TerminalPanel title="RELAY_TELEMETRY.log" accent="primary">
            <div className="space-y-4">
              {RELAYS.map((s, i) => {
                const statusColorClass =
                  s.status === 'ONLINE'  ? 'text-terminal-accent-primary' :
                  s.status === 'STANDBY' ? 'text-terminal-accent-warn' : 'text-terminal-muted';

                const loadBarColor = s.load > 70 ? 'bg-terminal-accent-warn' : 'bg-terminal-accent-primary';

                return (
                  <div key={s.name} className="group">
                    {/* Mobile */}
                    <div className="md:hidden space-y-1.5 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-terminal-primary">
                          <LabelText text={s.name} delay={i * 20} />
                        </span>
                        <span className={`text-xs font-bold tracking-wider ${statusColorClass}`}>
                          <span className="status-pulse mr-1">●</span>
                          <LabelText text={s.status} className="inline" delay={i * 20} />
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span className="text-terminal-subdued">
                          <SubtitleText text={s.sector} delay={i * 20} />
                        </span>
                        <span className="text-terminal-accent-secondary">
                          <MetaText text={s.lag === 0 ? '—' : `${s.lag} ly`} delay={i * 20} />
                        </span>
                        <span className="text-terminal-subdued">
                          <MetaText text={lang === 'ko' ? statusKo.load(s.load) : `LOAD: ${s.load}%`} delay={i * 20} />
                        </span>
                      </div>
                      {s.load > 0 && (
                        <div className="h-1.5 rounded-full overflow-hidden bg-terminal-accent-primary/10">
                          <div className={`h-full rounded-full transition-all ${loadBarColor}`} style={{ width: `${s.load}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-2 items-center text-xs font-mono">
                      <span className="col-span-2 font-bold text-terminal-primary">
                        <LabelText text={s.name} delay={i * 20} />
                      </span>
                      <span className="col-span-3 truncate text-terminal-subdued">
                        <SubtitleText text={s.sector} delay={i * 20} />
                      </span>
                      <span className="col-span-2 text-terminal-accent-secondary">
                        <MetaText text={s.lag === 0 ? 'LOCAL' : `${s.lag} ly`} delay={i * 20} />
                      </span>
                      <div className="col-span-2">
                        {s.load > 0 ? (
                          <>
                            <div className="h-1.5 rounded-full overflow-hidden mb-1 bg-terminal-accent-primary/10">
                              <div className={`h-full rounded-full transition-all ${loadBarColor}`} style={{ width: `${s.load}%` }} />
                            </div>
                            <span className="text-terminal-subdued">
                              <MetaText text={`${s.load}%`} delay={i * 20} />
                            </span>
                          </>
                        ) : (
                          <span className="text-terminal-bg-panel">—</span>
                        )}
                      </div>
                      <span className={`col-span-3 font-bold tracking-wider flex items-center gap-1 ${statusColorClass}`}>
                        <span className="status-pulse flex-shrink-0">●</span>
                        <LabelText text={s.status} delay={i * 20} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </TerminalPanel>
        </motion.div>
    </PageLayout>
  );
}
