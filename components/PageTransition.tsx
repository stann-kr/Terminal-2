'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

const variants = {
  initial: {
    opacity: 0,
    filter: 'brightness(2) blur(6px) saturate(2)',
    clipPath: 'inset(0 0 100% 0)',
  },
  animate: {
    opacity: 1,
    filter: 'brightness(1) blur(0px) saturate(1)',
    clipPath: 'inset(0 0 0% 0)',
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      opacity: { duration: 0.3 },
      filter: { duration: 0.45 },
      clipPath: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: {
    opacity: 0,
    filter: 'brightness(3) blur(10px) saturate(0)',
    clipPath: 'inset(100% 0 0% 0)',
    transition: {
      duration: 0.35,
      ease: [0.7, 0, 0.84, 0],
      opacity: { duration: 0.2 },
      filter: { duration: 0.25 },
      clipPath: { duration: 0.3, ease: [0.7, 0, 0.84, 0] },
    },
  },
};

function Inner({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative w-full min-h-screen">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ transformOrigin: 'top center', willChange: 'opacity, filter, clip-path' }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0c0904]" />}>
      <Inner>{children}</Inner>
    </Suspense>
  );
}
