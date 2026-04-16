'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { hasVisited, markVisited } from '@/lib/visitState';
import BootSequence from '@/components/BootSequence';
import SleepScreen from '@/components/SleepScreen';

type Phase = 'loading' | 'boot' | 'sleep' | 'done';

export default function EntryController() {
  const [phase, setPhase] = useState<Phase>('loading');
  const router = useRouter();

  useEffect(() => {
    const visited = hasVisited();
    setPhase(visited ? 'sleep' : 'boot');
  }, []);

  const handleBootComplete = () => {
    markVisited();
    setPhase('done');
    router.push('/home');
  };

  const handleWake = () => {
    setPhase('done');
    router.push('/home');
  };

  if (phase === 'loading') {
    return <div className="fixed inset-0 bg-terminal-bg-base" />;
  }

  return (
    <AnimatePresence mode="wait">
      {phase === 'boot' && <BootSequence key="boot" onComplete={handleBootComplete} />}
      {phase === 'sleep' && <SleepScreen key="sleep" onWake={handleWake} />}
    </AnimatePresence>
  );
}
