'use client';
import { motion } from 'framer-motion';
import DirectoryLink from '@/components/DirectoryLink';
import DecodeText from '@/components/DecodeText';
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
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {},
  visible: {},
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
            <DecodeText text="╔══════════════════════════════════════════╗" speed={0.8} scramble={3} />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-[0.3em] mb-2"
          >
            <DecodeText
              text="TERMINAL"
              as="span"
              speed={0.7}
              scramble={10}
              style={{ color: '#d4920a', textShadow: '0 0 30px rgba(212,146,10,0.5), 0 0 60px rgba(212,146,10,0.18)' }}
            />
          </motion.h1>

          <motion.div variants={itemVariants} className="text-[10px] sm:text-xs">
            <DecodeText
              text="UNDERGROUND TECHNO PLATFORM · SESSION ACTIVE"
              speed={0.5}
              scramble={8}
              delay={100}
              style={{ color: '#6a5030', textAlign: 'center', letterSpacing: '0.1em' }}
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-xs tracking-widest mt-3 overflow-hidden truncate"
            style={{ color: '#3a2a10' }}
          >
            <DecodeText text="╚══════════════════════════════════════════╝" speed={0.8} scramble={3} />
          </motion.div>
        </div>

        {/* Next Event Countdown */}
        <motion.div
          variants={itemVariants}
          className="mb-8 border py-6 px-4"
          style={{ borderColor: 'rgba(212,146,10,0.2)', background: 'rgba(18,14,8,0.95)' }}
        >
          <div className="text-center mb-4">
            <div className="mb-1 text-[10px] sm:text-xs">
              <DecodeText
                text="NEXT EVENT — MAY 08 2026"
                speed={0.45}
                scramble={6}
                style={{ color: '#3a2a10', textAlign: 'center', letterSpacing: '0.1em' }}
              />
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              <DecodeText
                text="TERMINAL [02]"
                speed={0.6}
                scramble={10}
                style={{ color: '#d4920a', textShadow: '0 0 16px rgba(212,146,10,0.4)', textAlign: 'center', letterSpacing: '0.2em' }}
              />
            </div>
            <div className="mt-1 text-[10px] sm:text-xs">
              <DecodeText
                text="Heliopause Outskirts"
                speed={0.4}
                scramble={6}
                style={{ color: '#6a5030', textAlign: 'center', letterSpacing: '0.1em' }}
              />
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
            <span className="text-[10px] sm:text-xs tracking-widest" style={{ color: '#d4920a' }}>
              <DecodeText text="▶ ROOT DIRECTORY — /terminal/" speed={0.6} scramble={6} />
            </span>
            <span className="text-[10px] sm:text-xs" style={{ color: '#3a2a10' }}>
              <DecodeText text="5 MODULE(S)" speed={0.6} scramble={4} />
            </span>
          </div>

          {DIRS.map((dir, i) => (
            <div
              key={dir.href}
            >
              <DirectoryLink {...dir} index={i + 1} />
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex items-center justify-between text-[10px] sm:text-xs"
          style={{ color: '#3a2a10', fontFamily: 'var(--font-mono)' }}
        >
          <span><DecodeText text="KERNEL 4.2.0-underground" speed={0.4} scramble={4} /></span>
          <span suppressHydrationWarning={true}><DecodeText text={new Date().toISOString().slice(0, 10)} speed={0.4} scramble={4} /></span>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}
