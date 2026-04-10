const NODE_KEY = 'terminal_node_id';

function generateNodeId(): string {
  const num = Math.floor(Math.random() * 1000000);
  return `NODE-${String(num).padStart(6, '0')}`;
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
