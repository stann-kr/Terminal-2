'use client';

interface ConsentBlockProps {
  children: React.ReactNode;
}

export default function ConsentBlock({ children }: ConsentBlockProps) {
  return (
    <div className="border-t border-terminal-accent-secondary/10 pt-4">
      <div className="space-y-3">{children}</div>
    </div>
  );
}
