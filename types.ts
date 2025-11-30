import { Vector3 } from 'three';

export interface Driver {
  id: string;
  name: string;
  team: string;
  color: string;
  shortName: string;
}

export interface CarState {
  driverId: string;
  position: Vector3;
  rotation: number; // Y-axis rotation (yaw) in radians
  lap: number;
  lapProgress: number; // 0 to 1
  speed: number; // km/h
  isLeader?: boolean;
}

export interface RaceSession {
  currentTime: number; // Seconds since start
  totalLaps: number;
  isPlaying: boolean;
  playbackSpeed: number;
}

export enum CameraMode {
  TV_BROADCAST = 'TV_BROADCAST',
  FOLLOW = 'FOLLOW',
  OVERHEAD = 'OVERHEAD',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}