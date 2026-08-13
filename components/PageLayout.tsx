'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animationTokens';
import SignalNet from '@/components/ui/SignalNet';

// re-export: 기존 import 경로 유지 (PageLayout에서 import하는 파일 무변경)
export { containerVariants, itemVariants };

interface PageLayoutProps {
  children: React.ReactNode;
  /**
   * false: 수직 중앙 정렬 비활성화 (긴 폼 등 tall 페이지용).
   * true(기본값): md 이상에서 my-auto로 수직 중앙 정렬.
   */
  centerContent?: boolean;
}

export default function PageLayout({ children, centerContent = true }: PageLayoutProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative w-full min-h-screen flex flex-col items-center overflow-x-hidden text-terminal-primary px-4 sm:px-6 py-10"
    >
      <motion.div
        className={`relative z-10 w-full sm:max-w-[700px] md:max-w-[800px] flex flex-col mx-auto shrink-0${centerContent ? ' md:my-auto' : ''}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {children}

        <div className="mt-12 border-t border-terminal-bg-panel-border/40 pt-4">
          <SignalNet />
        </div>
      </motion.div>
    </main>
  );
}
