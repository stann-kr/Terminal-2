'use client';
import { ReactNode } from 'react';
import TerminalButton from './TerminalButton';

interface SubmitButtonProps {
  isSubmitting: boolean;
  defaultText: ReactNode;
  loadingText: ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'ghost';
  className?: string;
}

/**
 * 전송 중 상태(isSubmitting)를 관리하고 중복 클릭을 방지하는 전용 제출 버튼 컴포넌트
 */
export default function SubmitButton({
  isSubmitting,
  defaultText,
  loadingText,
  disabled = false,
  variant = 'primary',
  className = '',
}: SubmitButtonProps) {
  return (
    <TerminalButton
      type="submit"
      variant={variant}
      disabled={isSubmitting || disabled}
      className={className}
    >
      {isSubmitting ? loadingText : defaultText}
    </TerminalButton>
  );
}
