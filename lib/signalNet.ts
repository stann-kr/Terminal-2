/** STANN OS 표면 노드 — 3사이트 공통 문법 (설계 §4-2, §4-3) */
export interface SignalNode {
  id: 'ST-00' | 'SL-01' | 'TM-02';
  label: 'HUB' | 'ARCHIVE' | 'LIVE';
  href: string;
}

/** 이 사이트의 노드 ID */
export const SELF_NODE_ID = 'TM-02' as const;

export const SIGNAL_NET: readonly SignalNode[] = [
  { id: 'ST-00', label: 'HUB', href: 'https://stann.kr' },
  { id: 'SL-01', label: 'ARCHIVE', href: 'https://lumo.stann.kr' },
  { id: 'TM-02', label: 'LIVE', href: 'https://terminal.stann.kr' },
] as const;
