'use client';
import { motion } from 'framer-motion';
import TerminalPanel from '@/components/TerminalPanel';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import DecodeText from '@/components/DecodeText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';

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

export default function AboutPage() {
  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/about" title="ABOUT.SYS" accent="amber" variants={itemVariants} />

        {/* Manifesto */}
        <motion.div variants={itemVariants} className="mb-6">
          <TerminalPanel title="MANIFESTO_v1.txt" accent="green">
            <div className="space-y-1">
              {MANIFESTO.map((line, i) => (
                <div
                  key={i}
                  className="text-xs leading-6"
                >
                  {line === '' ? (
                    <span>&nbsp;</span>
                  ) : (
                    <DecodeText
                      text={line}
                      speed={0.45}
                      scramble={6}
                      delay={i * 50}
                      animateTextLength={true}
                      className={`block ${line.startsWith('TERMINAL') ? 'text-terminal-primary' : 'text-terminal-subdued'}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </TerminalPanel>
        </motion.div>

        {/* System Info */}
        <motion.div variants={itemVariants}>
          <TerminalPanel title="SYSINFO.DAT" accent="cyan">
            <div className="space-y-2">
              {SYSTEM_INFO.map((item, i) => (
                <div
                  key={item.key}
                  className="flex items-start gap-2 sm:gap-3 text-xs font-mono"
                >
                  <span className="w-24 sm:w-36 shrink-0 text-terminal-subdued">
                    <DecodeText text={item.key} speed={0.6} scramble={4} delay={i * 30} />
                  </span>
                  <span className="text-terminal-muted">:</span>
                  <DecodeText
                    text={item.val}
                    speed={0.5}
                    scramble={6}
                    delay={i * 30}
                    className={item.key === 'STATUS' ? 'text-terminal-accent-amber' : 'text-terminal-accent-cyan'}
                  />
                </div>
              ))}
            </div>
          </TerminalPanel>
        </motion.div>
    </PageLayout>
  );
}
