'use client';
import { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  intensity?: 'low' | 'high';
}

const CHARS = '!<>-_\\/[]{}—=+*^?#________';

export default function GlitchText({ text, className = '', intensity = 'low' }: GlitchTextProps) {
  const [display, setDisplay] = useState(text);
  const interval = intensity === 'high' ? 80 : 300;

  useEffect(() => {
    const timer = setInterval(() => {
      const chance = intensity === 'high' ? 0.25 : 0.06;
      setDisplay(
        text.split('').map((c) =>
          c !== ' ' && Math.random() < chance
            ? CHARS[Math.floor(Math.random() * CHARS.length)]
            : c
        ).join('')
      );
    }, interval);
    return () => clearInterval(timer);
  }, [text, interval, intensity]);

  return (
    <span className={className} style={{ fontFamily: 'var(--font-mono)' }}>
      {display}
    </span>
  );
}
