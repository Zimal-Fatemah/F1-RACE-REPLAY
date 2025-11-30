import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Track } from './Track';
import { Car } from './Car';
import { CarState, CameraMode } from '../types';
import { DRIVERS } from '../services/trackData';

interface SceneContentProps {
  cars: CarState[];
  cameraMode: CameraMode;
  focusedDriverId: string | null;
}

const SceneContent: React.FC<SceneContentProps> = ({ cars, cameraMode, focusedDriverId }) => {
  const controlsRef = useRef<any>(null);
  
  useFrame((state) => {
    // Camera Animation Logic
    if (cameraMode === CameraMode.FOLLOW && focusedDriverId) {
      const targetCar = cars.find(c => c.driverId === focusedDriverId);
      if (targetCar) {
        const distance = 12;
        const height = 6;
        
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
        // Track the leader to keep action in center
        const leader = cars.find(c => c.lapProgress + c.lap === Math.max(...cars.map(x => x.lapProgress + x.lap)));
        
        const t = state.clock.getElapsedTime() * 0.1;
        // Orbit slowly but stay centered relative to leader's vicinity (or track center if preferred, but leader is more dynamic)
        // Let's look AT the leader, but position camera globally.
        
        const leaderPos = leader ? leader.position : new THREE.Vector3(0,0,0);
        
        // Broadcast camera orbits a point near the leader
        const targetPos = new THREE.Vector3().lerpVectors(new THREE.Vector3(0,0,0), leaderPos, 0.5); // Between center and leader
        
        state.camera.position.lerp(new THREE.Vector3(
            Math.sin(t) * 100 + targetPos.x, 
            80, 
            Math.cos(t) * 100 + targetPos.z
        ), 0.05);
        
        state.camera.lookAt(targetPos);
        if(controlsRef.current) controlsRef.current.target.lerp(targetPos, 0.05);
    }
    // Note: MAP_2D is handled by the OrthographicCamera prop and OrbitControls
  });

  const is2D = cameraMode === CameraMode.MAP_2D;

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[50, 100, 50]} intensity={1.5} castShadow />
      
      {/* Only show stars in 3D modes */}
      {!is2D && <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
      
      {/* MAP_2D Camera: Orthographic, top-down. 
          Positioned centrally over the track (approx center 30, 0, 60 based on trackData).
          Zoom starts at 3 to cover the whole track area (~200 units). 
      */}
      {is2D && (
        <OrthographicCamera 
          makeDefault 
          position={[30, 100, 60]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          zoom={3}
          near={0}
          far={500}
        />
      )}

      {/* 3D Perspective Camera */}
      {!is2D && (
        <PerspectiveCamera
          makeDefault
          position={[0, 80, 80]}
          fov={50}
        />
      )}

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
            is2D={is2D}
          />
        );
      })}

      {/* Controls Logic */}
      {is2D ? (
        // Map Controls: Allow Pan/Zoom, Lock Rotation
        <OrbitControls 
            ref={controlsRef}
            enableRotate={false} 
            enableZoom={true} 
            enablePan={true}
            mouseButtons={{
                LEFT: THREE.MOUSE.PAN,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            }}
            target={[30, 0, 60]} // Initial look-at center
        />
      ) : (
        // 3D Controls
        <OrbitControls 
          ref={controlsRef} 
          enabled={cameraMode === CameraMode.TV_BROADCAST || cameraMode === CameraMode.FOLLOW} 
          maxPolarAngle={Math.PI / 2.1} 
        />
      )}
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
      <Canvas shadows>
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
};