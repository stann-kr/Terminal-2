'use client';
import { motion } from 'framer-motion';
import DirectoryLink from '@/components/DirectoryLink';
import GlitchText from '@/components/GlitchText';
import PageLayout from '@/components/PageLayout';
import CountdownBlock from '@/app/home/CountdownBlock';

const DIRS = [
  { href: '/about',    label: 'About',    description: 'PLATFORM MANIFESTO / SYSTEM INFORMATION', accent: '#d4920a' },
  { href: '/gate',     label: 'Gate',     description: 'NEXT EVENT / COUNTDOWN / COORDINATES',     accent: '#3a9880' },
  { href: '/lineup',   label: 'Lineup',   description: 'ARTIST ROSTER / SESSION IDs / TRACKLIST',  accent: '#c8a030' },
  { href: '/status',   label: 'Status',   description: 'SYSTEM DIAGNOSTICS / NETWORK TELEMETRY',   accent: '#c85020' },
  { href: '/transmit', label: 'Transmit', description: 'INCOMING SIGNAL LOG / VISITOR BROADCAST',  accent: '#8868a8' },
];

const EVENT_DATE = new Date('2026-05-08T23:00:00');

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function HomePage() {
  return (
    <PageLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <motion.div
            variants={itemVariants}
            className="text-xs tracking-widest mb-3 overflow-hidden truncate"
            style={{ color: '#3a2a10' }}
          >
            ╔══════════════════════════════════════════╗
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-[0.3em] mb-2"
            style={{ color: '#d4920a', textShadow: '0 0 30px rgba(212,146,10,0.5), 0 0 60px rgba(212,146,10,0.18)', fontFamily: 'var(--font-mono)' }}
          >
            <GlitchText text="TERMINAL" intensity="low" />
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xs tracking-widest"
            style={{ color: '#6a5030' }}
          >
            UNDERGROUND TECHNO PLATFORM · SESSION ACTIVE
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="text-xs tracking-widest mt-3 overflow-hidden truncate"
            style={{ color: '#3a2a10' }}
          >
            ╚══════════════════════════════════════════╝
          </motion.div>
        </div>

        {/* Next Event Countdown */}
        <motion.div
          variants={itemVariants}
          className="mb-8 border py-6 px-4"
          style={{ borderColor: 'rgba(212,146,10,0.2)', background: 'rgba(18,14,8,0.95)' }}
        >
          <div className="text-center mb-4">
            <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10' }}>
              NEXT EVENT — MAY 08 2026
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-[0.2em]" style={{ color: '#d4920a', textShadow: '0 0 16px rgba(212,146,10,0.4)', fontFamily: 'var(--font-mono)' }}>
              TERMINAL [02]
            </div>
            <div className="text-xs tracking-widest mt-1" style={{ color: '#6a5030', fontFamily: 'var(--font-mono)' }}>
              Heliopause Outskirts
            </div>
          </div>
          <CountdownBlock targetDate={EVENT_DATE} />
        </motion.div>

        {/* Directory */}
        <motion.div
          variants={itemVariants}
          className="border"
          style={{ borderColor: 'rgba(212,146,10,0.2)', background: 'rgba(18,14,8,0.95)' }}
        >
          <div className="px-4 py-2 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(212,146,10,0.15)', background: 'rgba(0,0,0,0.4)' }}>
            <span className="text-xs tracking-widest" style={{ color: '#d4920a' }}>
              ▶ ROOT DIRECTORY — /terminal/
            </span>
            <span className="text-xs" style={{ color: '#3a2a10' }}>5 MODULE(S)</span>
          </div>

          {DIRS.map((dir, i) => (
            <motion.div
              key={dir.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
            >
              <DirectoryLink {...dir} index={i + 1} />
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex items-center justify-between text-xs"
          style={{ color: '#3a2a10', fontFamily: 'var(--font-mono)' }}
        >
          <span>KERNEL 4.2.0-underground</span>
          <span suppressHydrationWarning={true}>{new Date().toISOString().slice(0, 10)}</span>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}
