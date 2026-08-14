'use client';

import { useT } from '@/lib/langContext';

export default function SkipLink() {
  const t = useT();

  return (
    <a href="#main-content" className="skip-link">
      {t.common.skipToContent}
    </a>
  );
}
