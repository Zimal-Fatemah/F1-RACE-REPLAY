import * as THREE from 'three';
import { CarState, Driver, TyreStrategy } from '../types';

// Mock Data for Drivers
export const DRIVERS: Driver[] = [
  { id: 'ver', name: 'Max Verstappen', shortName: 'VERS', team: 'Red Bull Racing', color: '#1e41ff' },
  { id: 'nor', name: 'Lando Norris', shortName: 'NOR', team: 'McLaren', color: '#ff8000' },
  { id: 'lec', name: 'Charles Leclerc', shortName: 'LEC', team: 'Ferrari', color: '#ff0000' },
  { id: 'ham', name: 'Lewis Hamilton', shortName: 'HAM', team: 'Mercedes', color: '#00d2be' },
  { id: 'pia', name: 'Oscar Piastri', shortName: 'PIA', team: 'McLaren', color: '#ff8000' },
  { id: 'rus', name: 'George Russell', shortName: 'RUS', team: 'Mercedes', color: '#00d2be' },
  { id: 'sai', name: 'Carlos Sainz', shortName: 'SAI', team: 'Ferrari', color: '#ff0000' },
  { id: 'alo', name: 'Fernando Alonso', shortName: 'ALO', team: 'Aston Martin', color: '#006f62' },
];

export const RACES = [
  { id: 'aus', name: 'Australian Grand Prix', location: 'Melbourne', totalLaps: 58, date: '2025-03-16' },
  { id: 'chn', name: 'Chinese Grand Prix', location: 'Shanghai', totalLaps: 56, date: '2025-03-23' },
  { id: 'jpn', name: 'Japanese Grand Prix', location: 'Suzuka', totalLaps: 53, date: '2025-04-06' },
  { id: 'bah', name: 'Bahrain Grand Prix', location: 'Sakhir', totalLaps: 57, date: '2025-04-13' },
  { id: 'sau', name: 'Saudi Arabian Grand Prix', location: 'Jeddah', totalLaps: 50, date: '2025-04-20' },
  { id: 'mia', name: 'Miami Grand Prix', location: 'Miami', totalLaps: 57, date: '2025-05-04' },
  { id: 'emi', name: 'Emilia Romagna Grand Prix', location: 'Imola', totalLaps: 63, date: '2025-05-18' },
  { id: 'mon', name: 'Monaco Grand Prix', location: 'Monte Carlo', totalLaps: 78, date: '2025-05-25' },
  { id: 'spa', name: 'Spanish Grand Prix', location: 'Barcelona', totalLaps: 66, date: '2025-06-01' },
  { id: 'can', name: 'Canadian Grand Prix', location: 'Montreal', totalLaps: 70, date: '2025-06-15' },
  { id: 'aut', name: 'Austrian Grand Prix', location: 'Spielberg', totalLaps: 71, date: '2025-06-29' },
  { id: 'gbr', name: 'British Grand Prix', location: 'Silverstone', totalLaps: 52, date: '2025-07-06' },
  { id: 'bel', name: 'Belgian Grand Prix', location: 'Spa-Francorchamps', totalLaps: 44, date: '2025-07-27' },
  { id: 'hun', name: 'Hungarian Grand Prix', location: 'Budapest', totalLaps: 70, date: '2025-08-03' },
  { id: 'ned', name: 'Dutch Grand Prix', location: 'Zandvoort', totalLaps: 72, date: '2025-08-31' },
  { id: 'ita', name: 'Italian Grand Prix', location: 'Monza', totalLaps: 53, date: '2025-09-07' },
  { id: 'aze', name: 'Azerbaijan Grand Prix', location: 'Baku', totalLaps: 51, date: '2025-09-21' },
  { id: 'sin', name: 'Singapore Grand Prix', location: 'Marina Bay', totalLaps: 62, date: '2025-10-05' },
  { id: 'usa', name: 'United States Grand Prix', location: 'Austin', totalLaps: 56, date: '2025-10-19' },
  { id: 'mex', name: 'Mexico City Grand Prix', location: 'Mexico City', totalLaps: 71, date: '2025-10-26' },
  { id: 'bra', name: 'São Paulo Grand Prix', location: 'Interlagos', totalLaps: 71, date: '2025-11-09' },
  { id: 'las', name: 'Las Vegas Grand Prix', location: 'Las Vegas', totalLaps: 50, date: '2025-11-22' },
  { id: 'qat', name: 'Qatar Grand Prix', location: 'Lusail', totalLaps: 57, date: '2025-11-30' },
  { id: 'abu', name: 'Abu Dhabi Grand Prix', location: 'Yas Island', totalLaps: 58, date: '2025-12-07' },
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

const getRandomStrategy = (idx: number): TyreStrategy => {
  const compounds: ('SOFT' | 'MEDIUM' | 'HARD')[] = ['SOFT', 'MEDIUM', 'HARD'];
  // Distribute compounds based on grid position approx
  const compound = compounds[idx % 3];
  return {
    compound,
    age: Math.floor(Math.random() * 10) + 1,
    condition: 100 - (Math.random() * 15),
  };
};

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
      strategy: getRandomStrategy(index),
      nextPitWindow: `Lap ${15 + Math.floor(Math.random() * 5)} - ${20 + Math.floor(Math.random() * 5)}`
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
    const direction = new THREE.Vector3().subVectors(lookAheadPos, newPosition).normalize();
    const yaw = Math.atan2(direction.x, direction.z);
    
    // Update tyre condition slowly
    const newCondition = Math.max(0, car.strategy.condition - (dt * 0.05));

    return {
      ...car,
      position: newPosition,
      rotation: yaw,
      lap: newLap,
      lapProgress: newProgress,
      speed: finalSpeedKmh,
      strategy: {
        ...car.strategy,
        condition: newCondition
      }
    };
  });
};