'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScramble } from 'use-scramble';
import TerminalButton from './TerminalButton';
import { useLang, type Lang } from '@/lib/langContext';

interface TextItem { type: 'text'; text: string; delay: number; accent?: boolean; warn?: boolean; cyan?: boolean }
interface ProgressItem { type: 'progress'; label: string; delay: number }
type BootItem = TextItem | ProgressItem;

const PHASE_1: BootItem[] = [
  { type: 'text',     text: 'TERMINAL BIOS v2.2.0 [2026-05-08]',          delay: 0 },
  { type: 'text',     text: 'MEMORY TEST: 0KB ... 524288KB OK',             delay: 100 },
  { type: 'text',     text: 'DETECTING MASTER CLOCK... FOUND [IRQ=9]',      delay: 200 },
  { type: 'progress', label: 'LOADING CORE MODULES',                         delay: 350 },
  { type: 'text',     text: 'MOUNTING FRAME_DRAGGING.SYS......... OK',       delay: 1000 },
  { type: 'text',     text: 'LOADING DSP_CORE.DLL................. OK',       delay: 1100 },
  { type: 'text',     text: 'CONNECTING TO FAUST_SERVER........... OK',       delay: 1200 },
  { type: 'text',     text: 'INITIALIZING LOCALE MODULE........... OK',       delay: 1350 },
  { type: 'text',     text: 'LOCALE CONFIGURATION REQUIRED',                 delay: 1450, warn: true },
];

const LANG_SELECT_DELAY = 1600;

const getPhase3 = (lang: Lang): TextItem[] => [
  { type: 'text', text: `LANGUAGE SET : ${lang.toUpperCase()} ............... OK`, delay: 0,    cyan: true },
  { type: 'text', text: 'INITIALIZING KIRSCH AUDIO SUBSYSTEM.. OK',                 delay: 200 },
  { type: 'text', text: 'FILTERING ANALOG NOISE (SECTOR 01)... 100% PURGED',        delay: 500 },
  { type: 'text', text: 'CALIBRATING TRAJECTORY TO HELIOPAUSE. SYNC OK',            delay: 800 },
  { type: 'text', text: 'MOUNTING /dev/snd/pcmC0D0p........... OK',                 delay: 1000 },
  { type: 'text', text: 'AUTHENTICATING ACCESS CREDENTIALS.... GRANTED',            delay: 1200 },
  { type: 'text', text: 'WARNING: DEEP SPACE ENTRY APPROACHING',                    delay: 1400, warn: true },
  { type: 'text', text: 'SPAWNING TERMINAL PROCESS [PID:0x02]. OK',                 delay: 1600 },
  { type: 'text', text: '──────────────────────────────────────────',               delay: 1750 },
  { type: 'text', text: 'SYSTEM READY. AWAITING INPUT.',                            delay: 1950, accent: true },
];

const PHASE_3_DONE_DELAY = 2200;

interface BootLineProps {
  text: string;
  accent?: boolean;
  warn?: boolean;
  cyan?: boolean;
}

function BootLine({ text, accent, warn, cyan }: BootLineProps) {
  const { ref } = useScramble({
    text,
    speed: 0.6,
    scramble: 6,
    step: 2,
    range: [48, 90],
    overdrive: false,
    playOnMount: true,
  });

  let colorClass = 'text-terminal-subdued font-normal';
  if (accent) colorClass = 'text-terminal-accent-primary drop-shadow-[0_0_8px_rgb(var(--color-accent-primary)/0.8)] font-bold';
  else if (cyan) colorClass = 'text-terminal-accent-secondary font-normal';
  else if (warn) colorClass = 'text-terminal-accent-warn font-normal';

  return (
    <div
      ref={ref}
      className={`text-small md:text-body leading-6 font-mono whitespace-pre-wrap ${colorClass}`}
    />
  );
}

