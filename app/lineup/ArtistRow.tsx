'use client';
import type { Artist } from '@/lib/eventData';

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: '#d4920a',
  CLASSIFIED: '#c85020',
  PENDING: '#c8a030',
};

interface Props { artist: Artist; }

export default function ArtistRow({ artist: a }: Props) {
  const color = STATUS_COLOR[a.status] ?? '#d4920a';

  const hoverEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,160,48,0.4)';
    (e.currentTarget as HTMLElement).style.background = 'rgba(200,160,48,0.04)';
  };
  const hoverLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,160,48,0.12)';
    (e.currentTarget as HTMLElement).style.background = 'rgba(18,14,8,0.95)';
  };

  return (
    <>
      {/* Mobile */}
      <div
        className="md:hidden px-4 py-4 border cursor-pointer transition-all duration-200 space-y-2"
        style={{ borderColor: 'rgba(200,160,48,0.12)', background: 'rgba(18,14,8,0.95)' }}
        onMouseEnter={hoverEnter}
        onMouseLeave={hoverLeave}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-bold tracking-wider leading-tight" style={{
            color: a.name === '[REDACTED]' ? '#c85020' : '#e8d890',
            fontFamily: 'var(--font-mono)',
            textShadow: a.name === '[REDACTED]' ? '0 0 8px rgba(200,80,32,0.4)' : 'none',
          }}>{a.name}</span>
          <span className="text-xs font-bold tracking-wider whitespace-nowrap shrink-0" style={{ color, fontFamily: 'var(--font-mono)' }}>
            <span className="status-pulse mr-1">●</span>{a.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#4a3818' }}>{a.id}</span>
          <span style={{ color: '#6a5030' }}>{a.origin}</span>
          <span style={{ color: '#c8a030' }}>{a.time}</span>
        </div>
        <div className="text-xs" style={{ color: '#6a5030', fontFamily: 'var(--font-mono)' }}>{a.genre}</div>
      </div>

      {/* Desktop */}
      <div
        className="hidden md:grid grid-cols-12 gap-2 px-4 py-4 border cursor-pointer transition-all duration-200"
        style={{ borderColor: 'rgba(200,160,48,0.12)', background: 'rgba(18,14,8,0.95)' }}
        onMouseEnter={hoverEnter}
        onMouseLeave={hoverLeave}
      >
        <span className="col-span-1 text-xs" style={{ color: '#4a3818', fontFamily: 'var(--font-mono)' }}>{a.id}</span>
        <span className="col-span-3 text-sm font-bold tracking-wider" style={{
          color: a.name === '[REDACTED]' ? '#c85020' : '#e8d890',
          fontFamily: 'var(--font-mono)',
          textShadow: a.name === '[REDACTED]' ? '0 0 8px rgba(200,80,32,0.4)' : 'none',
        }}>{a.name}</span>
        <span className="col-span-1 text-xs" style={{ color: '#6a5030', fontFamily: 'var(--font-mono)' }}>{a.origin}</span>
        <span className="col-span-3 text-xs" style={{ color: '#6a5030', fontFamily: 'var(--font-mono)' }}>{a.genre}</span>
        <span className="col-span-2 text-xs" style={{ color: '#c8a030', fontFamily: 'var(--font-mono)' }}>{a.time}</span>
        <span className="col-span-2 text-xs font-bold tracking-wider" style={{ color, fontFamily: 'var(--font-mono)' }}>
          <span className="status-pulse mr-1">●</span>{a.status}
        </span>
      </div>
    </>
  );
}