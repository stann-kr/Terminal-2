'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 디자인 토큰 기반 테마 색상 정의 (Three.js 렌더링용)
const THEME_COLORS = {
  PRIMARY: '#D6E5ED',        // 포스터 메인 Icy Blue
  PRIMARY_BRIGHT: '#FFFFFF', // 더 밝은 화이트
  SECONDARY: '#8C9BA5',      // 채도 빠진 Muted Icy Blue
  ALERT: '#B34747',          // 차가운 톤의 탁한 레드 (Muted Red)
  WARN: '#B39847',           // 차가운 톤의 탁한 골드/옐로우
  MUTED: '#5A646E',          // 아주 딥하고 탁한 블루그레이
  NEBULA: '#1F2633',         // 스페이스 배경에 스며드는 깊은 네이비
  DUST: '#8C9BA5',           // 차가운 먼지 (Secondary와 동일톤)
};

const NODES = [
  { x: 0,     y: 0,     z: 0,     label: 'NEXUS-Ω',  active: true,  desc: 'GALACTIC_CORE' },
  { x: 1.6,   y: 0.05,  z: 0.4,   label: 'ORION-I',  active: true,  desc: 'ORION_ARM·INNER' },
  { x: 2.1,   y: -0.08, z: -0.9,  label: 'ORION-II', active: true,  desc: 'ORION_ARM·OUTER' },
  { x: -1.5,  y: 0.1,   z: 0.7,   label: 'PRSUS-I',  active: true,  desc: 'PERSEUS_ARM·INNER' },
  { x: -2.0,  y: 0.06,  z: -0.6,  label: 'PRSUS-II', active: false, desc: 'PERSEUS_ARM·OUTER' },
  { x: 0.7,   y: -0.05, z: 1.7,   label: 'SGTR-I',   active: true,  desc: 'SAGITTARIUS_ARM' },
  { x: -0.5,  y: 0.04,  z: -1.8,  label: 'NRMA-I',   active: true,  desc: 'NORMA_ARM' },
  { x: -1.1,  y: 0.12,  z: -1.5,  label: 'CYGNS-I',  active: false, desc: 'CYGNUS_ARM' },
  { x: 1.3,   y: -0.1,  z: 1.4,   label: 'CYGNS-II', active: true,  desc: 'CYGNUS_ARM·RELAY' },
  { x: 0.0,   y: 0.0,   z: 2.2,   label: 'RIM-α',    active: false, desc: 'OUTER_RIM·ALPHA' },
  { x: -2.2,  y: 0.0,   z: 0.2,   label: 'RIM-β',    active: false, desc: 'OUTER_RIM·BETA' },
  { x: 1.0,   y: 0.08,  z: -2.0,  label: 'HALO-I',   active: false, desc: 'HALO_CLUSTER' },
];

const ARC_PAIRS = [
  [0,1],[0,3],[0,5],[0,6],
  [1,2],[1,8],[3,4],[3,7],
  [5,8],[5,9],[6,7],[6,11],
  [2,11],[4,10],[8,9],
];

