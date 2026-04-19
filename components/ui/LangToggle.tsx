'use client';
import { useLang, type Lang } from '@/lib/langContext';

interface LangToggleProps {
  className?: string;
}

export default function LangToggle({ className = '' }: LangToggleProps) {
  const { lang, setLang } = useLang();

  const btn = (target: Lang, label: string) => {
    const active = lang === target;
    return (
      <button
        onClick={() => setLang(target)}
        className={`px-1.5 py-0.5 border font-mono text-micro sm:text-small tracking-widest transition-colors cursor-pointer ${
          active
            ? 'border-terminal-accent-primary/60 text-terminal-accent-primary bg-terminal-accent-primary/10'
            : 'border-terminal-muted/20 text-terminal-muted/40 hover:text-terminal-muted/60 hover:border-terminal-muted/40'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <span className={`inline-flex items-center gap-0 ${className}`}>
      {btn('ko', 'KO')}
      <span className="text-terminal-muted/20 font-mono text-micro sm:text-small px-0.5">/</span>
      {btn('en', 'EN')}
    </span>
  );
}
