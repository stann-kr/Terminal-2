'use client';

import { useEffect, type CSSProperties } from 'react';
import DecodeText from '@/components/DecodeText';
import { decode } from '@/lib/animationTokens';
import { cn } from '@/lib/utils';

interface TextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3';
  onComplete?: () => void;
  autoHeight?: boolean;
  cipher?: boolean;
}

function PlainText({
  text,
  className = '',
  style,
  as: Tag = 'span',
  onComplete,
  autoHeight = false,
}: TextProps) {
  useEffect(() => onComplete?.(), [onComplete]);

  return (
    <Tag
      className={className}
      style={{
        whiteSpace: 'pre-wrap',
        display: autoHeight ? 'block' : undefined,
        ...style,
      }}
    >
      {text}
    </Tag>
  );
}

/** Main brand title: the only default cipher surface. */
export function TitleText({ as = 'span', className = '', ...props }: TextProps) {
  return (
    <DecodeText
      {...decode.title}
      as={as}
      className={cn('text-h1 md:text-title', className)}
      {...props}
    />
  );
}

/** Page titles may opt into cipher; all record/section headings stay plain. */
export function HeadingText({
  as = 'h1',
  className = '',
  cipher = false,
  ...props
}: TextProps) {
  const resolvedClassName = cn('text-h2 md:text-h1', className);
  return cipher ? (
    <DecodeText {...decode.heading} as={as} className={resolvedClassName} {...props} />
  ) : (
    <PlainText as={as} className={resolvedClassName} {...props} />
  );
}

export function SubtitleText({ className = '', ...props }: TextProps) {
  return <PlainText className={cn('text-small md:text-body', className)} {...props} />;
}

export function BodyText({ className = '', ...props }: TextProps) {
  return <PlainText className={cn('text-small md:text-body leading-relaxed', className)} {...props} />;
}

export function LabelText({ className = '', ...props }: TextProps) {
  return <PlainText className={cn('text-caption md:text-small', className)} {...props} />;
}

export function MetaText({ className = '', ...props }: TextProps) {
  return <PlainText className={cn('text-caption md:text-small', className)} {...props} />;
}

export function DataText({ className = '', ...props }: TextProps) {
  return <PlainText className={cn('text-small md:text-body', className)} {...props} />;
}
