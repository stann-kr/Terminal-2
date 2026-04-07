'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import TerminalPanel from '@/components/TerminalPanel';
import StatusMetric from './StatusMetric';
import GlobeMapDynamic from './GlobeMapDynamic';
import PageLayout from '@/components/PageLayout';
import DecodeText from '@/components/DecodeText';

const RELAYS = [
  { name: 'NEXUS-Ω',   sector: 'GALACTIC_CORE',        lag: 0,    load: 94, status: 'ONLINE' },
  { name: 'ORION-I',   sector: 'ORION_ARM·INNER',       lag: 312,  load: 78, status: 'ONLINE' },
  { name: 'SGTR-I',    sector: 'SAGITTARIUS_ARM',        lag: 487,  load: 55, status: 'ONLINE' },
  { name: 'PRSUS-I',   sector: 'PERSEUS_ARM·INNER',      lag: 634,  load: 41, status: 'ONLINE' },
  { name: 'CYGNS-II',  sector: 'CYGNUS_ARM·RELAY',       lag: 891,  load: 29, status: 'ONLINE' },
  { name: 'NRMA-I',    sector: 'NORMA_ARM',              lag: 1204, load: 17, status: 'ONLINE' },
  { name: 'ORION-II',  sector: 'ORION_ARM·OUTER',        lag: 1580, load: 0,  status: 'STANDBY' },
  { name: 'PRSUS-II',  sector: 'PERSEUS_ARM·OUTER',      lag: 2340, load: 0,  status: 'STANDBY' },
  { name: 'RIM-α',     sector: 'OUTER_RIM·ALPHA',        lag: 4120, load: 0,  status: 'DORMANT' },
  { name: 'HALO-I',    sector: 'HALO_CLUSTER',           lag: 8800, load: 0,  status: 'DORMANT' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: {},
  visible: {},
};

export default function StatusPage() {
  return (
    <PageLayout>
      <motion.div
        className="w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <Link href="/home" className="text-xs tracking-widest cursor-pointer inline-block px-3 py-1.5 border transition-colors whitespace-nowrap"
            style={{ borderColor: 'rgba(212,146,10,0.25)', color: '#6a5030', fontFamily: 'var(--font-mono)' }}>
            <DecodeText text="◀ RETURN /home" speed={0.8} scramble={4} />
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10' }}>
            <DecodeText text="/terminal/status" speed={0.6} scramble={5} />
          </div>
          <DecodeText
            text="STATUS.SYS"
            as="h1"
            speed={0.65}
            scramble={10}
            className="text-3xl font-bold"
            style={{ color: '#c85020', textShadow: '0 0 16px rgba(200,80,32,0.4)', letterSpacing: '0.2em' }}
          />
        </motion.div>

        {/* Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <StatusMetric label="ACTIVE_RELAYS" value="6 / 12" unit="NODES" accent="#d4920a" delay={0.2} />
          <StatusMetric label="SIGNAL_UPTIME" value="99.97" unit="%" accent="#3a9880" delay={0.3} />
          <StatusMetric label="CORE_FREQ" value="148.3" unit="THz" accent="#c85020" delay={0.4} />
        </motion.div>

        {/* Node Map */}
        <motion.div variants={itemVariants} className="mb-6">
          <TerminalPanel title="GALACTIC_NODE_MAP — REALTIME" accent="hot">
            <GlobeMapDynamic />
          </TerminalPanel>
        </motion.div>

        {/* Relay Telemetry */}
        <motion.div variants={itemVariants}>
          <TerminalPanel title="RELAY_TELEMETRY.log" accent="amber">
            <div className="space-y-3">
              {RELAYS.map((s, i) => {
                const statusColor =
                  s.status === 'ONLINE'  ? '#d4920a' :
                  s.status === 'STANDBY' ? '#c8a030' : '#3a2a10';
                return (
                  <div
                    key={s.name}
                  >
                    {/* Mobile */}
                    <div className="md:hidden space-y-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold" style={{ color: '#e8d890' }}>
                          <DecodeText text={s.name} speed={0.6} scramble={4} delay={i * 20} />
                        </span>
                        <span className="text-xs font-bold tracking-wider" style={{ color: statusColor }}>
                          <span className="status-pulse mr-1">●</span>
                          <DecodeText text={s.status} speed={0.6} scramble={4} style={{ display: 'inline' }} delay={i * 20} />
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span style={{ color: '#6a5030' }}>
                          <DecodeText text={s.sector} speed={0.5} scramble={5} delay={i * 20} />
                        </span>
                        <span style={{ color: '#3a9880' }}>
                          <DecodeText text={s.lag === 0 ? '—' : `${s.lag} ly`} speed={0.5} scramble={5} delay={i * 20} />
                        </span>
                        <span style={{ color: '#6a5030' }}>
                          <DecodeText text={`LOAD: ${s.load}%`} speed={0.5} scramble={5} delay={i * 20} />
                        </span>
                      </div>
                      {s.load > 0 && (
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(212,146,10,0.1)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${s.load}%`, background: s.load > 70 ? '#c8a030' : '#d4920a' }} />
                        </div>
                      )}
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-2 items-center text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                      <span className="col-span-3 font-bold" style={{ color: '#e8d890' }}>
                        <DecodeText text={s.name} speed={0.6} scramble={4} delay={i * 20} />
                      </span>
                      <span className="col-span-4 truncate" style={{ color: '#6a5030' }}>
                        <DecodeText text={s.sector} speed={0.5} scramble={5} delay={i * 20} />
                      </span>
                      <span className="col-span-2" style={{ color: '#3a9880' }}>
                        <DecodeText text={s.lag === 0 ? 'LOCAL' : `${s.lag} ly`} speed={0.5} scramble={5} delay={i * 20} />
                      </span>
                      <div className="col-span-2">
                        {s.load > 0 ? (
                          <>
                            <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(212,146,10,0.1)' }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${s.load}%`, background: s.load > 70 ? '#c8a030' : '#d4920a' }} />
                            </div>
                            <span style={{ color: '#6a5030' }}>
                              <DecodeText text={`${s.load}%`} speed={0.5} scramble={4} delay={i * 20} />
                            </span>
                          </>
                        ) : (
                          <span style={{ color: '#2a1a08' }}>—</span>
                        )}
                      </div>
                      <span className="col-span-1 font-bold tracking-wider" style={{ color: statusColor }}>
                        <span className="status-pulse mr-1">●</span>
                        <DecodeText text={s.status} speed={0.6} scramble={4} style={{ display: 'inline' }} delay={i * 20} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </TerminalPanel>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}
