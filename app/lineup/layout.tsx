import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lineup',
  description: 'Explore TERMINAL event lineups, artist details, and set times.',
};

export default function LineupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
