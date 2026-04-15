'use client';
import TerminalPanel from '@/components/TerminalPanel';
import AnimatedHeight from '@/components/ui/AnimatedHeight';
import CountdownBlock from '@/components/ui/CountdownBlock';
import { LabelText, SubtitleText, MetaText } from '@/components/ui/TerminalText';
import { useLang } from '@/lib/langContext';
import { gateKo, homeKo } from '@/lib/i18n';
import type { TerminalEvent } from '@/lib/eventData';

interface Props {
  event: TerminalEvent;
  showCountdown?: boolean;
}

export default function EventDetail({ event, showCountdown = false }: Props) {
  const { lang } = useLang();
  const eventDate = new Date(`${event.date}T${event.time.replace(' KST', '')}:00+09:00`);

  const eventDateLabel = new Date(event.date)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase();

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
        <div className="mb-4 border py-6 px-4 border-terminal-accent-primary/20 bg-terminal-bg-panel">
          <CountdownBlock targetDate={eventDate} accent="primary" />
        </div>
      </AnimatedHeight>

      {event.status === 'ARCHIVED' && (
        <div className="px-3 py-2 border tracking-widest font-mono border-terminal-accent-alert/30 text-terminal-accent-alert bg-terminal-accent-alert/5">
          <LabelText text={lang === 'ko'
            ? gateKo.sessionArchived(event.date.replace(/-/g, '.'))
            : `◼ SESSION ARCHIVED — ${event.date.replace(/-/g, '.')}`} />
        </div>
      )}

      <TerminalPanel title="LOCATION_DATA.enc" accent="primary">
        <div className="space-y-3">
          {event.status === 'UPCOMING' && (
            <div className="font-mono text-terminal-subdued">
              <SubtitleText
                autoHeight
                text={lang === 'ko' ? gateKo.locationWarning : '⚠ DETAILED LOCATION & GATE INFORMATION FOR THE SESSION.'}
                className="text-terminal-accent-primary font-mono"
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {locationFields.map((item, i) => (
              <div key={item.k}>
                <div className="mb-0.5 font-mono text-terminal-subdued">
                  <LabelText text={item.k} delay={i * 30} />
                </div>
                <div className="font-mono text-terminal-accent-primary">
                  <SubtitleText autoHeight text={item.v} delay={i * 30} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
}
