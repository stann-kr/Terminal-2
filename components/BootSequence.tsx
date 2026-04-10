'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScramble } from 'use-scramble';
import TerminalButton from './TerminalButton';

const BOOT_LINES = [
  { text: 'TERMINAL BIOS v2.2.0 [2026-05-08]', delay: 0 },
  { text: 'MEMORY TEST: 0KB ... 524288KB OK', delay: 100 },
  { text: 'DETECTING MASTER CLOCK... FOUND [IRQ=9]', delay: 200 },
  { text: 'MOUNTING FRAME_DRAGGING.SYS... OK', delay: 300 },
  { text: 'LOADING DSP_CORE.DLL.............. OK', delay: 450 },
  { text: 'CONNECTING TO FAUST_SERVER: 126.99.37.53... OK', delay: 600 },
  { text: 'INITIALIZING KIRSCH AUDIO SUBSYSTEM: ENABLED', delay: 800 },
  { text: 'FILTERING ANALOG NOISE (SECTOR 01)... 100% PURGED', delay: 1000 },
  { text: 'CALIBRATING TRAJECTORY TO HELIOPAUSE... SYNC OK', delay: 1200 },
  { text: 'MOUNTING /dev/snd/pcmC0D0p....... OK', delay: 1400 },
  { text: 'AUTHENTICATING ACCESS CREDENTIALS... GRANTED', delay: 1650 },
  { text: 'WARNING: DEEP SPACE ENTRY APPROACHING', delay: 1850, warn: true },
  { text: 'SPAWNING TERMINAL PROCESS [PID:0x02]... OK', delay: 2050 },
  { text: '──────────────────────────────────────────', delay: 2200 },
  { text: 'SYSTEM READY. AWAITING INPUT.', delay: 2400, accent: true },
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
      className="fixed inset-0 z-50 flex flex-col justify-center items-center px-8 md:px-16 overflow-hidden bg-black font-mono"
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
