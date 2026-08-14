import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Links',
  description: 'Open the verified external channels connected to TERMINAL.',
};

export default function LinkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
