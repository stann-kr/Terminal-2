'use client';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import ReturnLink from '@/components/ui/ReturnLink';
import { LabelText, MetaText } from '@/components/ui/TerminalText';

export default function NotFound() {
  return (
    <PageLayout>
      <ReturnLink />
      <PageHeader path="/404" title="ERROR: 404" accent="alert" />
      <div className="mt-8 text-center space-y-4">
        <LabelText
          text="REQUESTED SIGNAL NOT FOUND IN LOCAL NODE"
          className="text-terminal-accent-alert text-shadow-glow-alert text-sm font-mono block"
        />
        <MetaText
          text="The coordinate or resource you are looking for has been moved or purged from the terminal registry."
          className="text-terminal-muted text-xs block max-w-md mx-auto"
        />
      </div>
    </PageLayout>
  );
}
