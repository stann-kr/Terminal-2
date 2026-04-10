'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animationTokens';

// re-export: 기존 import 경로 유지 (PageLayout에서 import하는 파일 무변경)
export { containerVariants, itemVariants };

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center overflow-x-hidden text-terminal-primary px-4 sm:px-6 py-10">
      <motion.div
        className="relative z-10 w-full sm:w-[700px] md:w-[800px] flex flex-col mx-auto shrink-0 md:my-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.div>
    </div>
  );
}