function GalaxyDisk() {
  const diskRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (diskRef.current) {
      diskRef.current.rotation.y += delta * 0.04;
    }
  });

  const spiralPoints = useMemo(() => {
    const arms = 4;
    const pointsPerArm = 600;
    const positions: number[] = [];
    const colors: number[] = [];

    for (let arm = 0; arm < arms; arm++) {
      const armOffset = (arm / arms) * Math.PI * 2;
      for (let i = 0; i < pointsPerArm; i++) {
        const t = i / pointsPerArm;
        const angle = armOffset + t * Math.PI * 4;
        const radius = t * 2.2;
        const spread = (1 - t) * 0.18 + 0.04;
        const x = Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
        const y = (Math.random() - 0.5) * 0.12 * (1 - t * 0.6);
        const z = Math.sin(angle) * radius + (Math.random() - 0.5) * spread;
        positions.push(x, y, z);

        const brightness = 0.4 + Math.random() * 0.6;
        const isCore = t < 0.15;
        if (isCore) {
          // 코어는 가장 밝은 화이트/아이스블루
          colors.push(brightness * 0.95, brightness * 0.98, brightness * 1.0);
        } else {
          const blend = Math.random();
          if (blend < 0.5) {
            // 기본 Icy Blue (D6E5ED 근사치)
            colors.push(brightness * 0.84, brightness * 0.90, brightness * 0.93);
          } else if (blend < 0.8) {
            // 약간 더 딥한 블루 (명도 낮춤)
            colors.push(brightness * 0.60, brightness * 0.70, brightness * 0.85);
          } else {
            // 매우 흐릿한 스페이스 블루그레이
            colors.push(brightness * 0.55, brightness * 0.60, brightness * 0.70);
          }
        }
      }
    }

    const coreCount = 300;
    for (let i = 0; i < coreCount; i++) {
      const r = Math.random() * 0.35;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.4;
      positions.push(Math.cos(theta) * r, phi * r, Math.sin(theta) * r);
      const b = 0.7 + Math.random() * 0.3;
      // 코어 포인트 화이트 아이스블루
      colors.push(b * 0.95, b * 0.98, b * 1.0);
    }

    return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
  }, []);

  const dustPositions = useMemo(() => {
    const count = 200;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.3 + Math.random() * 1.8;
      arr[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 0.5;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
      arr[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 0.5;
    }
    return arr;
  }, []);

  return (
    <group ref={diskRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[spiralPoints.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[spiralPoints.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.018} vertexColors transparent opacity={0.85} sizeAttenuation />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.04} color={THEME_COLORS.DUST} transparent opacity={0.06} sizeAttenuation />
      </points>
    </group>
  );
}

function NodeLayer() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
    }
  });

  const arcLines = useMemo(() => {
    return ARC_PAIRS.map(([a, b]) => {
      const start = new THREE.Vector3(NODES[a].x, NODES[a].y, NODES[a].z);
      const end = new THREE.Vector3(NODES[b].x, NODES[b].y, NODES[b].z);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.y += 0.4;
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(40);
    });
  }, []);

  return (
    <group ref={groupRef}>
      {arcLines.map((pts, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: THEME_COLORS.ALERT, transparent: true, opacity: 0.22, linewidth: 1 });
        return (
          <primitive key={i} object={new THREE.Line(geo, mat)} />
        );
      })}

      {NODES.map((node, i) => (
        <group key={i} position={[node.x, node.y, node.z]}>
          <mesh>
            <sphereGeometry args={[i === 0 ? 0.055 : 0.032, 10, 10]} />
            <meshBasicMaterial
              color={i === 0 ? THEME_COLORS.PRIMARY_BRIGHT : node.active ? THEME_COLORS.PRIMARY : THEME_COLORS.MUTED}
              transparent
              opacity={node.active ? 1 : 0.45}
            />
          </mesh>
          {node.active && <PulseRing index={i} />}
        </group>
      ))}
    </group>
  );
}

function PulseRing({ index }: { index: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!ringRef.current) return;
    t.current += delta * (index === 0 ? 0.8 : 1.4);
    const scale = 1 + (Math.sin(t.current) * 0.5 + 0.5) * (index === 0 ? 4 : 2.5);
    ringRef.current.scale.setScalar(scale);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = (1 - (scale - 1) / (index === 0 ? 4 : 2.5)) * (index === 0 ? 0.5 : 0.4);
  });

  return (
    <mesh ref={ringRef}>
      <ringGeometry args={[0.04, 0.065, 16]} />
      <meshBasicMaterial
        color={index === 0 ? THEME_COLORS.PRIMARY_BRIGHT : THEME_COLORS.PRIMARY}
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function DeepStarfield() {
  const positions = useMemo(() => {
    const count = 800;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 6 + Math.random() * 8;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const colors = useMemo(() => {
    const count = 800;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const type = Math.random();
      if (type < 0.6) { arr[i*3]=0.9; arr[i*3+1]=0.85; arr[i*3+2]=0.75; }
      else if (type < 0.8) { arr[i*3]=0.6; arr[i*3+1]=0.75; arr[i*3+2]=1.0; }
      else { arr[i*3]=1.0; arr[i*3+1]=0.7; arr[i*3+2]=0.4; }
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} vertexColors transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function NebulaCloud() {
  const positions = useMemo(() => {
    const count = 120;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 1.2;
      arr[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 0.8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.6;
      arr[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 0.8;
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color={THEME_COLORS.NEBULA} transparent opacity={0.08} sizeAttenuation />
    </points>
  );
}

export default function GlobeMap() {
  const activeCount = NODES.filter(n => n.active).length;

  return (
    <div style={{ width: '100%', height: '340px', background: 'transparent', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 2.2, 5.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <DeepStarfield />
        <NebulaCloud />
        <GalaxyDisk />
        <NodeLayer />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.85}
          rotateSpeed={0.35}
        />
      </Canvas>
      <div
        className="text-center text-xs text-terminal-muted relative z-[1] mt-[-26px] tracking-[0.15em] font-mono"
      >
        {activeCount} ACTIVE · {NODES.length} TOTAL NODES · DRAG TO ROTATE
      </div>
    </div>
  );
}
