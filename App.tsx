import React, { useState, useEffect } from 'react';
import { Scene3D } from './components/Scene3D';
import { getInitialCarStates, updateCars, DRIVERS, RACES } from './services/trackData';
import { CarState, CameraMode, RaceSession } from './types';
import { Play, Pause, Video, Zap, Map as MapIcon, ChevronRight, Trophy, Timer, Settings, Activity } from 'lucide-react';

export default function App() {
  // State
  const [cars, setCars] = useState<CarState[]>(getInitialCarStates());
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [cameraMode, setCameraMode] = useState<CameraMode>(CameraMode.TV_BROADCAST);
  const [focusedDriverId, setFocusedDriverId] = useState<string | null>(null);
  
  // New UI States
  const [selectedRace, setSelectedRace] = useState<RaceSession>(RACES[0]);
  const [showRaceSelector, setShowRaceSelector] = useState(false);

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

  const getLeaderboard = () => {
    return [...cars]
      .sort((a, b) => (b.lap + b.lapProgress) - (a.lap + a.lapProgress))
      .map((car, idx) => {
        const driver = DRIVERS.find(d => d.id === car.driverId);
        return { ...car, driver, position: idx + 1 };
      });
  };

  const leaderboard = getLeaderboard();
  const focusedCar = cars.find(c => c.driverId === focusedDriverId);
  const focusedDriver = DRIVERS.find(d => d.id === focusedDriverId);
  const focusedCarPos = leaderboard.find(l => l.driverId === focusedDriverId)?.position || '-';

  return (
    <div className="flex w-full h-screen bg-black overflow-hidden relative font-sans text-white">
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Scene3D 
          cars={cars} 
          cameraMode={cameraMode} 
          focusedDriverId={focusedDriverId} 
        />

        {/* HUD - Top Header */}
        <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none flex justify-between items-start z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black italic tracking-tighter">
                <span className="text-red-600">F1</span> REPLAY
              </h1>
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">Live</span>
            </div>
            <div className="flex items-center gap-2 mt-1 pointer-events-auto">
              <button 
                onClick={() => setShowRaceSelector(true)}
                className="text-slate-300 hover:text-white hover:bg-white/10 px-2 py-1 -ml-2 rounded flex items-center gap-1 transition-all"
              >
                <span className="text-lg font-bold uppercase">{selectedRace.name}</span>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="text-slate-400 text-xs font-mono mt-0.5">
               {selectedRace.location} • {selectedRace.date} • LAP {Math.floor(cars[0].lap)} / {selectedRace.totalLaps}
            </div>
          </div>
          <div className="text-right">
             <div className="text-5xl font-bold text-white tabular-nums tracking-tight drop-shadow-lg">
               {new Date(time * 1000).toISOString().substr(11, 8)}
             </div>
          </div>
        </div>

        {/* HUD - Leaderboard (Moved down to top-52) */}
        <div className="absolute top-52 left-6 w-72 bg-black/80 backdrop-blur-md border border-slate-800/50 rounded-xl overflow-hidden pointer-events-auto shadow-2xl z-10 transition-all">
          <div className="bg-slate-900/80 px-4 py-3 text-xs font-bold text-slate-400 border-b border-slate-700/50 uppercase flex justify-between tracking-wider">
            <span>Position</span>
            <span>Driver</span>
            <span>Gap</span>
          </div>
          <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
            {leaderboard.map((item, idx) => (
              <div 
                key={item.driverId}
                onClick={() => {
                  setFocusedDriverId(item.driverId);
                  if (cameraMode === CameraMode.TV_BROADCAST) setCameraMode(CameraMode.FOLLOW);
                }}
                className={`group flex items-center px-4 py-3 border-b border-slate-800/30 cursor-pointer hover:bg-slate-800 transition-all ${
                  focusedDriverId === item.driverId ? 'bg-slate-800 border-l-4 border-l-red-600 pl-3' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="w-8 font-mono text-slate-400 font-bold group-hover:text-white">{item.position}</div>
                <div className="flex items-center flex-1 gap-3">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: item.driver?.color }}></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white leading-tight">{item.driver?.shortName}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{item.driver?.team}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 tabular-nums font-mono">
                  {idx === 0 ? 'LEADER' : `+${(Math.random() * 2 + 0.1).toFixed(3)}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DRIVER DETAIL CARD (Right Side) - Restored to top-24 */}
        {focusedCar && focusedDriver && (
          <div className="absolute top-24 right-6 w-80 bg-black/90 backdrop-blur-xl border border-slate-700 rounded-xl p-0 overflow-hidden shadow-2xl animate-in slide-in-from-right-10 pointer-events-auto z-10">
            <div className="relative h-24 bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-end justify-between border-b border-slate-700">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Trophy size={80} />
               </div>
               <div>
                  <h2 className="text-3xl font-black italic">{focusedDriver.shortName}</h2>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">{focusedDriver.team}</p>
               </div>
               <div className="text-4xl font-bold text-white/90">P{focusedCarPos}</div>
            </div>
            
            <div className="p-5 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Activity size={12} /> Speed
                    </div>
                    <div className="text-2xl font-mono font-bold">{focusedCar.speed.toFixed(0)} <span className="text-sm text-slate-500 font-sans font-normal">km/h</span></div>
                 </div>
                 <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                       <Timer size={12} /> Last Lap
                    </div>
                    <div className="text-2xl font-mono font-bold">1:32.4<span className="text-sm text-slate-500 font-sans font-normal">s</span></div>
                 </div>
              </div>

              {/* Strategy Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
                  <Settings size={14} /> Strategy
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center text-[10px] font-bold bg-slate-900 ${
                         focusedCar.strategy.compound === 'SOFT' ? 'border-red-500 text-red-500' : 
                         focusedCar.strategy.compound === 'MEDIUM' ? 'border-yellow-500 text-yellow-500' : 'border-white text-white'
                       }`}>
                         {focusedCar.strategy.compound[0]}
                       </div>
                       <div>
                          <div className="text-sm font-bold capitalize">{focusedCar.strategy.compound.toLowerCase()} Tyres</div>
                          <div className="text-xs text-slate-400">{focusedCar.strategy.age} Laps Old • {focusedCar.strategy.condition.toFixed(0)}%</div>
                       </div>
                    </div>
                </div>
                <div className="text-xs text-slate-400 flex justify-between px-1">
                   <span>Predicted Pit:</span>
                   <span className="text-white font-mono">{focusedCar.nextPitWindow}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/80 p-3 border-t border-slate-700 text-center">
               <button onClick={() => setFocusedDriverId(null)} className="text-xs text-slate-400 hover:text-white uppercase font-bold tracking-widest transition-colors">
                 Close Telemetry
               </button>
            </div>
          </div>
        )}

        {/* Controls Bar - Bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl px-8 py-4 rounded-2xl border border-slate-700/50 flex items-center gap-8 pointer-events-auto shadow-2xl z-10 transition-transform hover:scale-105">
           <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-red-500 transition-colors transform hover:scale-110">
             {isPlaying ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} />}
           </button>
           
           <div className="h-8 w-px bg-slate-700"></div>

           <div className="flex gap-2">
             {[1, 2, 4].map(speed => (
               <button 
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)} 
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${playbackSpeed === speed ? 'bg-white text-black scale-105' : 'hover:bg-slate-800 text-slate-400'}`}
               >
                 {speed}x
               </button>
             ))}
           </div>

           <div className="h-8 w-px bg-slate-700"></div>

           <div className="flex gap-6 text-slate-400">
             <button 
               onClick={() => setCameraMode(CameraMode.MAP_2D)}
               className={`hover:text-white transition-all flex flex-col items-center gap-1 ${cameraMode === CameraMode.MAP_2D ? 'text-red-500 scale-110' : ''}`}
               title="2D Map"
             >
                <MapIcon size={20} />
                <span className="text-[9px] uppercase font-bold tracking-wider">Map</span>
             </button>
             <button 
               onClick={() => setCameraMode(CameraMode.TV_BROADCAST)}
               className={`hover:text-white transition-all flex flex-col items-center gap-1 ${cameraMode === CameraMode.TV_BROADCAST ? 'text-red-500 scale-110' : ''}`}
               title="TV Broadcast"
             >
                <Zap size={20} />
                <span className="text-[9px] uppercase font-bold tracking-wider">TV</span>
             </button>
             <button 
               onClick={() => {
                 setCameraMode(CameraMode.FOLLOW);
                 if (!focusedDriverId) setFocusedDriverId(DRIVERS[0].id);
               }}
               className={`hover:text-white transition-all flex flex-col items-center gap-1 ${cameraMode === CameraMode.FOLLOW ? 'text-red-500 scale-110' : ''}`}
               title="Follow Cam"
             >
                <Video size={20} />
                <span className="text-[9px] uppercase font-bold tracking-wider">Onboard</span>
             </button>
           </div>
        </div>

        {/* Race Selector Modal */}
        {showRaceSelector && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                   <h2 className="text-2xl font-bold italic">SELECT RACE ARCHIVE</h2>
                   <button onClick={() => setShowRaceSelector(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="p-6 grid gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                   {RACES.map(race => (
                     <button 
                        key={race.id}
                        onClick={() => {
                          setSelectedRace(race);
                          setShowRaceSelector(false);
                          setTime(0);
                          setCars(getInitialCarStates());
                          setIsPlaying(false);
                        }}
                        className={`text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                          selectedRace.id === race.id 
                            ? 'bg-red-600 border-red-500 text-white' 
                            : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
                        }`}
                     >
                        <div>
                          <div className="text-lg font-bold">{race.name}</div>
                          <div className={`text-sm ${selectedRace.id === race.id ? 'text-red-200' : 'text-slate-400'}`}>{race.location} • {race.date}</div>
                        </div>
                        <ChevronRight className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedRace.id === race.id ? 'opacity-100' : ''}`} />
                     </button>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}