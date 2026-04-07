'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type AppState = 'idle' | 'booting' | 'sleeping' | 'active';

interface BootCtx {
  appState: AppState;
  setAppState: (s: AppState) => void;
}

const BootContext = createContext<BootCtx>({ appState: 'idle', setAppState: () => {} });

export function BootProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>('idle');
  return (
    <BootContext.Provider value={{ appState, setAppState }}>
      {children}
    </BootContext.Provider>
  );
}

export const useBootState = () => useContext(BootContext);
