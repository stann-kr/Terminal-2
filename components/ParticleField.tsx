'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 320;

  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002 + 0.0005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
      sizes[i] = Math.random() * 2.5 + 0.5;
    }
    return { positions, velocities, sizes };
  }, []);

  const posRef = useRef(positions.slice());

  useFrame(() => {
    if (!meshRef.current) return;
    const pos = posRef.current;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] += velocities[i * 3 + 0];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];
      if (pos[i * 3 + 1] > 4.5) {
        pos[i * 3 + 1] = -4.5;
        pos[i * 3 + 0] = (Math.random() - 0.5) * 14;
      }
      if (Math.abs(pos[i * 3 + 0]) > 7.5) pos[i * 3 + 0] *= -0.98;
    }
    const geo = meshRef.current.geometry;
    (geo.attributes.position as THREE.BufferAttribute).set(pos);
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#d4920a"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function DimParticles() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 180;

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.001;
      velocities[i * 3 + 1] = Math.random() * 0.0008 + 0.0002;
      velocities[i * 3 + 2] = 0;
    }
    return { positions, velocities };
  }, []);

  const posRef = useRef(positions.slice());

  useFrame(() => {
    if (!meshRef.current) return;
    const pos = posRef.current;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] += velocities[i * 3 + 0];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      if (pos[i * 3 + 1] > 5) {
        pos[i * 3 + 1] = -5;
        pos[i * 3 + 0] = (Math.random() - 0.5) * 16;
      }
    }
    const geo = meshRef.current.geometry;
    (geo.attributes.position as THREE.BufferAttribute).set(pos);
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#c8a030"
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function ParticleField() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Particles />
        <DimParticles />
      </Canvas>
    </div>
  );
}
