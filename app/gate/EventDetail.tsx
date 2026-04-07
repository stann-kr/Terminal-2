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
    { k: 'VENUE_ID',    v: event.venue },
    { k: 'DISTRICT',    v: event.district },
    { k: 'COORDINATES', v: event.coords },
    { k: 'CAPACITY',    v: event.capacity },
    { k: 'DRESS_CODE',  v: event.dressCode },
    { k: 'ENTRY_AGE',   v: event.ageRestriction },
    { k: 'SOUND_SYS',   v: event.sound },
  ];

  return (
    <div className="space-y-4">
      {showCountdown && (
        <TerminalPanel title="COUNTDOWN_ACTIVE" accent="cyan">
          <div className="text-center mb-4">
            <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10', fontFamily: 'var(--font-mono)' }}>
              <DecodeText text={`${event.date.replace(/-/g, '.')} · ${event.time}`} speed={0.5} scramble={5} />
            </div>
          </div>
          <CountdownBlock targetDate={eventDate} />
        </TerminalPanel>
      )}

      {event.status === 'ARCHIVED' && (
        <div className="px-3 py-2 border text-xs tracking-widest" style={{ borderColor: 'rgba(200,80,32,0.3)', color: '#c85020', fontFamily: 'var(--font-mono)', background: 'rgba(200,80,32,0.05)' }}>
          <DecodeText text={`◼ SESSION ARCHIVED — ${event.date.replace(/-/g, '.')}`} speed={0.6} scramble={6} />
        </div>
      )}

      <TerminalPanel title="LOCATION_DATA.enc" accent="amber">
        <div className="space-y-3">
          {event.status === 'UPCOMING' && (
            <div className="text-xs" style={{ color: '#6a5030', fontFamily: 'var(--font-mono)' }}>
              <DecodeText text="⚠ EXACT ADDRESS DISCLOSED 24H BEFORE EVENT TO CONFIRMED ATTENDEES" speed={0.4} scramble={4} />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {locationFields.map((item, i) => (
              <div key={item.k}>
                <div className="text-xs mb-0.5" style={{ color: '#6a5030', fontFamily: 'var(--font-mono)' }}>
                  <DecodeText text={item.k} speed={0.6} scramble={4} delay={i * 30} />
                </div>
                <div className="text-xs font-bold" style={{ color: '#c8a030', fontFamily: 'var(--font-mono)' }}>
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