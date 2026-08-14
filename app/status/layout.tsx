import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Status',
  description: 'View the current TERMINAL event registry and session summary.',
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
