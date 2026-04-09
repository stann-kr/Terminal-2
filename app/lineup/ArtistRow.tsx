'use client';
import type { Artist } from '@/lib/eventData';
import DecodeText from '@/components/DecodeText';

const statusClassMap: Record<string, string> = {
  CONFIRMED: 'text-terminal-accent-amber',
  CLASSIFIED: 'text-terminal-accent-hot',
  PENDING: 'text-terminal-accent-gold',
};

const statusGlowMap: Record<string, string> = {
  CLASSIFIED: 'drop-shadow-[0_0_8px_rgba(200,80,32,0.4)]',
};

interface Props { artist: Artist; }

export default function ArtistRow({ artist: a }: Props) {
  const statusColorClass = statusClassMap[a.status] || 'text-terminal-accent-amber';
  const nameColorClass = a.name === '[REDACTED]' ? 'text-terminal-accent-hot' : 'text-terminal-primary';
  const nameGlowClass = a.name === '[REDACTED]' ? statusGlowMap['CLASSIFIED'] : '';

  return (
    <div className="group">
      {/* Mobile */}
      <div
        className="md:hidden px-4 py-4 border cursor-pointer transition-all duration-200 space-y-2 border-terminal-accent-amber/20 bg-terminal-bg-panel group-hover:border-terminal-accent-amber/40 group-hover:bg-terminal-accent-amber/[0.04]"
      >
        <div className="flex items-start justify-between gap-2">
          <span className={`text-sm font-bold tracking-wider leading-tight font-mono ${nameColorClass} ${nameGlowClass}`}>
            <DecodeText text={a.name} speed={0.6} scramble={4} />
          </span>
          <span className={`text-xs font-bold tracking-wider whitespace-nowrap shrink-0 font-mono ${statusColorClass}`}>
            <span className="status-pulse mr-1">●</span><DecodeText text={a.status} speed={0.6} scramble={4} className="inline" />
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono">
          <span className="text-terminal-muted"><DecodeText text={a.id} speed={0.4} scramble={2} /></span>
          <span className="text-terminal-subdued"><DecodeText text={a.origin} speed={0.5} scramble={3} /></span>
          <span className="text-terminal-accent-gold"><DecodeText text={a.time} speed={0.5} scramble={3} /></span>
        </div>
        <div className="text-xs text-terminal-subdued font-mono"><DecodeText text={a.genre} speed={0.5} scramble={3} /></div>
      </div>

      {/* Desktop */}
      <div
        className="hidden md:grid grid-cols-12 gap-2 px-4 py-4 border cursor-pointer transition-all duration-200 border-terminal-accent-amber/20 bg-terminal-bg-panel group-hover:border-terminal-accent-amber/40 group-hover:bg-terminal-accent-amber/[0.04]"
      >
        <span className="col-span-1 text-xs text-terminal-muted font-mono"><DecodeText text={a.id} speed={0.4} scramble={2} /></span>
        <span className={`col-span-3 text-sm font-bold tracking-wider font-mono ${nameColorClass} ${nameGlowClass}`}>
          <DecodeText text={a.name} speed={0.6} scramble={4} />
        </span>
        <span className="col-span-1 text-xs text-terminal-subdued font-mono"><DecodeText text={a.origin} speed={0.5} scramble={3} /></span>
        <span className="col-span-3 text-xs text-terminal-subdued font-mono"><DecodeText text={a.genre} speed={0.5} scramble={3} /></span>
        <span className="col-span-2 text-xs text-terminal-accent-gold font-mono"><DecodeText text={a.time} speed={0.5} scramble={3} /></span>
        <span className={`col-span-2 text-xs font-bold tracking-wider font-mono ${statusColorClass}`}>
          <span className="status-pulse mr-1">●</span><DecodeText text={a.status} speed={0.6} scramble={4} className="inline" />
        </span>
      </div>
    </div>
  );
}