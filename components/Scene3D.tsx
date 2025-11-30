import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Track } from './Track';
import { Car } from './Car';
import { CarState, CameraMode, Driver } from '../types';
import { DRIVERS } from '../services/trackData';

interface SceneContentProps {
  cars: CarState[];
  cameraMode: CameraMode;
  focusedDriverId: string | null;
}

const SceneContent: React.FC<SceneContentProps> = ({ cars, cameraMode, focusedDriverId }) => {
  const controlsRef = useRef<any>(null);
  
  useFrame((state) => {
    if (cameraMode === CameraMode.FOLLOW && focusedDriverId) {
      const targetCar = cars.find(c => c.driverId === focusedDriverId);
      if (targetCar) {
        // Calculate camera position relative to car (behind and above)
        // Convert rotation to direction vector
        const distance = 10;
        const height = 5;
        
        // Simple trigonometric offset based on car rotation
        // Car rotation is Yaw (Y-axis)
        // We want to be behind, so we add PI to rotation for direction
        const offsetX = Math.sin(targetCar.rotation + Math.PI) * distance;
        const offsetZ = Math.cos(targetCar.rotation + Math.PI) * distance; // Z is forward in many 3D systems, but check ThreeJS coordinates. 
        // In ThreeJS default, usually -Z is forward.
        // Let's rely on the car position and a fixed offset vector rotated by car quaternion for robustness if needed, 
        // but simple math works for flat tracks.
        
        const camPos = new THREE.Vector3(
           targetCar.position.x - Math.sin(targetCar.rotation) * distance,
           targetCar.position.y + height,
           targetCar.position.z - Math.cos(targetCar.rotation) * distance
        );

        state.camera.position.lerp(camPos, 0.1);
        state.camera.lookAt(targetCar.position);
        if(controlsRef.current) controlsRef.current.target.lerp(targetCar.position, 0.1);
      }
    } else if (cameraMode === CameraMode.TV_BROADCAST) {
        // Slowly rotate around center
        const t = state.clock.getElapsedTime() * 0.1;
        state.camera.position.x = Math.sin(t) * 100;
        state.camera.position.z = Math.cos(t) * 100;
        state.camera.position.y = 80;
        state.camera.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[50, 50, 25]} intensity={1} castShadow />
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Track />
      
      {cars.map((car) => {
        const driver = DRIVERS.find(d => d.id === car.driverId);
        if (!driver) return null;
        return (
          <Car
            key={car.driverId}
            position={car.position}
            rotation={car.rotation}
            color={driver.color}
            name={driver.shortName}
            isFocused={car.driverId === focusedDriverId}
          />
        );
      })}

      <OrbitControls 
        ref={controlsRef} 
        enabled={cameraMode === CameraMode.OVERHEAD || cameraMode === CameraMode.FOLLOW} 
        maxPolarAngle={Math.PI / 2.1} // Don't go below ground
      />
    </>
  );
};

interface Scene3DProps {
  cars: CarState[];
  cameraMode: CameraMode;
  focusedDriverId: string | null;
}

export const Scene3D: React.FC<Scene3DProps> = (props) => {
  return (
    <div className="w-full h-full bg-slate-900">
      <Canvas shadows camera={{ position: [0, 80, 80], fov: 50 }}>
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
};