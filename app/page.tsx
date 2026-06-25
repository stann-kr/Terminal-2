'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { hasVisited, markVisited } from '@/lib/visitState';
import BootSequence from '@/components/BootSequence';
import SleepScreen from '@/components/SleepScreen';

type Phase = 'loading' | 'boot' | 'sleep' | 'done';

export default function EntryController() {
  const [phase, setPhase] = useState<Phase>(() => (hasVisited() ? 'sleep' : 'boot'));
  const router = useRouter();

  const handleBootComplete = () => {
    markVisited();
    setPhase('done');
    router.push('/home');
  };

  const handleWake = () => {
    setPhase('done');
    router.push('/home');
  };

  return (
    <AnimatePresence mode="wait">
      {phase === 'boot' && <BootSequence key="boot" onComplete={handleBootComplete} />}
      {phase === 'sleep' && <SleepScreen key="sleep" onWake={handleWake} />}
    </AnimatePresence>
  );
}
