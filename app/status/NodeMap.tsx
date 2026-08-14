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
  return (
    <div className="relative w-full h-[180px] bg-terminal-bg-base/30 border border-terminal-accent-alert/15 overflow-hidden font-mono">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 70"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby="node-map-title node-map-description"
      >
        <title id="node-map-title">Galactic node reference map</title>
        <desc id="node-map-description">Static illustrative registry with {NODES.length} reference nodes.</desc>
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
            <circle cx={n.x} cy={n.y} r="1.5" className="fill-terminal-accent-alert/60" />
            <text x={n.x + 2} y={n.y - 2} fontSize="2.5" className="fill-terminal-accent-alert/60 font-mono">{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-2 right-3 text-xs text-terminal-muted">
        STATIC · {NODES.length} REFERENCE NODES
      </div>
    </div>
  );
}
