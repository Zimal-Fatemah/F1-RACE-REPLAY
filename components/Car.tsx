import React from 'react';
import { Vector3 } from 'three';
import { Html } from '@react-three/drei';

interface CarProps {
  position: Vector3;
  rotation: number;
  color: string;
  name: string;
  isFocused: boolean;
}

export const Car: React.FC<CarProps> = ({ position, rotation, color, name, isFocused }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Simplified F1 Car Geometry */}
      
      {/* Main Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 0.6, 4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Front Wing */}
      <mesh position={[0, 0.2, 1.8]}>
        <boxGeometry args={[2.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Rear Wing */}
      <mesh position={[0, 1.2, -1.8]}>
        <boxGeometry args={[2.0, 0.4, 0.6]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Wheels */}
      <mesh position={[1, 0.4, 1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-1, 0.4, 1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[1, 0.4, -1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-1, 0.4, -1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Driver Label */}
      {isFocused && (
        <Html position={[0, 2.5, 0]} center>
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded border border-white/20 whitespace-nowrap">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};