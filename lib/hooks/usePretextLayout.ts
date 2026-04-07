"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { prepare, layout } from "@chenglou/pretext";

export interface UsePretextLayoutOptions {
  text: string;
  font: string;
  lineHeight: number;
}

export interface UsePretextLayoutResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  height: number;
  lineCount: number;
  width: number;
  isReady: boolean;
}

/**
 * pretext 기반 텍스트 레이아웃 사전 측정 훅
 * - whiteSpace: 'pre-wrap'으로 개행(\n) 보존
 * - 컴포넌트 마운트, 폰트 로드, 창 크기 변경 시 재계산
 */
export function usePretextLayout({
  text,
  font,
  lineHeight,
}: UsePretextLayoutOptions): UsePretextLayoutResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const preparedRef = useRef<ReturnType<typeof prepare> | null>(null);
  
  const [height, setHeight] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [width, setWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const recalcLayout = useCallback(() => {
    if (!preparedRef.current || !containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    if (containerWidth <= 0) return;

    const result = layout(preparedRef.current, containerWidth, lineHeight);
    setHeight(result.height);
    setLineCount(result.lineCount);
    setWidth(containerWidth);
  }, [lineHeight]);

  useEffect(() => {
    let cancelled = false;

    const measureText = async () => {
      await document.fonts.ready;
      if (cancelled) return;

      // whiteSpace 옵션을 주어 개행 문자를 보존
      preparedRef.current = prepare(text, font, { whiteSpace: "pre-wrap" });
      recalcLayout();
      setIsReady(true);
    };

    measureText();

    return () => {
      cancelled = true;
    };
  }, [text, font, recalcLayout]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      recalcLayout();
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [recalcLayout]);

  return { containerRef, height, lineCount, width, isReady };
}
