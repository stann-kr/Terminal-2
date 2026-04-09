'use client';
import { motion } from 'framer-motion';
import TerminalPanel from '@/components/TerminalPanel';
import CountdownBlock from './CountdownBlock';
import DecodeText from '@/components/DecodeText';
import type { TerminalEvent } from '@/lib/eventData';

interface Props {
  event: TerminalEvent;
  showCountdown?: boolean;
}

export default function EventDetail({ event, showCountdown = false }: Props) {
  const eventDate = new Date(`${event.date}T23:00:00`);

  const locationFields = [
    { k: 'GATE_ID',     v: event.venue },
    { k: 'DISTRICT',    v: event.district },
    { k: 'COORDINATES', v: event.coords },
    { k: 'CAPACITY',    v: event.capacity },
    { k: 'SOUND_SYS',   v: event.sound },
  ];

  return (
    <div className="space-y-4">
      {showCountdown && (
        <TerminalPanel title="COUNTDOWN_ACTIVE" accent="cyan">
          <div className="text-center mb-4">
            <div className="text-xs tracking-widest mb-1 font-mono text-terminal-muted">
              <DecodeText text={`${event.date.replace(/-/g, '.')} · ${event.time}`} speed={0.5} scramble={5} />
            </div>
          </div>
          <CountdownBlock targetDate={eventDate} />
        </TerminalPanel>
      )}

      {event.status === 'ARCHIVED' && (
        <div className="px-3 py-2 border text-xs tracking-widest font-mono border-terminal-accent-hot/30 text-terminal-accent-hot bg-terminal-accent-hot/5">
          <DecodeText text={`◼ SESSION ARCHIVED — ${event.date.replace(/-/g, '.')}`} speed={0.6} scramble={6} />
        </div>
      )}

      <TerminalPanel title="LOCATION_DATA.enc" accent="amber">
        <div className="space-y-3">
          {event.status === 'UPCOMING' && (
            <div className="text-xs font-mono text-terminal-subdued">
              <DecodeText
                text="⚠ EXACT GATE DISCLOSED TO AUTHORIZED PERSONNEL ONLY."
                speed={0.5}
                scramble={6}
                className="text-terminal-accent-amber font-mono text-[10px] sm:text-xs"
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {locationFields.map((item, i) => (
              <div key={item.k}>
                <div className="text-xs mb-0.5 font-mono text-terminal-subdued">
                  <DecodeText text={item.k} speed={0.6} scramble={4} delay={i * 30} />
                </div>
                <div className="text-xs font-bold font-mono text-terminal-accent-amber">
                  <DecodeText text={item.v} speed={0.5} scramble={5} delay={i * 30} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
}