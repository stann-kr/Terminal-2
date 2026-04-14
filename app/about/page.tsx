'use client';
import { motion } from 'framer-motion';
import TerminalPanel from '@/components/TerminalPanel';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { BodyText, LabelText, SubtitleText } from '@/components/ui/TerminalText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import { useLang } from '@/lib/langContext';
import { manifestoKo } from '@/lib/i18n';

const MANIFESTO = [
  'TERMINAL is a Seoul-based techno platform designing an industrial station',
  'where audio signals and data intersect.',
  '',
  '[ DESIGN PRINCIPLE ]',
  'Stripping away non-essential visual elements, we focus on constructing',
  'a precisely controlled environment. Much like a CLI (Command Line Interface)',
  'rendered only by essential light and text, we aim for the pure, minimal',
  'essence of the space.',
  '',
  '[ AUDIO ENGINE ]',
  'Hypnotic and futuristic techno, heavily influenced by the raw textures',
  'of early futurism.',
  '',
  '[ OBJECTIVE ]',
  'TERMINAL does not build stages for mere spectators. Our objective is total',
  'synchronization — where every logged-in entity becomes an active node,',
  'participating in the system\'s calculation to explore uncharted',
  'trajectories together.',
  '',
  'TERMINAL ARCHITECT : STANN LUMO',
];

const SYSTEM_INFO = [
  { key: 'PLATFORM_ID',    val: 'TERMINAL-SYS' },
  { key: 'BUILD',          val: '2.2.0-HELIOPAUSE' },
  { key: 'LOCATION',       val: 'FAUST / SEOUL-KR' },
  { key: 'FOUNDED',        val: '2025 // CYCLE 1' },
  { key: 'UPTIME',         val: 'SYSTEM INITIALIZING...' },
  { key: 'EVENTS_RUN',     val: '01 SESSION ARCHIVED' },
  { key: 'SIGNAL_REACH',   val: 'HELIOPAUSE OUTSKIRTS' },
  { key: 'STATUS',         val: 'WARP DRIVE ENGAGED' },
];

export default function AboutPage() {
  const { lang } = useLang();
  const manifesto = lang === 'ko' ? manifestoKo : MANIFESTO;

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/about" title="ABOUT.SYS" accent="primary" variants={itemVariants} />

        {/* Manifesto */}
        <motion.div variants={itemVariants} className="mb-6">
          <TerminalPanel title="MANIFESTO_v1.txt" accent="green">
            <div className="space-y-1">
              {manifesto.map((line, i) => (
                <div key={i} className="text-xs leading-6">
                  {line === '' ? (
                    <span>&nbsp;</span>
                  ) : (
                    <BodyText
                      text={line}
                      delay={i * 50}
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
          <TerminalPanel title="SYSINFO.DAT" accent="secondary">
            <div className="space-y-2">
              {SYSTEM_INFO.map((item, i) => (
                <div key={item.key} className="flex items-start gap-2 sm:gap-3 text-xs font-mono">
                  <span className="w-24 sm:w-36 shrink-0 text-terminal-subdued">
                    <LabelText text={item.key} delay={i * 30} />
                  </span>
                  <span className="text-terminal-muted">:</span>
                  <SubtitleText
                    text={item.val}
                    delay={i * 30}
                    className={item.key === 'STATUS' ? 'text-terminal-accent-primary' : 'text-terminal-accent-secondary'}
                  />
                </div>
              ))}
            </div>
          </TerminalPanel>
        </motion.div>
    </PageLayout>
  );
}
