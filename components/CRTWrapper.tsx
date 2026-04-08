'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function CRTWrapper({ children }: { children: React.ReactNode }) {
  const ENABLE_VIGNETTE = true; // 비네팅 효과 전역 활성화

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: '#0c0904' }}
    >
      {/* 전역 노이즈 (Global Noise Overlay) */}
      <div
        className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Screen curvature shadow (Vignette) */}
      <div
        className="pointer-events-none fixed inset-0 z-50 mix-blend-multiply"
        style={{
          background: ENABLE_VIGNETTE
            ? 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)'
            : 'transparent',
        }}
      />

      {/* 전역 스캔라인 (Global Scanlines over Text) - 더 옅게 조정 */}
      <div
        className="pointer-events-none fixed inset-0 z-40 mix-blend-multiply opacity-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
        }}
      />

      {/* Moving scanline beam */}
      <motion.div
        className="pointer-events-none fixed left-0 right-0 z-40"
        style={{
          height: '15vh',
          background: 'linear-gradient(to bottom, transparent, rgba(212,146,10,0.06), transparent)',
        }}
        animate={{
          top: ['-20%', '120%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Chromatic aberration 엣지 빛번짐 */}
      <div
        className="pointer-events-none fixed inset-0 z-30 opacity-70"
        style={{
          boxShadow: ENABLE_VIGNETTE
            ? 'inset 0 0 60px rgba(0,0,0,0.5), inset 2px 0 rgba(200,80,32,0.05), inset -2px 0 rgba(58,152,128,0.05)'
            : 'inset 2px 0 rgba(200,80,32,0.05), inset -2px 0 rgba(58,152,128,0.05)',
        }}
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
