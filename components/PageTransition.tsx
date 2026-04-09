'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense, useEffect } from 'react';

/**
 * 페이지 전환 래퍼.
 * 진입 효과 없음 — 각 페이지의 DecodeText 컴포넌트가 decode 애니메이션으로 자체 등장.
 * 퇴장만 150ms 즉각 사라짐 (페이드가 아닌 빠른 차단).
 */
function Inner({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // 페이지 전환 시 스크롤 최상단으로 즉시 이동 — 높이 차이로 인한 스크롤 점프 방지
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3, ease: 'linear' } }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="bg-terminal-bg-base" />}>
      <Inner>{children}</Inner>
    </Suspense>
  );
}
