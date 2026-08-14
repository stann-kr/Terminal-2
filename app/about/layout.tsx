import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Read the TERMINAL platform manifesto and operating principles.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
