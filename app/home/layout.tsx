import type { Metadata } from 'next';
import HomeAmbient from './HomeAmbient';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover the current TERMINAL event and navigate the STANN OS LIVE surfaces.',
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HomeAmbient />
      {children}
    </>
  );
}
