'use client';
import dynamic from 'next/dynamic';

const GlobeMap = dynamic(() => import('./GlobeMap'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#4a2818', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
        LOADING NODE MAP...
      </span>
    </div>
  ),
});

export default function GlobeMapDynamic() {
  return <GlobeMap />;
}
