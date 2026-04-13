'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame, RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom, Noise, ChromaticAberration, Vignette, Scanline } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

const W = 0.30;
const H = 0.72;

const cx = (n: number) => -2.87 + n * 0.82;

// 원형 파티클 텍스처 생성 함수
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

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function seg(x1: number, y1: number, x2: number, y2: number): THREE.LineCurve3 {
  return new THREE.LineCurve3(
    new THREE.Vector3(x1, y1, 0),
    new THREE.Vector3(x2, y2, 0)
  );
}

function buildCurves(): THREE.LineCurve3[] {
  const curves: THREE.LineCurve3[] = [];

  const bx = 4.0, by = 1.12;
  curves.push(seg(-bx, by, bx, by));
  curves.push(seg(bx, by, bx, -by));
  curves.push(seg(bx, -by, -bx, -by));
  curves.push(seg(-bx, -by, -bx, by));

  // T
  const t = cx(0);
  curves.push(seg(t - W, H, t + W, H));
  curves.push(seg(t, H, t, -H));

  // E
  const e = cx(1);
  curves.push(seg(e - W, -H, e - W, H));
  curves.push(seg(e - W, H, e + W, H));
  curves.push(seg(e - W, 0, e + W * 0.72, 0));
  curves.push(seg(e - W, -H, e + W, -H));

  // R
  const r = cx(2);
  curves.push(seg(r - W, -H, r - W, H));
  curves.push(seg(r - W, H, r + W, H));
  curves.push(seg(r + W, H, r + W, 0));
  curves.push(seg(r - W, 0, r + W, 0));
  curves.push(seg(r + W * 0.15, 0, r + W, -H));

  // M
  const m = cx(3);
  curves.push(seg(m - W, -H, m - W, H));
  curves.push(seg(m - W, H, m, 0));
  curves.push(seg(m, 0, m + W, H));
  curves.push(seg(m + W, H, m + W, -H));

  // I
  const i4 = cx(4);
  const iw = W * 0.55;
  curves.push(seg(i4 - iw, H, i4 + iw, H));
  curves.push(seg(i4, H, i4, -H));
  curves.push(seg(i4 - iw, -H, i4 + iw, -H));

  // N
  const n5 = cx(5);
  curves.push(seg(n5 - W, -H, n5 - W, H));
  curves.push(seg(n5 - W, H, n5 + W, -H));
  curves.push(seg(n5 + W, H, n5 + W, -H));

  // A
  const a = cx(6);
  curves.push(seg(a - W, -H, a, H));
  curves.push(seg(a, H, a + W, -H));
  curves.push(seg(a - W * 0.5, H * 0.1, a + W * 0.5, H * 0.1));

  // L
  const l = cx(7);
  curves.push(seg(l - W, H, l - W, -H));
  curves.push(seg(l - W, -H, l + W, -H));

  return curves;
}

const MIN_PER_CURVE = 4;

