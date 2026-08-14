'use client';
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette, Scanline } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

const W = 0.30;
const H = 0.72;
const MIN_PER_CURVE = 4;

const cx = (n: number) => -2.87 + n * 0.82;

const seededUnit = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
};

const centeredUnit = (seed: number) => seededUnit(seed) - 0.5;

function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
}

function seg(x1: number, y1: number, x2: number, y2: number): THREE.LineCurve3 {
  return new THREE.LineCurve3(
    new THREE.Vector3(x1, y1, 0),
    new THREE.Vector3(x2, y2, 0)
  );
}

function buildCurves(): THREE.LineCurve3[] {
  const curves: THREE.LineCurve3[] = [];

  const bx = 4.0;
  const by = 1.12;
  curves.push(seg(-bx, by, bx, by));
  curves.push(seg(bx, by, bx, -by));
  curves.push(seg(bx, -by, -bx, -by));
  curves.push(seg(-bx, -by, -bx, by));

  const t = cx(0);
  curves.push(seg(t - W, H, t + W, H));
  curves.push(seg(t, H, t, -H));

  const e = cx(1);
  curves.push(seg(e - W, -H, e - W, H));
  curves.push(seg(e - W, H, e + W, H));
  curves.push(seg(e - W, 0, e + W * 0.72, 0));
  curves.push(seg(e - W, -H, e + W, -H));

  const r = cx(2);
  curves.push(seg(r - W, -H, r - W, H));
  curves.push(seg(r - W, H, r + W, H));
  curves.push(seg(r + W, H, r + W, 0));
  curves.push(seg(r - W, 0, r + W, 0));
  curves.push(seg(r + W * 0.15, 0, r + W, -H));

  const m = cx(3);
  curves.push(seg(m - W, -H, m - W, H));
  curves.push(seg(m - W, H, m, 0));
  curves.push(seg(m, 0, m + W, H));
  curves.push(seg(m + W, H, m + W, -H));

  const i4 = cx(4);
  const iw = W * 0.55;
  curves.push(seg(i4 - iw, H, i4 + iw, H));
  curves.push(seg(i4, H, i4, -H));
  curves.push(seg(i4 - iw, -H, i4 + iw, -H));

  const n5 = cx(5);
  curves.push(seg(n5 - W, -H, n5 - W, H));
  curves.push(seg(n5 - W, H, n5 + W, -H));
  curves.push(seg(n5 + W, H, n5 + W, -H));

  const a = cx(6);
  curves.push(seg(a - W, -H, a, H));
  curves.push(seg(a, H, a + W, -H));
  curves.push(seg(a - W * 0.5, H * 0.1, a + W * 0.5, H * 0.1));

  const l = cx(7);
  curves.push(seg(l - W, H, l - W, -H));
  curves.push(seg(l - W, -H, l + W, -H));

  return curves;
}

function createLogoLayerState(zOffset: number, speedMult: number, density: number) {
  const curves = buildCurves();
  const particleCounts = curves.map((curve) =>
    Math.max(MIN_PER_CURVE, Math.round(curve.v1.distanceTo(curve.v2) * density))
  );
  const total = particleCounts.reduce((a, b) => a + b, 0);
  const positions = new Float32Array(total * 3);
  const progress = new Float32Array(total);
  const speeds = new Float32Array(total);

  let idx = 0;
  for (let ci = 0; ci < curves.length; ci++) {
    const n = particleCounts[ci];
    for (let p = 0; p < n; p++) {
      const seedBase = Math.round((zOffset + 4) * 1000) * 100000 + ci * 1000 + p;
      const t = zOffset === 0 ? p / n : seededUnit(seedBase + 1);
      progress[idx] = t;
      speeds[idx] = (0.0018 + seededUnit(seedBase + 2) * 0.003) * speedMult;
      const pt = curves[ci].getPoint(Math.min(t, 0.9999));
      positions[idx * 3] = pt.x;
      positions[idx * 3 + 1] = pt.y;
      positions[idx * 3 + 2] = zOffset;
      idx++;
    }
  }

  return { curves, particleCounts, positions, progress, speeds };
}

