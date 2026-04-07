'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import TerminalPanel from '@/components/TerminalPanel';
import PageLayout from '@/components/PageLayout';

const MANIFESTO = [
  'TERMINAL is not a club.',
  'TERMINAL is not a label.',
  'TERMINAL is a frequency.',
  '',
  'Born in the basement circuits of Seoul\'s underground, we exist',
  'at the intersection of machine rhythm and human trance.',
  '',
  'We believe 4/4 is a religion. Darkness is a canvas.',
  'The kick drum is a heartbeat. The reverb is the cosmos.',
  '',
  'No face. No brand. Only signal.',
];

const SYSTEM_INFO = [
  { key: 'PLATFORM_ID',    val: 'TERMINAL-UNDERGROUND' },
  { key: 'BUILD',          val: '4.2.0-RELEASE' },
  { key: 'LOCATION',       val: 'CLASSIFIED / SEOUL-KR' },
  { key: 'GENRE_RANGE',    val: 'TECHNO · INDUSTRIAL · NOISE' },
  { key: 'BPM_RANGE',      val: '130 – 165 BPM' },
  { key: 'FOUNDED',        val: '2019 // CYCLE 1' },
  { key: 'UPTIME',         val: '2,347 DAYS' },
  { key: 'EVENTS_RUN',     val: '143 SESSIONS' },
  { key: 'SIGNAL_REACH',   val: '12,884 NODES' },
  { key: 'STATUS',         val: 'OPERATIONAL' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function AboutPage() {
  return (
    <PageLayout>
      <motion.div 
        className="w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back */}
        <motion.div variants={itemVariants} className="mb-6">
          <Link href="/home" className="text-xs tracking-widest cursor-pointer hover-glow inline-block px-3 py-1.5 border transition-colors whitespace-nowrap"
            style={{ borderColor: 'rgba(212,146,10,0.25)', color: '#6a5030', fontFamily: 'var(--font-mono)' }}>
            ◀ RETURN /home
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10' }}>/terminal/about</div>
          <h1 className="text-3xl font-bold tracking-[0.2em]" style={{ color: '#d4920a', textShadow: '0 0 16px rgba(212,146,10,0.4)', fontFamily: 'var(--font-mono)' }}>
            ABOUT.SYS
          </h1>
        </motion.div>

        {/* Manifesto */}
        <motion.div variants={itemVariants} className="mb-6">
          <TerminalPanel title="MANIFESTO_v1.txt" accent="green">
            <div className="space-y-1">
              {MANIFESTO.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="text-xs leading-6"
                  style={{
                    color: line === '' ? 'transparent' : line.startsWith('TERMINAL') ? '#e8d890' : '#8a6840',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {line || '　'}
                </motion.div>
              ))}
            </div>
          </TerminalPanel>
        </motion.div>

        {/* System Info */}
        <motion.div variants={itemVariants}>
          <TerminalPanel title="SYSINFO.DAT" accent="cyan">
            <div className="space-y-2">
              {SYSTEM_INFO.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className="flex items-start gap-2 sm:gap-3 text-xs"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  <span className="w-24 sm:w-36 shrink-0" style={{ color: '#6a5030' }}>{item.key}</span>
                  <span style={{ color: '#3a2a10' }}>:</span>
                  <span style={{ color: item.key === 'STATUS' ? '#d4920a' : '#3a9880' }}>{item.val}</span>
                </motion.div>
              ))}
            </div>
          </TerminalPanel>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}
