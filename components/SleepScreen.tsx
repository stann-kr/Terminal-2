'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScramble } from 'use-scramble';
import TerminalButton from '@/components/TerminalButton';

interface SleepScreenProps {
  onWake: () => void;
}

interface StatusItem {
  type: 'text' | 'progress';
  label: string;
  value?: string;
  accent?: boolean;
  warn?: boolean;
  cyan?: boolean;
  delay?: number;
}

const SYSTEM_STATUS: StatusItem[] = [
  { type: 'text', label: 'SYSTEM STATE', value: 'SUSPENDED', warn: true },
  { type: 'progress', label: 'SIGNAL STRENGTH', delay: 500 },
  { type: 'progress', label: 'DSP ENGINE LOAD', delay: 800 },
  { type: 'text', label: 'NETWORK STATUS', value: 'STABLE / ENCRYPTED', cyan: true },
  { type: 'text', label: 'LAST ACCESS', value: '', delay: 1200 },
];

function StatusLine({ label, value, accent, warn, cyan }: Partial<StatusItem>) {
  const { ref } = useScramble({
    text: value ? `${label}: ${value}` : label || '',
    speed: 0.5,
    scramble: 5,
    step: 1,
    playOnMount: true,
  });

  let colorClass = 'text-terminal-muted/60';
  if (accent) colorClass = 'text-terminal-accent-primary drop-shadow-[0_0_8px_rgb(var(--color-accent-primary)/0.6)]';
  else if (cyan) colorClass = 'text-terminal-accent-secondary/80';
  else if (warn) colorClass = 'text-terminal-accent-warn/80';

  return (
    <div ref={ref} className={`text-[10px] md:text-xs tracking-widest font-mono ${colorClass}`} />
  );
}

function ProgressLine({ label }: { label: string }) {
  const [pct, setPct] = useState(0);
  const BARS = 15;

  useEffect(() => {
    // 슬립 모드이므로 천천히 변동하는 느낌
    const interval = setInterval(() => {
      setPct(prev => {
        const next = prev + (Math.random() > 0.5 ? 1 : -1);
        return Math.max(70, Math.min(98, next)); // 70~98% 사이 유지
      });
    }, 2000);
    setPct(Math.floor(Math.random() * 20) + 75);
    return () => clearInterval(interval);
  }, []);

  const filled = Math.round((pct / 100) * BARS);
  const empty = BARS - filled;

  return (
    <div className="text-[10px] md:text-xs tracking-widest font-mono text-terminal-muted/50 flex items-center gap-2">
      <span>{label}</span>
      <span className="text-terminal-accent-primary/40">{'█'.repeat(filled)}</span>
      <span className="text-terminal-muted/10">{'░'.repeat(empty)}</span>
      <span className="text-terminal-muted/40">{pct}%</span>
    </div>
  );
}

export default function SleepScreen({ onWake }: SleepScreenProps) {
  const [waking, setWaking] = useState(false);
  const [time, setTime] = useState('');
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [lastAccess, setLastAccess] = useState('');
  const wakeTriggered = useRef(false);
  const wakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLastAccess(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const update = () => {
      const n = new Date();
      setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const timers = SYSTEM_STATUS.map((item, i) => 
      setTimeout(() => setVisibleItems(prev => [...prev, i]), item.delay || (i * 200))
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const wake = useCallback(() => {
    if (wakeTriggered.current) return;
    wakeTriggered.current = true;
    setWaking(true);
    wakeTimerRef.current = setTimeout(onWake, 1500);
  }, [onWake]);

  useEffect(() => {
    return () => {
      if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKey = () => wake();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [wake]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-center items-center px-4 sm:px-6 select-none bg-terminal-bg-base font-mono overflow-hidden"
      initial={{ opacity: 0 }}
      animate={waking ? { opacity: 0, filter: 'brightness(3) blur(12px)' } : { opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      exit={{ opacity: 0 }}
    >
      {/* Scanline Effect - 부트 시퀀스보다 어둡게 */}
      <div className="pointer-events-none absolute inset-0 z-20 opacity-20" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
      }} />

      <div className="relative z-10 w-full sm:w-[700px] md:w-[800px] flex flex-col items-center">
        {/* Clock - 메인 시각 요소 */}
        <motion.div 
          className="text-5xl sm:text-6xl md:text-8xl font-bold mb-12 tracking-[0.15em] text-terminal-accent-primary/80 drop-shadow-[0_0_30px_rgb(var(--color-accent-primary)/0.3)]"
          suppressHydrationWarning
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          {time}
        </motion.div>

        {/* System Status Grid - 부트 시퀀스 스타일 */}
        <div className="w-full space-y-3 mb-12 border-l border-terminal-accent-primary/20 pl-6 py-2">
          {SYSTEM_STATUS.map((item, i) => (
            <AnimatePresence key={i}>
              {visibleItems.includes(i) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.type === 'progress' ? (
                    <ProgressLine label={item.label} />
                  ) : (
                    <StatusLine
                      {...item}
                      value={item.label === 'LAST ACCESS' ? (lastAccess || '---') : item.value}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          ))}
          
          {/* 하단 점멸 커서 */}
          {!waking && (
            <motion.div 
              animate={{ opacity: [0, 1, 0] }} 
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-4 bg-terminal-accent-primary/40 mt-2"
            />
          )}
        </div>

        {/* Action Area */}
        <div className="h-16 flex items-center justify-center">
          {!waking ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <TerminalButton onClick={wake} variant="primary" className="px-10 py-2 text-sm">
                [ RESUME SESSION ]
              </TerminalButton>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs tracking-[0.3em] text-terminal-accent-primary animate-pulse">
                RESTORING CORE MODULES...
              </div>
              <div className="w-48 h-[1px] bg-terminal-accent-primary/20 relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-terminal-accent-primary"
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ambient background noise/particles could be added here if needed */}
    </motion.div>
  );
}
