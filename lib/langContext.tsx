'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getLang, setLang as storeLang, type Lang } from '@/lib/lang';
import { i18n } from '@/lib/i18n';

export type { Lang } from '@/lib/lang';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangCtx>({ lang: 'ko', setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedLang = getLang();
      setLangState(storedLang);
      document.documentElement.lang = storedLang;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    storeLang(l);
    document.documentElement.lang = l;
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

export function useT() {
  const { lang } = useLang();
  return i18n[lang];
}
