'use client';

import { useEffect, useState } from 'react';

interface NavigatorConnection extends EventTarget {
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NavigatorConnection;
}

export interface MotionPolicy {
  isReady: boolean;
  prefersReducedMotion: boolean;
  saveData: boolean;
  isDocumentVisible: boolean;
  allowMotion: boolean;
}

const SERVER_POLICY: MotionPolicy = {
  isReady: false,
  prefersReducedMotion: true,
  saveData: false,
  isDocumentVisible: true,
  allowMotion: false,
};

function readMotionPolicy(): MotionPolicy {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData);
  const isDocumentVisible = document.visibilityState !== 'hidden';

  return {
    isReady: true,
    prefersReducedMotion,
    saveData,
    isDocumentVisible,
    allowMotion: !prefersReducedMotion && !saveData && isDocumentVisible,
  };
}

/**
 * Non-essential motion is opt-in after mount and updates live when OS, data,
 * or document visibility preferences change.
 */
export function useMotionPolicy(): MotionPolicy {
  const [policy, setPolicy] = useState<MotionPolicy>(SERVER_POLICY);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as NavigatorWithConnection).connection;
    const update = () => setPolicy(readMotionPolicy());

    update();
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    connection?.addEventListener('change', update);

    return () => {
      media.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
      connection?.removeEventListener('change', update);
    };
  }, []);

  return policy;
}
