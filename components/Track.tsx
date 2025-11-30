import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TRACK_CURVE } from '../services/trackData';

export const Track: React.FC = () => {
  const lineGeometry = useMemo(() => {
    const points = TRACK_CURVE.getPoints(200);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const roadGeometry = useMemo(() => {
    // Extrude a shape along the curve to create a 3D road surface
    const shape = new THREE.Shape();
    const width = 6;
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(width / 2, 0.5); // Thickness
    shape.lineTo(-width / 2, 0.5);
    
    return new THREE.ExtrudeGeometry(shape, {
      extrudePath: TRACK_CURVE,
      steps: 200,
      bevelEnabled: false,
    });
  }, []);

  return (
    <group>
      {/* The Asphalt */}
      <mesh geometry={roadGeometry} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>

      {/* The Center Line (Trajectory) */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial color="#ffff00" transparent opacity={0.3} />
      </line>

      {/* Kerbs (Simplified visual using points) */}
      <points>
        <bufferGeometry attach="geometry" {...lineGeometry} />
        <pointsMaterial attach="material" size={0.5} color="#fff" />
      </points>
      
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#0b0f19" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
};