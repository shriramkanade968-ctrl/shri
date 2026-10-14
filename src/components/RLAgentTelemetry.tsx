import React from 'react';
import { Activity, Compass, Flame, Sliders, Database, ArrowRight, ShieldAlert } from 'lucide-react';
import { RLTelemetry, RLHyperparameters } from '../types/traffic';

interface RLAgentTelemetryProps {
  telemetry: RLTelemetry;
  hyperparams: RLHyperparameters;
  onHyperparamChange: (updated: Partial<RLHyperparameters>) => void;
  isRLActive: boolean;
}

export const RLAgentTelemetry: React.FC<RLAgentTelemetryProps> = ({
  telemetry,
  hyperparams,
  onHyperparamChange,
  isRLActive
}) => {
  const { state, action, qKeep, qSwitch, reward, rewardBreakdown, isExploring, learningUpdates, tdError } = telemetry;

  // Percentage comparison for Q-values
  const absKeep = Math.abs(qKeep);
  const absSwitch = Math.abs(qSwitch);
  const maxAbs = Math.max(absKeep, absSwitch, 1);
  const keepPct = Math.min(100, Math.max(10, (absKeep / maxAbs) * 100));
  const switchPct = Math.min(100, Math.max(10, (absSwitch / maxAbs) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            RL Agent Policy & Bellman Telemetry
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-slate-400">Updates: <strong className="text-emerald-400">{learningUpdates}</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">TD Error: <strong className="text-amber-400">{tdError.toFixed(3)}</strong></span>
        </div>
      </div>

      {!isRLActive && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Note: Signal is currently controlled by a conventional fixed/actuated timer. Switch to <strong>RL Agent</strong> mode above to activate adaptive reinforcement control.</span>
        </div>
      )}

      {/* State & Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* State Vector Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Observed State Vector (sₜ)
            </span>
            <span className="font-mono text-emerald-400 text-[11px]">6-Dim Vector</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Q_North</span>
              <span className="font-bold text-slate-200">{state[0] ?? 0}</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Q_South</span>
              <span className="font-bold text-slate-200">{state[1] ?? 0}</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Q_East</span>
              <span className="font-bold text-slate-200">{state[2] ?? 0}</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Q_West</span>
              <span className="font-bold text-slate-200">{state[3] ?? 0}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
            <span>Phase Index: <strong className="text-slate-200">{state[4] === 0 ? '0 (NS)' : '1 (EW)'}</strong></span>
            <span>Elapsed: <strong className="text-slate-200">{(state[5] || 0).toFixed(1)}s</strong></span>
          </div>
        </div>

        {/* Action Decision & Q-Values */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Action Selection (aₜ)
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
              isExploring ? 'bg-amber-950 text-amber-300 border border-amber-700' : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
            }`}>
              {isExploring ? 'ε-Explore' : 'Greedy Exploit'}
            </span>
          </div>

          {/* Q-Value bars */}
          <div className="space-y-1.5 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className={action === 'KEEP' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  Q(s, KEEP_PHASE)
                </span>
                <span className="text-slate-200">{qKeep.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${action === 'KEEP' ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  style={{ width: `${keepPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className={action === 'SWITCH' ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  Q(s, SWITCH_PHASE)
                </span>
                <span className="text-slate-200">{qSwitch.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${action === 'SWITCH' ? 'bg-amber-500' : 'bg-slate-700'}`}
                  style={{ width: `${switchPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Reward Function Breakdown */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            Instant Step Reward r(s, a)
          </span>
          <span className={`font-mono font-bold text-sm ${reward >= -5 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {reward.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Queue Penalty</span>
            <span className="text-rose-400 font-medium">{rewardBreakdown.queuePenalty.toFixed(1)}</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Delay² Penalty</span>
            <span className="text-rose-400 font-medium">{rewardBreakdown.delayPenalty.toFixed(1)}</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Emergency Factor</span>
            <span className={rewardBreakdown.emergencyBonus !== 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
              {rewardBreakdown.emergencyBonus.toFixed(1)}
            </span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Switch Cost</span>
            <span className="text-amber-400 font-medium">{rewardBreakdown.switchPenalty.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Hyperparameter Tuner Sliders */}
      <div className="border-t border-slate-800/80 pt-3 space-y-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Hyperparameters & Convergence Controls
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-slate-400">Learning Rate (α)</span>
              <span className="text-emerald-400">{hyperparams.learningRate}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.4"
              step="0.01"
              value={hyperparams.learningRate}
              onChange={(e) => onHyperparamChange({ learningRate: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-slate-400">Discount Factor (γ)</span>
              <span className="text-emerald-400">{hyperparams.discountFactor}</span>
            </div>
            <input
              type="range"
              min="0.70"
              max="0.99"
              step="0.01"
              value={hyperparams.discountFactor}
              onChange={(e) => onHyperparamChange({ discountFactor: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-slate-400">Exploration (ε)</span>
              <span className="text-emerald-400">{hyperparams.explorationRate}</span>
            </div>
            <input
              type="range"
              min="0.00"
              max="0.30"
              step="0.01"
              value={hyperparams.explorationRate}
              onChange={(e) => onHyperparamChange({ explorationRate: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
