'use client';
import { motion } from 'framer-motion';
import TerminalPanel from '@/components/TerminalPanel';
import PageLayout, { itemVariants } from '@/components/PageLayout';
import { BodyText, LabelText, SubtitleText } from '@/components/ui/TerminalText';
import ReturnLink from '@/components/ui/ReturnLink';
import PageHeader from '@/components/ui/PageHeader';
import { useT } from '@/lib/langContext';

const SYSTEM_INFO = [
  { key: 'PLATFORM_ID',  val: 'TERMINAL' },
  { key: 'SURFACE',      val: 'STANN OS LIVE' },
  { key: 'LOCATION',     val: 'SEOUL-KR' },
  { key: 'MODE',         val: 'EVENT DISCOVERY / ACCESS' },
  { key: 'DATA_SOURCE',  val: 'EVENT REGISTRY' },
  { key: 'STATUS',       val: 'PUBLIC INTERFACE' },
];

export default function AboutPage() {
  const t = useT();

  return (
    <PageLayout>
      <ReturnLink variants={itemVariants} />
      <PageHeader path="/terminal/about" title="ABOUT.SYS" accent="primary" variants={itemVariants} />

        {/* Manifesto */}
        <motion.div variants={itemVariants} className="mb-6">
          <TerminalPanel title="MANIFESTO_v1.txt" accent="green">
            <div className="space-y-1">
              {t.manifesto.map((line, i) => (
                <div key={i}>
                  {line === '' ? (
                    <span className="block h-4">&nbsp;</span>
                  ) : (
                    <BodyText
                      text={line}
                      delay={i * 50}
                      className={`block ${
                        line === 'TERMINAL' ||
                        line.startsWith('[ ') ||
                        line.startsWith('Terminal Architect')
                          ? 'text-terminal-primary'
                          : 'text-terminal-primary/75'
                      }`}
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
                <div key={item.key} className="flex items-start gap-2 sm:gap-3 font-mono">
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
