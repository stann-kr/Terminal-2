import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gate',
  description: 'Review TERMINAL event details, archived sessions, and guest access status.',
};

export default function GateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
