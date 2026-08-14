import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Signal',
  description: 'Register an email and Instagram channel for TERMINAL event signals.',
};

export default function SignalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
