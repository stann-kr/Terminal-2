'use client';
import React, { useState } from 'react';
import type { Artist } from '@/lib/eventData';
import { LabelText, MetaText, BodyText } from '@/components/ui/TerminalText';
import { useLang } from '@/lib/langContext';
import { lineupKo } from '@/lib/i18n';
import AnimatedHeight from '@/components/ui/AnimatedHeight';

const statusClassMap: Record<string, string> = {
  CONFIRMED: 'text-terminal-accent-primary',
  CLASSIFIED: 'text-terminal-accent-alert',
  PENDING: 'text-terminal-accent-warn',
};

const statusGlowMap: Record<string, string> = {
  CLASSIFIED: 'drop-shadow-[0_0_8px_rgb(var(--color-accent-alert)/0.4)]',
};

interface Props { artist: Artist; }

export default function ArtistRow({ artist: a }: Props) {
  const { lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);

  const statusColorClass = statusClassMap[a.status] || 'text-terminal-accent-primary';
  const nameColorClass = a.name === '[ ENCRYPTED ]' ? 'text-terminal-accent-alert' : 'text-terminal-primary';
  const nameGlowClass = a.name === '[ ENCRYPTED ]' ? statusGlowMap['CLASSIFIED'] : '';

  const hasDescription = !!a.description;
  
  const currentDesc = (hasDescription && typeof a.description === 'object' && !Array.isArray(a.description))
    ? (lang === 'ko' ? a.description.ko : a.description.en)
    : (a.description || '');
  
  const descLines: string[] = Array.isArray(currentDesc) ? currentDesc : (typeof currentDesc === 'string' && currentDesc ? currentDesc.split('\n') : []);

  const handleToggle = () => {
    if (hasDescription) {
      setIsOpen(!isOpen);
    }
  };

  const borderClass = isOpen 
    ? 'border-terminal-accent-primary/40 bg-terminal-accent-primary/[0.04]' 
    : 'border-terminal-accent-primary/20 bg-terminal-bg-panel';
  const hoverClass = hasDescription 
    ? 'group-hover:border-terminal-accent-primary/40 group-hover:bg-terminal-accent-primary/[0.04] cursor-pointer' 
    : '';

  return (
    <div className="group flex flex-col gap-1">
      {/* Row Toggle Area */}
      <div
        onClick={handleToggle}
        role={hasDescription ? 'button' : undefined}
        aria-expanded={hasDescription ? isOpen : undefined}
        tabIndex={hasDescription ? 0 : undefined}
        onKeyDown={hasDescription ? (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        } : undefined}
      >
        {/* Mobile */}
        <div className={`md:hidden px-4 py-4 border transition-all duration-200 space-y-2 ${borderClass} ${hoverClass}`}>
          <div className="flex items-start justify-between gap-2">
            <span className={`font-bold tracking-wider leading-tight font-mono ${nameColorClass} ${nameGlowClass}`}>
              <LabelText text={a.name} />
            </span>
            <span className={`font-bold tracking-wider whitespace-nowrap shrink-0 font-mono ${statusColorClass}`}>
              <span className="status-pulse mr-1">●</span>
              <LabelText text={a.status} className="inline" />
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono">
            <span className="text-terminal-muted"><MetaText text={a.id} /></span>
            <span className="text-terminal-subdued"><MetaText text={a.origin} /></span>
            <span className="text-terminal-accent-warn"><MetaText text={a.time} /></span>
          </div>
          <div className="flex items-center justify-between text-terminal-subdued font-mono">
            <MetaText text={lang === 'ko' ? lineupKo.dock(a.dock) : `DOCK ${a.dock}`} />
            {hasDescription && (
              <span className="text-terminal-accent-primary/50">{isOpen ? '[-]' : '[+]'}</span>
            )}
          </div>
        </div>

        {/* Desktop */}
        <div className={`hidden md:grid grid-cols-12 gap-2 px-4 py-4 border transition-all duration-200 ${borderClass} ${hoverClass} items-center`}>
          <span className="col-span-1 font-mono text-terminal-muted"><MetaText text={a.id} /></span>
          <span className={`col-span-3 font-bold tracking-wider font-mono ${nameColorClass} ${nameGlowClass}`}>
            <LabelText text={a.name} />
          </span>
          <span className="col-span-1 font-mono text-terminal-subdued"><MetaText text={a.origin} /></span>
          <span className="col-span-3 font-mono text-terminal-subdued"><MetaText text={lang === 'ko' ? lineupKo.dock(a.dock) : `DOCK ${a.dock}`} /></span>
          <span className="col-span-2 font-mono text-terminal-accent-warn"><MetaText text={a.time} /></span>
          <span className={`col-span-2 font-bold tracking-wider font-mono flex items-center justify-between ${statusColorClass}`}>
            <span className="flex items-center">
              <span className="status-pulse mr-1">●</span>
              <LabelText text={a.status} className="inline" />
            </span>
            {hasDescription && (
              <span className="text-terminal-accent-primary/50 ml-2">{isOpen ? '[-]' : '[+]'}</span>
            )}
          </span>
        </div>
      </div>

      {/* Accordion Content */}
      {hasDescription && (
        <AnimatedHeight show={isOpen}>
          <div className="px-4 py-5 border border-terminal-accent-primary/20 bg-terminal-bg-panel/50">
            {isOpen && (
              <div className="font-mono text-terminal-muted leading-relaxed space-y-0.5">
                {descLines.map((line, i) => (
                  <div key={i} className="min-h-[1.25rem]">
                    {line.trim() === '' ? (
                      <span>&nbsp;</span>
                    ) : (
                      <BodyText autoHeight text={line} delay={i * 30} className="text-terminal-muted" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedHeight>
      )}
    </div>
  );
}
