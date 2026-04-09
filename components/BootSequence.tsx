'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScramble } from 'use-scramble';
import TerminalButton from './TerminalButton';

const BOOT_LINES = [
  { text: 'TERMINAL BIOS v4.2.0  [2026-03-31]', delay: 0 },
  { text: 'MEMORY TEST: 0KB ... 524288KB OK', delay: 120 },
  { text: 'DETECTING HYPNOTIC SEQUENCER... FOUND [IRQ=9]', delay: 220 },
  { text: 'MOUNTING FRAME_DRAGGING.SYS... OK', delay: 340 },
  { text: 'LOADING ACID_MATRIX.DLL.............. OK', delay: 480 },
  { text: 'CONNECTING TO FAUST_SERVER: 192.168.0.XT... OK', delay: 620 },
  { text: 'INITIALIZING AUDIO SUBSYSTEM: 909-MODE ENABLED', delay: 800 },
  { text: 'SCANNING BASS FREQUENCIES: 20Hz–200Hz... LOCK', delay: 960 },
  { text: 'LOADING DARKROOM_PROTOCOL v7.7... OK', delay: 1120 },
  { text: 'CALIBRATING STROBE_TIMING.SYS... SYNC OK', delay: 1300 },
  { text: 'MOUNTING /dev/underground/....... OK', delay: 1480 },
  { text: 'AUTHENTICATING ACCESS CREDENTIALS... GRANTED', delay: 1700 },
  { text: 'WARNING: PSYCHEDELIC CONTENT DETECTED', delay: 1900, warn: true },
  { text: 'BYPASSING COGNITIVE_FILTER.EXE... OK', delay: 2050 },
  { text: 'SPAWNING TERMINAL PROCESS [PID:0x7F3A]... OK', delay: 2250 },
  { text: '──────────────────────────────────────────', delay: 2400 },
  { text: 'SYSTEM READY. WELCOME TO THE UNDERGROUND.', delay: 2600, accent: true },
];

interface BootLineProps {
  text: string;
  accent?: boolean;
  warn?: boolean;
}

/** 개별 부트 라인 — use-scramble로 decode 효과 */
function BootLine({ text, accent, warn }: BootLineProps) {
  const { ref } = useScramble({
    text,
    speed: 0.6,
    scramble: 6,
    step: 2,
    range: [48, 90], // 0-9, A-Z
    overdrive: false,
    playOnMount: true,
  });

  let colorClass = 'text-terminal-subdued font-normal';
  if (accent) colorClass = 'text-terminal-accent-amber drop-shadow-[0_0_8px_rgba(212,146,10,0.8)] font-bold';
  else if (warn) colorClass = 'text-terminal-accent-gold font-normal';

  return (
    <div
      ref={ref}
      className={`text-xs md:text-sm leading-6 font-mono whitespace-pre-wrap ${colorClass}`}
    />
  );
}

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [powering, setPowering] = useState(true);
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const t0 = setTimeout(() => setPowering(false), 700);
    return () => clearTimeout(t0);
  }, []);

  useEffect(() => {
    if (powering) return;
    const timers = BOOT_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines((prev) => [...prev, i]), line.delay)
    );
    const completeTimer = setTimeout(() => {
      setDone(true);
    }, 3200);
    return () => { timers.forEach(clearTimeout); clearTimeout(completeTimer); };
  }, [powering]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-center items-start px-8 md:px-16 overflow-hidden bg-black font-mono"
      animate={powering ? { scaleY: 0.001, filter: 'brightness(0)' } : { scaleY: 1, filter: 'brightness(1)' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      exit={{ opacity: 0, filter: 'brightness(3) blur(8px)', transition: { duration: 0.5 } }}
    >
      <div className="w-full max-w-3xl">
        {BOOT_LINES.map((line, i) =>
          visibleLines.includes(i) ? (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.05 }}
            >
              {line.warn && <span className="text-terminal-accent-warn text-xs font-mono">⚠ </span>}
              <BootLine
                text={line.accent ? `> ${line.text}` : line.text}
                accent={line.accent}
                warn={line.warn}
              />
            </motion.div>
          ) : null
        )}
        {!powering && visibleLines.length > 0 && !done && (
          <span className="cursor-blink text-xs text-terminal-accent-amber">█</span>
        )}
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <TerminalButton
              onClick={() => onCompleteRef.current()}
              variant="primary"
              className="px-6"
            >
              [ ENTER TERMINAL ]
            </TerminalButton>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
