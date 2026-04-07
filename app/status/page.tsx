'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import TerminalPanel from '@/components/TerminalPanel';
import StatusMetric from './StatusMetric';
import GlobeMapDynamic from './GlobeMapDynamic';
import PageLayout from '@/components/PageLayout';

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
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, filter: 'blur(6px) brightness(1.5)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px) brightness(1)',
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
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
            ◀ RETURN /home
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10' }}>/terminal/status</div>
          <h1 className="text-3xl font-bold tracking-[0.2em]" style={{ color: '#c85020', textShadow: '0 0 16px rgba(200,80,32,0.4)', fontFamily: 'var(--font-mono)' }}>
            STATUS.SYS
          </h1>
        </motion.div>

        {/* Metrics — 1 col mobile, 3 col sm+ */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <StatusMetric label="ACTIVE_RELAYS" value="6 / 12" unit="NODES" accent="#d4920a" delay={0.4} />
          <StatusMetric label="SIGNAL_UPTIME" value="99.97" unit="%" accent="#3a9880" delay={0.5} />
          <StatusMetric label="CORE_FREQ" value="148.3" unit="THz" accent="#c85020" delay={0.6} />
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
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.06 }}
                  >
                    {/* Mobile */}
                    <div className="md:hidden space-y-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold" style={{ color: '#e8d890' }}>{s.name}</span>
                        <span className="text-xs font-bold tracking-wider" style={{ color: statusColor }}>
                          <span className="status-pulse mr-1">●</span>{s.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span style={{ color: '#6a5030' }}>{s.sector}</span>
                        <span style={{ color: '#3a9880' }}>{s.lag === 0 ? '—' : `${s.lag} ly`}</span>
                        <span style={{ color: '#6a5030' }}>LOAD: {s.load}%</span>
                      </div>
                      {s.load > 0 && (
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(212,146,10,0.1)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${s.load}%`, background: s.load > 70 ? '#c8a030' : '#d4920a' }} />
                        </div>
                      )}
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-2 items-center text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                      <span className="col-span-3 font-bold" style={{ color: '#e8d890' }}>{s.name}</span>
                      <span className="col-span-4 truncate" style={{ color: '#6a5030' }}>{s.sector}</span>
                      <span className="col-span-2" style={{ color: '#3a9880' }}>{s.lag === 0 ? 'LOCAL' : `${s.lag} ly`}</span>
                      <div className="col-span-2">
                        {s.load > 0 ? (
                          <>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(212,146,10,0.1)' }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${s.load}%`, background: s.load > 70 ? '#c8a030' : '#d4920a' }} />
                            </div>
                            <span style={{ color: '#6a5030' }}>{s.load}%</span>
                          </>
                        ) : (
                          <span style={{ color: '#2a1a08' }}>—</span>
                        )}
                      </div>
                      <span className="col-span-1 font-bold tracking-wider" style={{ color: statusColor }}>
                        <span className="status-pulse mr-1">●</span>{s.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TerminalPanel>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}
