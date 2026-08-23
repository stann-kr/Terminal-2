'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { hasVisited, markVisited } from './_entry/visitState';
import BootSequence from './_entry/BootSequence';
import SleepScreen from './_entry/SleepScreen';

type Phase = 'boot' | 'sleep' | 'done';

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
    <main id="main-content" tabIndex={-1}>
      <h1 className="sr-only">TERMINAL</h1>
      <AnimatePresence mode="wait">
        {phase === 'boot' && <BootSequence key="boot" onComplete={handleBootComplete} />}
        {phase === 'sleep' && <SleepScreen key="sleep" onWake={handleWake} />}
      </AnimatePresence>
    </main>
  );
}
