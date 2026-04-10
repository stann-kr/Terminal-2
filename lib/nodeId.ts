const NODE_KEY = 'terminal_node_id';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // O/0, I/1, L 제외

function generateNodeId(): string {
  const result = Array.from({ length: 5 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('');
  return `NODE-${result}`;
}

export function getNodeId(): string {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem(NODE_KEY);
  if (stored) return stored;
  const newId = generateNodeId();
  localStorage.setItem(NODE_KEY, newId);
  return newId;
}

export function setNodeId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NODE_KEY, id);
}
