import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Siren, Sliders, Zap, Clock, Cpu } from 'lucide-react';
import { ControllerMode, TrafficScenario } from '../types/traffic';

interface ControllerPanelProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  simSpeed: number;
  onSpeedChange: (speed: number) => void;
  mode: ControllerMode;
  onModeChange: (mode: ControllerMode) => void;
  scenario: TrafficScenario;
  onScenarioChange: (scenario: TrafficScenario) => void;
  onSpawnEmergency: () => void;
  spawnRate: number;
  onSpawnRateChange: (rate: number) => void;
  emergencyActive: boolean;
}

export const ControllerPanel: React.FC<ControllerPanelProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  simSpeed,
  onSpeedChange,
  mode,
  onModeChange,
  scenario,
  onScenarioChange,
  onSpawnEmergency,
  spawnRate,
  onSpawnRateChange,
  emergencyActive
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 text-slate-100 shadow-xl">
      {/* Top Bar: Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Sim</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed multiplier segmented control */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
                simSpeed === s
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Controller Mode Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Signal Control Strategy
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => onModeChange('rl')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              mode === 'rl'
                ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Cpu className={`w-4 h-4 ${mode === 'rl' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className={`text-xs font-bold ${mode === 'rl' ? 'text-emerald-300' : 'text-slate-200'}`}>
                RL Agent (Q-Learning)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Adaptive MDP optimization. Dynamic phase timing based on queue lengths & delay penalties.
            </p>
          </button>

          <button
            onClick={() => onModeChange('fixed')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              mode === 'fixed'
                ? 'bg-blue-950/40 border-blue-500 text-white shadow-md shadow-blue-950/50'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className={`w-4 h-4 ${mode === 'fixed' ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className={`text-xs font-bold ${mode === 'fixed' ? 'text-blue-300' : 'text-slate-200'}`}>
                Fixed-Time (25s Cycle)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Standard legacy timer. Switches every 25s regardless of empty lanes or heavy backups.
            </p>
          </button>

          <button
            onClick={() => onModeChange('actuated')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              mode === 'actuated'
                ? 'bg-purple-950/40 border-purple-500 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className={`w-4 h-4 ${mode === 'actuated' ? 'text-purple-400' : 'text-slate-500'}`} />
              <span className={`text-xs font-bold ${mode === 'actuated' ? 'text-purple-300' : 'text-slate-200'}`}>
                Actuated (Sensor Loop)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Heuristic detector loop. Extends green when approaching vehicles are detected up to maximum.
            </p>
          </button>
        </div>
      </div>

      {/* Traffic Scenario Presets */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Traffic Demand Scenario
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'balanced', label: 'Balanced Flow', desc: 'Equal 4-way density' },
            { id: 'rush_ns', label: 'N-S Rush Hour', desc: 'Heavy arterial commuter' },
            { id: 'rush_ew', label: 'E-W Rush Hour', desc: 'Cross-town surge' },
            { id: 'bursts', label: 'Random Bursts', desc: 'Platoon vehicle waves' }
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => onScenarioChange(sc.id as TrafficScenario)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                scenario === sc.id
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-slate-200">{sc.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{sc.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Demand Slider & Emergency Injection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Traffic Generation Intensity</span>
            <span className="font-mono text-emerald-400 font-bold">{Math.round(spawnRate * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.015"
            max="0.08"
            step="0.005"
            value={spawnRate}
            onChange={(e) => onSpawnRateChange(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={onSpawnEmergency}
            disabled={emergencyActive}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              emergencyActive
                ? 'bg-rose-950/60 border border-rose-800 text-rose-300 opacity-80 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 active:scale-98'
            }`}
          >
            <Siren className="w-4 h-4 animate-pulse" />
            <span>
              {emergencyActive ? 'Emergency Vehicle in Transit...' : 'Spawn Emergency Ambulance'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
