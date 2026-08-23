'use client';
import dynamic from 'next/dynamic';
import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react';
import { shouldRenderHomeAmbient } from './ambientPolicy';
import { useMotionPolicy } from '@/lib/useMotionPolicy';

const ParticleField = dynamic(() => import('./ParticleField'), {
  ssr: false,
  loading: () => null,
});

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Ambient rendering is optional. The semantic page remains unchanged.
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function HomeAmbient() {
  const motionPolicy = useMotionPolicy();
  const [heroVisible, setHeroVisible] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    const frame = requestAnimationFrame(() => {
      setWebglAvailable(supportsWebGL());
      const anchor = document.getElementById('home-ambient-anchor');
      if (!anchor || !('IntersectionObserver' in window)) {
        setHeroVisible(Boolean(anchor));
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => setHeroVisible(entry.isIntersecting),
        { threshold: 0.05 },
      );
      observer.observe(anchor);
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  if (!shouldRenderHomeAmbient({
    allowMotion: motionPolicy.allowMotion,
    heroVisible,
    webglAvailable,
  })) {
    return null;
  }

  return (
    <WebGLBoundary>
      <ParticleField />
    </WebGLBoundary>
  );
}
