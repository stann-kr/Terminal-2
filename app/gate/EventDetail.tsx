'use client';
import TerminalPanel from '@/components/TerminalPanel';
import AnimatedHeight from '@/components/ui/AnimatedHeight';
import CountdownBlock from '@/components/ui/CountdownBlock';
import { LabelText, SubtitleText, MetaText } from '@/components/ui/TerminalText';
import type { TerminalEvent } from '@/lib/eventData';

interface Props {
  event: TerminalEvent;
  showCountdown?: boolean;
}

export default function EventDetail({ event, showCountdown = false }: Props) {
  const eventDate = new Date(`${event.date}T${event.time.replace(' KST', '')}:00`);

  const locationFields = [
    { k: 'GATE_ID',     v: event.venue },
    { k: 'DISTRICT',    v: event.district },
    { k: 'COORDINATES', v: event.coords },
    { k: 'CAPACITY',    v: event.capacity },
    { k: 'SOUND_SYS',   v: event.sound },
  ];

  return (
    <div className="space-y-4">
      <AnimatedHeight show={showCountdown}>
        <TerminalPanel title="MISSION_CLOCK" accent="cyan">
          <div className="text-center mb-4">
            <div className="text-xs tracking-widest mb-1 font-mono text-terminal-muted">
              <MetaText text={`${event.date.replace(/-/g, '.')} · ${event.time}`} />
            </div>
          </div>
          <CountdownBlock targetDate={eventDate} accent="cyan" />
        </TerminalPanel>
      </AnimatedHeight>

      {event.status === 'ARCHIVED' && (
        <div className="px-3 py-2 border text-xs tracking-widest font-mono border-terminal-accent-hot/30 text-terminal-accent-hot bg-terminal-accent-hot/5">
          <LabelText text={`◼ SESSION ARCHIVED — ${event.date.replace(/-/g, '.')}`} />
        </div>
      )}

      <TerminalPanel title="LOCATION_DATA.enc" accent="amber">
        <div className="space-y-3">
          {event.status === 'UPCOMING' && (
            <div className="text-xs font-mono text-terminal-subdued">
              <SubtitleText
                text="⚠ EXACT GATE DISCLOSED TO AUTHORIZED PERSONNEL ONLY."
                className="text-terminal-accent-amber font-mono text-[10px] sm:text-xs"
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {locationFields.map((item, i) => (
              <div key={item.k}>
                <div className="text-xs mb-0.5 font-mono text-terminal-subdued">
                  <LabelText text={item.k} delay={i * 30} />
                </div>
                <div className="text-xs font-bold font-mono text-terminal-accent-amber">
                  <SubtitleText text={item.v} delay={i * 30} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
}
