import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transmit',
  description: 'Read and submit entries in the TERMINAL visitor log.',
};

export default function TransmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
