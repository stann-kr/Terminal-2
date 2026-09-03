'use client';

import { MetaText } from '@/components/ui/TerminalText';

interface FieldErrorProps {
  id: string;
  message: string;
}

export default function FieldError({ id, message }: FieldErrorProps) {
  return (
    <div id={id} className="font-mono text-terminal-accent-alert" role="alert">
      <MetaText text={message} />
    </div>
  );
}
