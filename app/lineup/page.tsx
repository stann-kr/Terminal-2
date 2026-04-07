'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import DecodeText from '@/components/DecodeText';
import ArtistRow from './ArtistRow';
import { EVENTS, UPCOMING_EVENT } from '@/lib/eventData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: {},
  visible: {},
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
            <DecodeText text="◀ RETURN /home" speed={0.8} scramble={4} />
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <div className="text-xs tracking-widest mb-1" style={{ color: '#3a2a10' }}>
            <DecodeText text="/terminal/lineup" speed={0.6} scramble={5} />
          </div>
          <DecodeText
            text="LINEUP.DAT"
            as="h1"
            speed={0.65}
            scramble={10}
            className="text-3xl font-bold tracking-[0.2em]"
            style={{ color: '#c8a030', textShadow: '0 0 16px rgba(200,160,48,0.4)', fontFamily: 'var(--font-mono)' }}
          />
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
                        <DecodeText text={ev.session} speed={0.6} scramble={4} />
                      </span>
                      {isUpcoming && (
                        <span className="text-xs px-1.5 py-0.5 tracking-widest" style={{ color: '#3a9880', border: '1px solid rgba(58,152,128,0.4)', background: 'rgba(58,152,128,0.08)' }}>
                          <DecodeText text="UPCOMING" speed={0.5} scramble={4} />
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#6a5030' }}>
                      <DecodeText text={`${ev.subtitle} · ${ev.date.replace(/-/g, '.')}`} speed={0.5} scramble={4} />
                    </div>
                  </div>
                  <div className="text-xs shrink-0" style={{ color: '#3a2a10' }}>
                    <DecodeText text={`${ev.artists.length} ACTS`} speed={0.5} scramble={3} />
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
                <span className="col-span-1"><DecodeText text="ID" speed={0.4} scramble={2} /></span>
                <span className="col-span-3"><DecodeText text="ARTIST" speed={0.4} scramble={2} /></span>
                <span className="col-span-1"><DecodeText text="ORG" speed={0.4} scramble={2} /></span>
                <span className="col-span-3"><DecodeText text="GENRE" speed={0.4} scramble={2} /></span>
                <span className="col-span-2"><DecodeText text="TIMESLOT" speed={0.4} scramble={2} /></span>
                <span className="col-span-2"><DecodeText text="STATUS" speed={0.4} scramble={2} /></span>
              </div>
            </div>

            <div className="space-y-2">
              {selectedEvent.artists.map((a, i) => (
                <div
                  key={a.id}
                  className="w-full"
                >
                  <ArtistRow artist={a} />
                </div>
              ))}
            </div>

            <div className="mt-6 text-xs text-center" style={{ color: '#3a2a10', fontFamily: 'var(--font-mono)' }}>
              <DecodeText
                text={selectedEvent.status === 'UPCOMING'
                  ? '— MORE ACTS TBA — STAY TUNED TO TERMINAL —'
                  : `— SESSION COMPLETE — ${selectedEvent.artists.length} ACTS TRANSMITTED —`}
                speed={0.5}
                scramble={6}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </PageLayout>
  );
}