// D안: 동일 로고를 z-depth 달리해 렌더링 (원근 효과)
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

  const { curves, particleCounts, positions, progress, speeds } = useMemo(() => {
    const allCurves = buildCurves();
    const particleCounts = allCurves.map(c =>
      Math.max(MIN_PER_CURVE, Math.round(c.v1.distanceTo(c.v2) * density))
    );
    const total = particleCounts.reduce((a, b) => a + b, 0);
    const positions = new Float32Array(total * 3);
    const progress = new Float32Array(total);
    const speeds = new Float32Array(total);

    let idx = 0;
    for (let ci = 0; ci < allCurves.length; ci++) {
      const n = particleCounts[ci];
      for (let p = 0; p < n; p++) {
        const t = zOffset === 0 ? p / n : Math.random(); // 레이어간 변화 위해 뒤/앞은 랜덤 시작
        progress[idx] = t;
        // 기존 속도에서 40% 감속 (0.003 -> 0.0018)
        speeds[idx] = (0.0018 + Math.random() * 0.003) * speedMult;
        const pt = allCurves[ci].getPoint(Math.min(t, 0.9999));
        positions[idx * 3] = pt.x;
        positions[idx * 3 + 1] = pt.y;
        positions[idx * 3 + 2] = zOffset; // z 고정
        idx++;
      }
    }

    return { curves: allCurves, particleCounts, positions, progress, speeds };
  }, [zOffset, speedMult, density]);

  useFrame((state: RootState, delta: number) => {
    if (!pointsRef.current) return;
    const dt = Math.min(delta, 0.05);

    let idx = 0;
    for (let ci = 0; ci < curves.length; ci++) {
      const n = particleCounts[ci];
      const curve = curves[ci];
      for (let p = 0; p < n; p++) {
        progress[idx] = (progress[idx] + speeds[idx] * dt * 60) % 1;
        const pt = curve.getPoint(progress[idx]);
        positions[idx * 3] = pt.x;
        positions[idx * 3 + 1] = pt.y;
        // positions[idx * 3 + 2] 는 zOffset으로 고정 유지
        idx++;
      }
    }

    (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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

// B안: 위아래 빈 공간을 채우는 희미한 산발 파티클
function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const circleMap = useMemo(() => createCircleTexture(), []);
  const count = 400; // 입자 수 최적화 (900 -> 400)

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // 로고 밖 위아래 영역(|y| > 1.3)에 60% 집중 배치
      let y: number;
      if (Math.random() < 0.6) {
        y = Math.random() < 0.5
          ? -(1.4 + Math.random() * 2.0)  // 하단: -1.4 ~ -3.4
          : (1.4 + Math.random() * 2.0);  // 상단: 1.4 ~ 3.4
      } else {
        y = (Math.random() - 0.5) * 7.0;  // 전체 영역
      }

      positions[i * 3] = (Math.random() - 0.5) * 13.0;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.0 - 1.0;

      velocities[i * 3] = (Math.random() - 0.5) * 0.001;
      // 상승 속도 약 50% 감속 (기존: 0.0008 + 0.0002)
      velocities[i * 3 + 1] = Math.random() * 0.0004 + 0.0001;
      velocities[i * 3 + 2] = 0;
    }

    return { positions, velocities };
  }, []);

  const posRef = useRef(positions.slice());

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = posRef.current;

    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      if (pos[i * 3 + 1] > 4.5) {
        pos[i * 3 + 1] = -4.5;
        pos[i * 3] = (Math.random() - 0.5) * 13.0;
      }
      if (Math.abs(pos[i * 3]) > 7.0) pos[i * 3] *= -0.98;
    }

    const geo = pointsRef.current.geometry;
    (geo.attributes.position as THREE.BufferAttribute).set(pos);
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]} // 픽셀 밀도 제한으로 성능 최적화
        style={{ background: 'transparent' }}
      >
        {/* D안: 멀티 깊이 로고 레이어 — 밀도 최적화 대신 크기를 키움 */}
        <LogoLayer zOffset={-2.0} opacity={0.08} speedMult={0.65} density={4} />
        <LogoLayer zOffset={0}    opacity={0.25} speedMult={1.0}  density={7} />
        <LogoLayer zOffset={1.5}  opacity={0.06} speedMult={1.4}  density={3} />
        
        {/* B안: 엠비언트 파티클 — 위아래 빈 공간 채움 */}
        <AmbientParticles />

        {/* 후처리 효과 (Post-processing) */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={3.5} // 빛 번짐을 조금 더 강하게
            luminanceThreshold={0.15} // 더 어두운 파티클도 빛나게
            luminanceSmoothing={0.8}
            mipmapBlur={false}
          />
          <Scanline
            density={1.8} // 주사선 밀도를 살짝 높여 질감 추가
            opacity={0.08} // 주사선을 조금 더 선명하게
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
