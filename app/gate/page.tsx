'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import EventDetail from './EventDetail';
import { EVENTS, UPCOMING_EVENT, ARCHIVED_EVENTS } from '@/lib/eventData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25, filter: 'blur(10px) brightness(2)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px) brightness(1)', transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
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
            ◀ RETURN /home
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10' }}>/terminal/gate</div>
          <h1 className="text-3xl font-bold tracking-[0.2em]" style={{ color: '#3a9880', textShadow: '0 0 16px rgba(58,152,128,0.4)', fontFamily: 'var(--font-mono)' }}>
            GATE.EXE
          </h1>
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
                {t === 'upcoming' ? '▶ UPCOMING' : '◼ ARCHIVE'}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === 'upcoming' ? (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Event header */}
              <div className="border px-4 py-4" style={{ borderColor: 'rgba(58,152,128,0.3)', background: 'rgba(18,14,8,0.95)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10', fontFamily: 'var(--font-mono)' }}>
                      {UPCOMING_EVENT.date.replace(/-/g, '.')} · {UPCOMING_EVENT.time}
                    </div>
                    <div className="text-xl font-bold tracking-[0.15em]" style={{ color: '#3a9880', fontFamily: 'var(--font-mono)', textShadow: '0 0 12px rgba(58,152,128,0.4)' }}>
                      {UPCOMING_EVENT.session}
                    </div>
                    <div className="text-xs mt-1 tracking-widest" style={{ color: '#6a5030', fontFamily: 'var(--font-mono)' }}>
                      {UPCOMING_EVENT.subtitle}
                    </div>
                  </div>
                  <div className="text-xs font-bold tracking-wider shrink-0" style={{ color: '#3a9880', fontFamily: 'var(--font-mono)' }}>
                    <span className="status-pulse mr-1">●</span>UPCOMING
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
                  ▶ REQUEST ACCESS PASS
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="archive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
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
                          {ev.session}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: '#6a5030' }}>
                          {ev.subtitle} · {ev.date.replace(/-/g, '.')}
                        </div>
                      </div>
                      <div className="text-xs tracking-wider shrink-0" style={{ color: '#3a2a10' }}>
                        ◼ ARCHIVED
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected archive detail */}
              {selectedEvent && (
                <motion.div
                  key={selectedEvent.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
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