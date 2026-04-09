'use client';
import dynamic from 'next/dynamic';

const GlobeMap = dynamic(() => import('./GlobeMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] flex items-center justify-center font-mono">
      <span className="text-xs text-terminal-muted animate-pulse">
        LOADING NODE MAP...
      </span>
    </div>
  ),
});

export default function GlobeMapDynamic() {
  return <GlobeMap />;
}
