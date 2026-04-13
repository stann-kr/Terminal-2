'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function CRTWrapper({ children }: { children: React.ReactNode }) {
  const ENABLE_VIGNETTE = true; // 비네팅 효과 전역 활성화

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-terminal-bg-base">

      {/* Screen curvature shadow (Vignette) */}
      <div
        className="pointer-events-none fixed inset-0 z-50 mix-blend-multiply"
        style={{
          background: ENABLE_VIGNETTE
            ? 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.3) 100%)'
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
        className="pointer-events-none fixed left-0 right-0 z-40 h-[15vh] bg-gradient-to-b from-transparent via-terminal-accent-primary/[0.06] to-transparent"
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
            ? 'inset 0 0 60px rgba(0,0,0,0.25), inset 2px 0 rgb(var(--color-accent-alert)/0.05), inset -2px 0 rgb(var(--color-accent-secondary)/0.05)'
            : 'inset 2px 0 rgb(var(--color-accent-alert)/0.05), inset -2px 0 rgb(var(--color-accent-secondary)/0.05)',
        }}
      />

      {/* Phosphor glow */}
      <div
        className="pointer-events-none fixed inset-0 z-20 opacity-[0.03]"
        style={{ background: 'radial-gradient(ellipse at center, rgb(var(--color-accent-primary)) 0%, transparent 70%)' }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
