import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useLenis } from '../contexts/LenisContext';
import * as THREE from 'three';

export function Model(props) {
  const meshRef = useRef();
  const lenis = useLenis();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Gentle continuous rotation
    meshRef.current.rotation.y += delta * 0.1;

    // Scroll-based animation
    if (lenis) {
      // Normalize scroll value (e.g., 0 to 1 for the first 1000px of scroll)
      const scroll = lenis.scroll;
      const scrollFactor = Math.min(scroll / 1000, 1);

      // Interpolate rotation
      const targetRotationY = Math.PI * 2 * scrollFactor;
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotationY, 0.1);

      // Interpolate position
      const targetZ = -2 * scrollFactor; // Reduced range
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
    }
  });

  return (
    <group {...props} dispose={null}>
      {/* 3D Monitor/Computer representation */}
      <mesh ref={meshRef} scale={1.5}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.051]} scale={1.5}>
        <planeGeometry args={[1.8, 1]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Screen glow effect */}
      <mesh position={[0, 0, 0.052]} scale={1.5}>
        <planeGeometry args={[1.6, 0.9]} />
        <meshBasicMaterial color="#0066cc" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}

// Remove the problematic preload
// useGLTF.preload('/models/monitor.gltf');
