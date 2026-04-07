'use client';
import { useState, useEffect } from 'react';

const NODES = [
  { x: 72, y: 28, label: 'SEO' },
  { x: 78, y: 25, label: 'TOK' },
  { x: 20, y: 35, label: 'NYC' },
  { x: 48, y: 28, label: 'BER' },
  { x: 50, y: 30, label: 'AMS' },
  { x: 45, y: 35, label: 'MAD' },
  { x: 63, y: 45, label: 'BOM' },
  { x: 82, y: 55, label: 'SYD' },
];

export default function NodeMap() {
  const [pulseIdx, setPulseIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulseIdx(i => (i + 1) % NODES.length), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full" style={{ height: '180px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,32,121,0.15)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10 + 5} x2="100" y2={i * 10 + 5} stroke="rgba(200,80,32,0.06)" strokeWidth="0.3" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="70" stroke="rgba(200,80,32,0.06)" strokeWidth="0.3" />
        ))}
        {/* Connection lines */}
        {NODES.map((n, i) =>
          i < NODES.length - 1 ? (
            <line key={`l${i}`} x1={n.x} y1={n.y} x2={NODES[i + 1].x} y2={NODES[i + 1].y}
              stroke="rgba(200,80,32,0.2)" strokeWidth="0.3" strokeDasharray="1 2" />
          ) : null
        )}
        {/* Nodes */}
        {NODES.map((n, i) => (
          <g key={n.label}>
            {i === pulseIdx && (
              <circle cx={n.x} cy={n.y} r="3" fill="none" stroke="#c85020" strokeWidth="0.4" opacity="0.6">
                <animate attributeName="r" values="1;6" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="0.8s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={n.x} cy={n.y} r="1.5" fill={i === pulseIdx ? '#c85020' : '#c8502066'} />
            <text x={n.x + 2} y={n.y - 2} fontSize="2.5" fill="#c8502099" fontFamily="monospace">{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-2 right-3 text-xs" style={{ color: '#4a2818', fontFamily: 'var(--font-mono)' }}>
        LIVE · {NODES.length} ACTIVE NODES
      </div>
    </div>
  );
}
