import React, { useState, useEffect, useCallback } from 'react';
import { Scene3D } from './components/Scene3D';
import { Assistant } from './components/Assistant';
import { getInitialCarStates, updateCars, DRIVERS } from './services/trackData';
import { CarState, CameraMode } from './types';
import { Play, Pause, Rewind, FastForward, Video, Zap, Camera } from 'lucide-react';

export default function App() {
  // State
  const [cars, setCars] = useState<CarState[]>(getInitialCarStates());
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [cameraMode, setCameraMode] = useState<CameraMode>(CameraMode.OVERHEAD);
  const [focusedDriverId, setFocusedDriverId] = useState<string | null>(DRIVERS[0].id);
  const [showChat, setShowChat] = useState(true);

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (isPlaying) {
        const deltaTime = (now - lastTime) / 1000; // seconds
        
        setCars(prevCars => updateCars(prevCars, deltaTime, playbackSpeed));
        setTime(prevTime => prevTime + deltaTime * playbackSpeed);
      }
      lastTime = now;
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackSpeed]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          setIsPlaying(p => !p);
          break;
        case '1': setPlaybackSpeed(0.5); break;
        case '2': setPlaybackSpeed(1); break;
        case '3': setPlaybackSpeed(2); break;
        case '4': setPlaybackSpeed(4); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getLeaderboard = () => {
    return [...cars]
      .sort((a, b) => (b.lap + b.lapProgress) - (a.lap + a.lapProgress))
      .map((car, idx) => {
        const driver = DRIVERS.find(d => d.id === car.driverId);
        return { ...car, driver, position: idx + 1 };
      });
  };

  const leaderboard = getLeaderboard();

  return (
    <div className="flex w-full h-screen bg-black overflow-hidden relative font-mono">
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Scene3D 
          cars={cars} 
          cameraMode={cameraMode} 
          focusedDriverId={focusedDriverId} 
        />

        {/* HUD - Top Bar */}
        <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold italic tracking-tighter text-white">
              <span className="text-red-600">F1</span> RACE REPLAY <span className="text-xs align-top bg-emerald-500 text-black px-1 rounded ml-1 not-italic">LIVE</span>
            </h1>
            <div className="text-slate-300 text-sm mt-1">BRITISH GRAND PRIX • LAP {Math.floor(cars[0].lap)} / 52</div>
          </div>
          <div className="text-right">
             <div className="text-4xl font-bold text-white tabular-nums">
               {new Date(time * 1000).toISOString().substr(11, 8)}
             </div>
             <div className="text-xs text-slate-400">SESSION TIME</div>
          </div>
        </div>

        {/* HUD - Leaderboard */}
        <div className="absolute top-20 left-4 w-64 bg-black/80 backdrop-blur border border-slate-800 rounded-lg overflow-hidden pointer-events-auto">
          <div className="bg-slate-900 px-3 py-2 text-xs font-bold text-slate-400 border-b border-slate-800 uppercase flex justify-between">
            <span>Pos</span>
            <span>Driver</span>
            <span>Gap</span>
          </div>
          <div className="max-h-[50vh] overflow-y-auto">
            {leaderboard.map((item, idx) => (
              <div 
                key={item.driverId}
                onClick={() => {
                  setFocusedDriverId(item.driverId);
                  setCameraMode(CameraMode.FOLLOW);
                }}
                className={`flex items-center px-3 py-2 border-b border-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors ${
                  focusedDriverId === item.driverId ? 'bg-slate-800 border-l-2 border-l-emerald-500' : ''
                }`}
              >
                <div className="w-6 text-center text-slate-400 font-bold">{item.position}</div>
                <div className="w-1 h-4 mr-2" style={{ backgroundColor: item.driver?.color }}></div>
                <div className="flex-1">
                  <span className="font-bold text-white">{item.driver?.shortName}</span>
                </div>
                <div className="text-xs text-slate-400 tabular-nums">
                  {idx === 0 ? 'INT' : `+${(Math.random() * 2).toFixed(1)}s`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Bar - Bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur px-6 py-3 rounded-full border border-slate-700 flex items-center gap-6 pointer-events-auto shadow-2xl">
           <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-emerald-500 transition-colors">
             {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
           </button>
           
           <div className="h-6 w-px bg-slate-700"></div>

           <div className="flex gap-2">
             <button 
                onClick={() => setPlaybackSpeed(1)} 
                className={`px-2 py-1 rounded text-xs font-bold ${playbackSpeed === 1 ? 'bg-white text-black' : 'hover:bg-slate-800'}`}
             >1x</button>
             <button 
                onClick={() => setPlaybackSpeed(4)} 
                className={`px-2 py-1 rounded text-xs font-bold ${playbackSpeed === 4 ? 'bg-white text-black' : 'hover:bg-slate-800'}`}
             >4x</button>
           </div>

           <div className="h-6 w-px bg-slate-700"></div>

           <div className="flex gap-4 text-slate-400">
             <button 
               onClick={() => setCameraMode(CameraMode.OVERHEAD)}
               className={`hover:text-white transition-colors flex flex-col items-center ${cameraMode === CameraMode.OVERHEAD ? 'text-emerald-500' : ''}`}
               title="Overhead Cam"
             >
                <Video size={20} />
             </button>
             <button 
               onClick={() => setCameraMode(CameraMode.FOLLOW)}
               className={`hover:text-white transition-colors flex flex-col items-center ${cameraMode === CameraMode.FOLLOW ? 'text-emerald-500' : ''}`}
               title="Follow Cam"
             >
                <Camera size={20} />
             </button>
             <button 
               onClick={() => setCameraMode(CameraMode.TV_BROADCAST)}
               className={`hover:text-white transition-colors flex flex-col items-center ${cameraMode === CameraMode.TV_BROADCAST ? 'text-emerald-500' : ''}`}
               title="TV Cam"
             >
                <Zap size={20} />
             </button>
           </div>
        </div>
        
        {/* Toggle Chat Button */}
        <button 
          onClick={() => setShowChat(!showChat)}
          className="absolute top-4 right-4 bg-slate-800 p-2 rounded hover:bg-slate-700 text-white z-10"
        >
          {showChat ? 'Hide AI' : 'Show AI'}
        </button>
      </div>

      {/* Sidebar - Race Engineer AI */}
      {showChat && (
        <Assistant cars={cars} raceTime={time} />
      )}
    </div>
  );
}