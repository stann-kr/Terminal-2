'use client';
import { useT } from '@/lib/langContext';
import { SIGNAL_NET, SELF_NODE_ID } from '@/lib/signalNet';

/**
 * SIGNAL_NET — 3표면 상호 링크 (STANN OS 불변 글루, 설계 §4-2).
 * 현재 표면(TM-02)은 링크 대신 액센트 마커로 표시.
 */
export default function SignalNet() {
  const t = useT();
  return (
    <nav aria-label={t.common.signalNetAria} className="font-mono text-micro tracking-label">
      <span className="text-terminal-muted">{`SYS.ID: ${SELF_NODE_ID} // SIGNAL_NET`}</span>
      <span className="ml-3 inline-flex flex-wrap items-center gap-x-3 gap-y-1">
        {SIGNAL_NET.map((node) =>
          node.id === SELF_NODE_ID ? (
            <span key={node.id} aria-current="page" className="text-terminal-accent-primary">
              ● [{node.label}] {node.id}
            </span>
          ) : (
            // 같은 OS의 표면 이동이므로 의도적으로 같은 탭 (target 미지정)
            <a
              key={node.id}
              href={node.href}
              rel="noopener noreferrer"
              className="text-terminal-subdued transition-colors duration-[var(--os-dur-fast)] hover:text-terminal-accent-primary"
            >
              [{node.label}] {node.id}
            </a>
          ),
        )}
      </span>
    </nav>
  );
}
