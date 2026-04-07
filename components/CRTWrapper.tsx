'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function CRTWrapper({ children }: { children: React.ReactNode }) {
  const [isPoweringOn, setIsPoweringOn] = useState(true);
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const powerOnSequence = async () => {
      setIsPoweringOn(true);
      
      await new Promise(r => setTimeout(r, 50));
      setFlicker(true);
      await new Promise(r => setTimeout(r, 80));
      setFlicker(false);
      await new Promise(r => setTimeout(r, 100));
      setFlicker(true);
      await new Promise(r => setTimeout(r, 60));
      setFlicker(false);
      await new Promise(r => setTimeout(r, 200));
      setFlicker(true);
      await new Promise(r => setTimeout(r, 40));
      setFlicker(false);
      
      setIsPoweringOn(false);
    };

    powerOnSequence();
  }, []);

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: '#0c0904' }}
    >
      {/* Power-on flicker overlay */}
      <motion.div
        className="fixed inset-0 z-[100] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isPoweringOn ? [0, 0.3, 0, 0.5, 0, 0.2, 0] : 0 
        }}
        transition={{ duration: 0.4, times: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1] }}
        style={{ background: '#d4920a' }}
      />

      {/* CRT power-on horizontal collapse line */}
      <motion.div
        className="fixed left-0 right-0 z-[99] pointer-events-none"
        style={{ 
          height: '2px', 
          background: 'rgba(212,146,10,0.8)',
          boxShadow: '0 0 20px rgba(212,146,10,0.8), 0 0 40px rgba(212,146,10,0.4)',
        }}
        initial={{ top: '50%', opacity: 1, scaleX: 1 }}
        animate={{ 
          top: isPoweringOn ? ['50%', '50%', '50%'] : ['50%', '50%', '50%'],
          opacity: isPoweringOn ? [1, 0.8, 0] : 0,
          scaleX: isPoweringOn ? [0, 1, 0] : 0,
        }}
        transition={{ duration: 0.5, times: [0, 0.5, 1] }}
      />

      {/* Screen curvature shadow */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.85) 100%)',
          borderRadius: '0',
        }}
      />
      
      {/* Scanlines overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)',
        }}
      />
      
      {/* Moving scanline beam */}
      <motion.div
        className="pointer-events-none fixed left-0 right-0 z-40"
        style={{
          height: '120px',
          background: 'linear-gradient(to bottom, transparent, rgba(212,146,10,0.05), transparent)',
        }}
        animate={{
          top: ['-10%', '110%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Chromatic aberration */}
      <div
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.7), inset 1px 0 rgba(200,80,32,0.04), inset -1px 0 rgba(58,152,128,0.04)',
        }}
      />

      {/* Flicker effect */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[60]"
        animate={{
          opacity: flicker ? [0, 0.1, 0, 0.05, 0] : 0,
        }}
        transition={{ duration: 0.1 }}
        style={{ background: '#0c0904' }}
      />

      {/* Phosphor glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212,146,10,0.03) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
