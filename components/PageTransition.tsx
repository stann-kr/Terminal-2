'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

/**
 * 페이지 전환 래퍼.
 * 진입 효과 없음 — 각 페이지의 DecodeText 컴포넌트가 decode 애니메이션으로 자체 등장.
 * 퇴장만 150ms 즉각 사라짐 (페이드가 아닌 빠른 차단).
 */
function Inner({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative w-full min-h-screen">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          className="w-full"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15, ease: 'linear' } }}
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
