import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useLenis } from '../contexts/LenisContext';
import * as THREE from 'three';

export function Model(props) {
  const { nodes, materials } = useGLTF('/models/monitor.gltf');
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
      {/* Placeholder mesh. Replace with actual model nodes when available. */}
      <mesh ref={meshRef} scale={1.5}> {/* Reduced scale */}
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="royalblue" />
      </mesh>
    </group>
  );
}

// Preloading the model so it's ready when the component mounts.
useGLTF.preload('/models/monitor.gltf');
