'use client';
import React from 'react';
import { motion, Variants } from 'framer-motion';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center overflow-x-hidden text-terminal-primary px-4 sm:px-6 pt-14 md:pt-20 pb-14 md:pb-20">
      <motion.div
        className="relative z-10 w-full max-w-[800px] flex flex-col items-start"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.div>
    </div>
  );
}
