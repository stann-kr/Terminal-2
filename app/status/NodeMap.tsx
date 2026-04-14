'use client';
import { useState, useEffect } from 'react';

const NODES = [
  { x: 72, y: 28, label: 'TRAPPIST' },
  { x: 78, y: 25, label: 'KEPLER' },
  { x: 20, y: 35, label: 'PROXIMA' },
  { x: 48, y: 28, label: 'GLIESE' },
  { x: 50, y: 30, label: 'SIRIUS' },
  { x: 45, y: 35, label: 'VEGA' },
  { x: 63, y: 45, label: 'ALTAIR' },
  { x: 82, y: 55, label: 'RIGEL' },
];

export default function NodeMap() {
  const [pulseIdx, setPulseIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulseIdx(i => (i + 1) % NODES.length), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-[180px] bg-terminal-bg-base/30 border border-terminal-accent-alert/15 overflow-hidden font-mono">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10 + 5} x2="100" y2={i * 10 + 5} className="stroke-terminal-accent-alert/10" strokeWidth="0.3" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="70" className="stroke-terminal-accent-alert/10" strokeWidth="0.3" />
        ))}
        {/* Connection lines */}
        {NODES.map((n, i) =>
          i < NODES.length - 1 ? (
            <line key={`l${i}`} x1={n.x} y1={n.y} x2={NODES[i + 1].x} y2={NODES[i + 1].y}
              className="stroke-terminal-accent-alert/30" strokeWidth="0.3" strokeDasharray="1 2" />
          ) : null
        )}
        {/* Nodes */}
        {NODES.map((n, i) => (
          <g key={n.label}>
            {i === pulseIdx && (
              <circle cx={n.x} cy={n.y} r="3" fill="none" className="stroke-terminal-accent-alert/60" strokeWidth="0.4">
                <animate attributeName="r" values="1;6" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="0.8s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={n.x} cy={n.y} r="1.5" className={i === pulseIdx ? 'fill-terminal-accent-alert' : 'fill-terminal-accent-alert/40'} />
            <text x={n.x + 2} y={n.y - 2} fontSize="2.5" className="fill-terminal-accent-alert/60 font-mono">{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-2 right-3 text-xs text-terminal-muted">
        LIVE · {NODES.length} ACTIVE NODES
      </div>
    </div>
  );
}
