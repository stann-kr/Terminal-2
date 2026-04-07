'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import ArtistRow from './ArtistRow';
import { EVENTS, UPCOMING_EVENT } from '@/lib/eventData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -40, filter: 'blur(8px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function LineupPage() {
  const [selectedId, setSelectedId] = useState(UPCOMING_EVENT.id);
  const selectedEvent = EVENTS.find(e => e.id === selectedId) ?? UPCOMING_EVENT;

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
          <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10' }}>/terminal/lineup</div>
          <h1 className="text-3xl font-bold tracking-[0.2em]" style={{ color: '#c8a030', textShadow: '0 0 16px rgba(200,160,48,0.4)', fontFamily: 'var(--font-mono)' }}>
            LINEUP.DAT
          </h1>
        </motion.div>

        {/* Session selector */}
        <motion.div variants={itemVariants} className="mb-6 space-y-2">
          {EVENTS.map((ev) => {
            const isSelected = ev.id === selectedId;
            const isUpcoming = ev.status === 'UPCOMING';
            const accentColor = isUpcoming ? '#3a9880' : '#c85020';
            return (
              <button
                key={ev.id}
                onClick={() => setSelectedId(ev.id)}
                className="w-full text-left px-4 py-3 border cursor-pointer transition-all duration-200"
                style={{
                  borderColor: isSelected
                    ? `${accentColor}80`
                    : 'rgba(212,146,10,0.12)',
                  background: isSelected
                    ? `${accentColor}10`
                    : 'rgba(18,14,8,0.95)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-wider" style={{ color: isSelected ? (isUpcoming ? '#3a9880' : '#c85020') : '#e8d890' }}>
                        {ev.session}
                      </span>
                      {isUpcoming && (
                        <span className="text-xs px-1.5 py-0.5 tracking-widest" style={{ color: '#3a9880', border: '1px solid rgba(58,152,128,0.4)', background: 'rgba(58,152,128,0.08)' }}>
                          UPCOMING
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#6a5030' }}>
                      {ev.subtitle} · {ev.date.replace(/-/g, '.')}
                    </div>
                  </div>
                  <div className="text-xs shrink-0" style={{ color: '#3a2a10' }}>
                    {ev.artists.length} ACTS
                  </div>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Artist list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-3 px-4 py-2 border-b hidden md:block"
              style={{ borderColor: 'rgba(200,160,48,0.2)' }}>
              <div className="grid grid-cols-12 gap-2 text-xs tracking-widest"
                style={{ color: '#5a4820', fontFamily: 'var(--font-mono)' }}>
                <span className="col-span-1">ID</span>
                <span className="col-span-3">ARTIST</span>
                <span className="col-span-1">ORG</span>
                <span className="col-span-3">GENRE</span>
                <span className="col-span-2">TIMESLOT</span>
                <span className="col-span-2">STATUS</span>
              </div>
            </div>

            <div className="space-y-2">
              {selectedEvent.artists.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <ArtistRow artist={a} />
                </motion.div>
              ))}
            </div>

            <div className="mt-6 text-xs text-center" style={{ color: '#3a2a10', fontFamily: 'var(--font-mono)' }}>
              {selectedEvent.status === 'UPCOMING'
                ? '— MORE ACTS TBA — STAY TUNED TO TERMINAL —'
                : `— SESSION COMPLETE — ${selectedEvent.artists.length} ACTS TRANSMITTED —`}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </PageLayout>
  );
}