function ProgressLine({ label }: { label: string }) {
  const [pct, setPct] = useState(0);
  const DURATION = 600;
  const BARS = 20;

  useEffect(() => {
    let startTime: number | null = null;
    let rafId: number;

    const tick = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      setPct(Math.floor(progress * 100));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const filled = Math.round((pct / 100) * BARS);
  const empty = BARS - filled;

  return (
    <div className="text-small md:text-body leading-6 font-mono text-terminal-subdued">
      <span>{label} </span>
      <span className="text-terminal-accent-primary">{'█'.repeat(filled)}</span>
      <span className="text-terminal-muted/30">{'░'.repeat(empty)}</span>
      <span className="text-terminal-muted ml-2">{pct}%</span>
    </div>
  );
}

interface LangSelectPromptProps {
  onSelect: (lang: Lang) => void;
}

function LangSelectPrompt({ onSelect }: LangSelectPromptProps) {
  const [chosen, setChosen] = useState<Lang | null>(null);

  const handle = (lang: Lang) => {
    if (chosen) return;
    setChosen(lang);
    onSelect(lang);
  };

  const btn = (target: Lang, label: string) => {
    const active = chosen === target;
    const inactive = chosen !== null && chosen !== target;
    return (
      <button
        onClick={() => handle(target)}
        disabled={chosen !== null}
        className={`font-mono text-small md:text-body tracking-widest px-3 py-1 border transition-colors cursor-pointer disabled:cursor-default ${
          active
            ? 'border-terminal-accent-secondary text-terminal-accent-secondary bg-terminal-accent-secondary/10'
            : inactive
            ? 'border-terminal-muted/20 text-terminal-muted/20'
            : 'border-terminal-accent-secondary/50 text-terminal-accent-secondary/70 hover:border-terminal-accent-secondary hover:text-terminal-accent-secondary hover:bg-terminal-accent-secondary/5'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="mt-3 mb-1">
      <div className="text-small md:text-body font-mono text-terminal-accent-secondary/80 mb-2 tracking-wider">
        ▸ SELECT SYSTEM LANGUAGE :
      </div>
      <div className="flex items-center gap-3">
        {btn('ko', '[ KO ] 한국어')}
        {btn('en', '[ EN ] English')}
      </div>
    </div>
  );
}

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const { setLang } = useLang();
  const [visiblePhase1, setVisiblePhase1] = useState<number[]>([]);
  const [showLangSelect, setShowLangSelect] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Lang | null>(null);
  const [visiblePhase3, setVisiblePhase3] = useState<number[]>([]);
  const [powering, setPowering] = useState(true);
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const t = setTimeout(() => setPowering(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (powering) return;
    const timers = PHASE_1.map((item, i) =>
      setTimeout(() => setVisiblePhase1(prev => [...prev, i]), item.delay)
    );
    const langTimer = setTimeout(() => setShowLangSelect(true), LANG_SELECT_DELAY);
    return () => { timers.forEach(clearTimeout); clearTimeout(langTimer); };
  }, [powering]);

  useEffect(() => {
    if (!selectedLang) return;
    const phase3 = getPhase3(selectedLang);
    const timers = phase3.map((item, i) =>
      setTimeout(() => setVisiblePhase3(prev => [...prev, i]), item.delay)
    );
    const doneTimer = setTimeout(() => setDone(true), PHASE_3_DONE_DELAY);
    return () => { timers.forEach(clearTimeout); clearTimeout(doneTimer); };
  }, [selectedLang]);

  const handleLangSelect = (lang: Lang) => {
    setLang(lang);
    setSelectedLang(lang);
  };

  const phase3Items = selectedLang ? getPhase3(selectedLang) : [];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-center items-center px-4 sm:px-6 overflow-hidden bg-terminal-bg-base font-mono"
      animate={powering ? { scaleY: 0.001, filter: 'brightness(0)' } : { scaleY: 1, filter: 'brightness(1)' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      exit={{ opacity: 0, filter: 'brightness(3) blur(8px)', transition: { duration: 0.5 } }}
    >
      <div className="w-full sm:w-[700px] md:w-[800px]">
        {/* Phase 1 */}
        {PHASE_1.map((item, i) =>
          visiblePhase1.includes(i) ? (
            <motion.div key={`p1-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.05 }}>
              {item.type === 'progress' ? (
                <ProgressLine label={item.label} />
              ) : (
                <>
                  {item.warn && <span className="text-terminal-accent-warn text-small font-mono">⚠ </span>}
                  <BootLine text={item.text} accent={item.accent} warn={item.warn} />
                </>
              )}
            </motion.div>
          ) : null
        )}

        {/* Phase 2: 언어 선택 프롬프트 */}
        {showLangSelect && !selectedLang && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <LangSelectPrompt onSelect={handleLangSelect} />
          </motion.div>
        )}

        {/* Phase 3 */}
        {phase3Items.map((item, i) =>
          visiblePhase3.includes(i) ? (
            <motion.div key={`p3-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.05 }}>
              {item.warn && <span className="text-terminal-accent-warn text-small font-mono">⚠ </span>}
              <BootLine text={item.text} accent={item.accent} warn={item.warn} cyan={item.cyan} />
            </motion.div>
          ) : null
        )}

        {/* 커서 블링크 */}
        {!powering && !done && (
          <span className="cursor-blink text-small text-terminal-accent-primary">█</span>
        )}

        {/* ENTER TERMINAL 버튼 */}
        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <TerminalButton onClick={() => onCompleteRef.current()} variant="primary" className="px-6">
              [ ENTER TERMINAL ]
            </TerminalButton>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
