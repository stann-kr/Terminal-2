import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Guest Request | TERMINAL' },
  description: 'Submit a guest access request for the next eligible TERMINAL event.',
};

export default function GuestRequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
