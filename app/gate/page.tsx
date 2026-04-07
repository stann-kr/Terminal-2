'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import DecodeText from '@/components/DecodeText';
import EventDetail from './EventDetail';
import { EVENTS, UPCOMING_EVENT, ARCHIVED_EVENTS } from '@/lib/eventData';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: {},
  visible: {},
};

export default function GatePage() {
  const [tab, setTab] = useState<'upcoming' | 'archive'>('upcoming');
  const [selectedArchive, setSelectedArchive] = useState(ARCHIVED_EVENTS[0]?.id ?? '');

  const selectedEvent = tab === 'upcoming'
    ? UPCOMING_EVENT
    : EVENTS.find(e => e.id === selectedArchive) ?? ARCHIVED_EVENTS[0];

  return (
    <PageLayout>
      <motion.div
        className="w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <Link href="/home" className="text-xs tracking-widest cursor-pointer inline-block px-3 py-1.5 border transition-colors whitespace-nowrap"
            style={{ borderColor: 'rgba(212,146,10,0.25)', color: '#6a5030', fontFamily: 'var(--font-mono)' }}>
            <DecodeText text="◀ RETURN /home" speed={0.8} scramble={4} />
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10' }}>
            <DecodeText text="/terminal/gate" speed={0.6} scramble={5} />
          </div>
          <DecodeText
            text="GATE.EXE"
            as="h1"
            speed={0.65}
            scramble={10}
            className="text-3xl font-bold"
            style={{ color: '#3a9880', textShadow: '0 0 16px rgba(58,152,128,0.4)', letterSpacing: '0.2em' }}
          />
        </motion.div>

        {/* Tab switcher */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="inline-flex p-1 gap-1" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,146,10,0.15)' }}>
            {(['upcoming', 'archive'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 text-xs tracking-widest cursor-pointer transition-all duration-200 whitespace-nowrap"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: tab === t ? 'rgba(212,146,10,0.15)' : 'transparent',
                  color: tab === t ? '#d4920a' : '#3a2a10',
                  border: tab === t ? '1px solid rgba(212,146,10,0.4)' : '1px solid transparent',
                }}
              >
                <DecodeText text={t === 'upcoming' ? '▶ UPCOMING' : '◼ ARCHIVE'} speed={0.6} scramble={5} />
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === 'upcoming' ? (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Event header */}
              <div className="border px-4 py-4" style={{ borderColor: 'rgba(58,152,128,0.3)', background: 'rgba(18,14,8,0.95)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10', fontFamily: 'var(--font-mono)' }}>
                      <DecodeText text={`${UPCOMING_EVENT.date.replace(/-/g, '.')} · ${UPCOMING_EVENT.time}`} speed={0.5} scramble={5} />
                    </div>
                    <DecodeText
                      text={UPCOMING_EVENT.session}
                      speed={0.6}
                      scramble={8}
                      className="text-xl font-bold"
                      style={{ color: '#3a9880', textShadow: '0 0 12px rgba(58,152,128,0.4)', letterSpacing: '0.15em' }}
                    />
                    <DecodeText
                      text={UPCOMING_EVENT.subtitle}
                      speed={0.4}
                      scramble={5}
                      className="text-xs mt-1"
                      style={{ color: '#6a5030', letterSpacing: '0.1em' }}
                    />
                  </div>
                  <div className="text-xs font-bold tracking-wider shrink-0" style={{ color: '#3a9880', fontFamily: 'var(--font-mono)' }}>
                    <span className="status-pulse mr-1">●</span><DecodeText text="UPCOMING" speed={0.5} scramble={4} style={{ display: 'inline' }} />
                  </div>
                </div>
              </div>

              <EventDetail event={UPCOMING_EVENT} showCountdown />

              <div className="text-center pt-2">
                <motion.button
                  className="cursor-pointer font-mono text-xs tracking-widest uppercase px-8 py-3 border transition-all duration-200 whitespace-nowrap"
                  style={{ color: '#c8a030', border: '1px solid rgba(200,160,48,0.5)', background: 'rgba(200,160,48,0.05)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,160,48,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(200,160,48,0.05)')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DecodeText text="▶ REQUEST ACCESS PASS" speed={0.6} scramble={6} />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="archive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Archive session list */}
              <div className="space-y-2">
                {ARCHIVED_EVENTS.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedArchive(ev.id)}
                    className="w-full text-left px-4 py-3 border cursor-pointer transition-all duration-200"
                    style={{
                      borderColor: selectedArchive === ev.id ? 'rgba(200,80,32,0.5)' : 'rgba(212,146,10,0.12)',
                      background: selectedArchive === ev.id ? 'rgba(200,80,32,0.07)' : 'rgba(18,14,8,0.95)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold tracking-wider" style={{ color: selectedArchive === ev.id ? '#c85020' : '#e8d890' }}>
                          <DecodeText text={ev.session} speed={0.5} scramble={5} />
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: '#6a5030' }}>
                          <DecodeText text={`${ev.subtitle} · ${ev.date.replace(/-/g, '.')}`} speed={0.4} scramble={4} />
                        </div>
                      </div>
                      <div className="text-xs tracking-wider shrink-0" style={{ color: '#3a2a10' }}>
                        <DecodeText text="◼ ARCHIVED" speed={0.5} scramble={4} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected archive detail */}
              {selectedEvent && (
                <motion.div
                  key={selectedEvent.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <EventDetail event={selectedEvent} showCountdown={false} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageLayout>
  );
}