import * as THREE from 'three';
import { CarState, Driver } from '../types';

// Mock Data for Drivers
export const DRIVERS: Driver[] = [
  { id: 'ver', name: 'Max Verstappen', shortName: 'VER', team: 'Red Bull Racing', color: '#1e41ff' },
  { id: 'nor', name: 'Lando Norris', shortName: 'NOR', team: 'McLaren', color: '#ff8000' },
  { id: 'lec', name: 'Charles Leclerc', shortName: 'LEC', team: 'Ferrari', color: '#ff0000' },
  { id: 'ham', name: 'Lewis Hamilton', shortName: 'HAM', team: 'Mercedes', color: '#00d2be' },
  { id: 'pia', name: 'Oscar Piastri', shortName: 'PIA', team: 'McLaren', color: '#ff8000' },
  { id: 'rus', name: 'George Russell', shortName: 'RUS', team: 'Mercedes', color: '#00d2be' },
  { id: 'sai', name: 'Carlos Sainz', shortName: 'SAI', team: 'Ferrari', color: '#ff0000' },
  { id: 'alo', name: 'Fernando Alonso', shortName: 'ALO', team: 'Aston Martin', color: '#006f62' },
];

// Generate a procedural track shape (Simplified Silverstone-ish loop)
export const generateTrackCurve = (): THREE.CatmullRomCurve3 => {
  const points = [
    new THREE.Vector3(0, 0, 0),       // Start/Finish
    new THREE.Vector3(50, 0, 20),     // Turn 1
    new THREE.Vector3(80, 0, 10),     // Turn 2
    new THREE.Vector3(120, 0, 50),    // Straignt
    new THREE.Vector3(100, 0, 100),   // Hairpin entry
    new THREE.Vector3(60, 0, 90),     // Hairpin exit
    new THREE.Vector3(20, 0, 120),    // Back straight
    new THREE.Vector3(-40, 0, 100),   // Complex
    new THREE.Vector3(-60, 0, 60),    // Chicane
    new THREE.Vector3(-40, 0, 20),    // Final corner
  ];
  
  // Close the loop
  return new THREE.CatmullRomCurve3(points, true);
};

export const TRACK_CURVE = generateTrackCurve();
export const TOTAL_TRACK_LENGTH = TRACK_CURVE.getLength();

// Initial Car States
export const getInitialCarStates = (): CarState[] => {
  return DRIVERS.map((driver, index) => {
    // Grid start: Staggered positions backwards from 0
    const startProgress = 1.0 - (index * 0.005); // slightly behind each other
    const point = TRACK_CURVE.getPointAt(startProgress % 1);
    
    return {
      driverId: driver.id,
      position: point,
      rotation: 0,
      lap: 1,
      lapProgress: startProgress,
      speed: 0,
    };
  });
};

// Simulation Step (The core logic replacing FastF1 interpolation)
export const updateCars = (
  currentStates: CarState[],
  deltaTime: number,
  playbackSpeed: number
): CarState[] => {
  const dt = deltaTime * playbackSpeed;
  
  return currentStates.map((car, idx) => {
    // Simulate varying speeds based on track section (simplified physics)
    // Slower in turns (high curvature), faster on straights
    // We approximate curvature by checking distance between future points
    // const t = car.lapProgress % 1;
    
    // Base speed + noise + driver skill factor (simulated)
    let currentSpeed = 300; // km/h base
    const speedVariation = Math.sin(car.lapProgress * Math.PI * 4) * 50; // Slow down in "corners"
    const driverSkill = (DRIVERS.length - idx) * 2; // Higher rank = slightly faster
    
    // Random overtake logic (noise)
    const noise = Math.sin(Date.now() * 0.001 + idx) * 5; 
    
    const finalSpeedKmh = Math.max(80, currentSpeed + speedVariation + driverSkill + noise);
    const finalSpeedMs = finalSpeedKmh / 3.6; // Convert to m/s
    
    // Calculate distance traveled in this frame
    const distanceTraveled = finalSpeedMs * dt;
    const progressDelta = distanceTraveled / TOTAL_TRACK_LENGTH;
    
    let newProgress = car.lapProgress + progressDelta;
    let newLap = car.lap;
    
    if (newProgress >= 1) {
      newProgress -= 1;
      newLap += 1;
    }
    
    const newPosition = TRACK_CURVE.getPointAt(newProgress);
    const lookAheadPos = TRACK_CURVE.getPointAt((newProgress + 0.01) % 1);
    
    // Calculate Yaw (Rotation around Y axis)
    // Math.atan2(deltaX, deltaZ) usually works for Y-up systems in 3D
    const direction = new THREE.Vector3().subVectors(lookAheadPos, newPosition).normalize();
    const yaw = Math.atan2(direction.x, direction.z);
    
    return {
      ...car,
      position: newPosition,
      rotation: yaw,
      lap: newLap,
      lapProgress: newProgress,
      speed: finalSpeedKmh,
    };
  });
};