function LogoLayer({
  zOffset,
  opacity,
  speedMult,
  density = 8,
}: {
  zOffset: number;
  opacity: number;
  speedMult: number;
  density?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const circleMap = useMemo(() => createCircleTexture(), []);
  const baseState = useMemo(() => createLogoLayerState(zOffset, speedMult, density), [zOffset, speedMult, density]);
  const progressRef = useRef(baseState.progress.slice());
  const speedsRef = useRef(baseState.speeds);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const dt = Math.min(delta, 0.05);
    const liveProgress = progressRef.current;
    const liveSpeeds = speedsRef.current;
    const livePositions = (pointsRef.current.geometry.attributes.position.array as Float32Array);

    let idx = 0;
    for (let ci = 0; ci < baseState.curves.length; ci++) {
      const n = baseState.particleCounts[ci];
      const curve = baseState.curves[ci];
      for (let p = 0; p < n; p++) {
        liveProgress[idx] = (liveProgress[idx] + liveSpeeds[idx] * dt * 60) % 1;
        const pt = curve.getPoint(liveProgress[idx]);
        livePositions[idx * 3] = pt.x;
        livePositions[idx * 3 + 1] = pt.y;
        idx++;
      }
    }

    (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[baseState.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#D6E5ED"
        size={0.05}
        map={circleMap}
        transparent
        opacity={opacity * 0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function createAmbientState(count: number) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const seedBase = 200000 + i * 23;
    let y: number;

    if (seededUnit(seedBase + 1) < 0.6) {
      y = seededUnit(seedBase + 2) < 0.5
        ? -(1.4 + seededUnit(seedBase + 3) * 2.0)
        : (1.4 + seededUnit(seedBase + 4) * 2.0);
    } else {
      y = centeredUnit(seedBase + 5) * 7.0;
    }

    positions[i * 3] = centeredUnit(seedBase + 6) * 13.0;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = centeredUnit(seedBase + 7) * 3.0 - 1.0;

    velocities[i * 3] = centeredUnit(seedBase + 8) * 0.001;
    velocities[i * 3 + 1] = seededUnit(seedBase + 9) * 0.0004 + 0.0001;
    velocities[i * 3 + 2] = 0;
  }

  return { positions, velocities };
}

function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const circleMap = useMemo(() => createCircleTexture(), []);
  const count = 400;
  const baseState = useMemo(() => createAmbientState(count), [count]);
  const velocityRef = useRef(baseState.velocities);

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = (pointsRef.current.geometry.attributes.position.array as Float32Array);
    const velocities = velocityRef.current;

    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      if (pos[i * 3 + 1] > 4.5) {
        pos[i * 3 + 1] = -4.5;
        pos[i * 3] = centeredUnit(300000 + i * 29) * 13.0;
      }
      if (Math.abs(pos[i * 3]) > 7.0) pos[i * 3] *= -0.98;
    }

    (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[baseState.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#c8a030"
        size={0.035}
        map={circleMap}
        transparent
        opacity={0.08}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export default function ParticleField() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <LogoLayer zOffset={-2.0} opacity={0.08} speedMult={0.65} density={4} />
        <LogoLayer zOffset={0} opacity={0.25} speedMult={1.0} density={7} />
        <LogoLayer zOffset={1.5} opacity={0.06} speedMult={1.4} density={3} />
        <AmbientParticles />

        <EffectComposer multisampling={0}>
          <Bloom
            intensity={3.5}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.8}
            mipmapBlur={false}
          />
          <Scanline
            density={1.8}
            opacity={0.08}
            blendFunction={BlendFunction.OVERLAY}
          />
          <Vignette
            eskil={false}
            offset={0.1}
            darkness={1.1}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
