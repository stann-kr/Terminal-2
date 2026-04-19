'use client';
import type { ReactNode } from 'react';
import { LabelText } from '@/components/ui/TerminalText';

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

/** 폼 필드 래퍼 — 라벨(LabelText) + 입력 요소(input/textarea) 쌍 */
export function FormField({ label, children }: FormFieldProps) {
  return (
    <div>
      <div className="mb-1.5 tracking-widest font-mono text-terminal-muted">
        <LabelText text={label} />
      </div>
      {children}
    </div>
  );
}

/** 폼 input/textarea 공통 기본 클래스 */
export const inputClassBase =
  'w-full bg-transparent outline-none px-3 py-2 text-small md:text-body border transition-colors font-mono placeholder:text-terminal-muted/40';

/** accent 색상별 추가 클래스 맵 */
export const inputAccentClass: Record<string, string> = {
  secondary:
    'border-terminal-accent-secondary/30 focus:border-terminal-accent-secondary/70 text-terminal-accent-secondary caret-terminal-accent-secondary',
  tertiary:
    'border-terminal-accent-tertiary/30 focus:border-terminal-accent-tertiary/70 text-terminal-accent-tertiary caret-terminal-accent-tertiary',
  alert:
    'border-terminal-accent-alert/30 focus:border-terminal-accent-alert/70 text-terminal-accent-alert caret-terminal-accent-alert',
  warn:
    'border-terminal-accent-warn/30 focus:border-terminal-accent-warn/70 text-terminal-accent-warn caret-terminal-accent-warn',
  primary:
    'border-terminal-accent-primary/30 focus:border-terminal-accent-primary/70 text-terminal-primary caret-terminal-accent-primary',
};
