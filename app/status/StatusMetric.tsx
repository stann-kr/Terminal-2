'use client';
import { motion } from 'framer-motion';
import DecodeText from '@/components/DecodeText';

interface Props {
  label: string;
  value: string;
  unit: string;
  accent: string;
  delay: number;
}

export default function StatusMetric({ label, value, unit, accent, delay }: Props) {
  return (
    <div
      className="border text-center py-5 px-3"
      style={{ borderColor: `${accent}44`, background: 'rgba(18,14,8,0.95)' }}
    >
      <div className="text-2xl font-bold mb-1" style={{ color: accent, textShadow: `0 0 12px ${accent}66`, fontFamily: 'var(--font-mono)' }}>
        <DecodeText text={value} speed={0.4} scramble={4} />
      </div>
      <div className="text-xs mb-2" style={{ color: `${accent}88`, fontFamily: 'var(--font-mono)' }}>
        <DecodeText text={unit} speed={0.5} scramble={3} />
      </div>
      <div className="text-xs tracking-widest" style={{ color: '#2a4a2a', fontFamily: 'var(--font-mono)' }}>
        <DecodeText text={label} speed={0.5} scramble={5} />
      </div>
    </div>
  );
}
