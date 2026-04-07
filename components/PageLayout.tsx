'use client';
import ParticleFieldDynamic from './ParticleFieldDynamic';

interface PageLayoutProps {
  children: React.ReactNode;
  center?: boolean;
}

export default function PageLayout({ children, center = false }: PageLayoutProps) {
  return (
    <div
      className="relative w-full min-h-screen px-4 pt-20 pb-16 flex flex-col items-center"
    >
      <ParticleFieldDynamic />
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
