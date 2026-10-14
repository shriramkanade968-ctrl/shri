import React, { useState } from 'react';
import { BookOpen, Network, Cpu, Calculator, ShieldCheck, ArrowRight, Layers, FileCode, Check } from 'lucide-react';

export const TheoryAndArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mdp' | 'dqn' | 'reward' | 'marl'>('mdp');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              System Architecture & Reinforcement Learning Formulation
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mathematical foundations of autonomous traffic signal control through Markov Decision Processes
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'mdp', label: 'MDP Formulation' },
            { id: 'dqn', label: 'DQN Architecture' },
            { id: 'reward', label: 'Reward Engineering' },
            { id: 'marl', label: 'Multi-Agent Network' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-emerald-300 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: MDP Formulation */}
      {activeTab === 'mdp' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                1. State Space (S)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The agent perceives a continuous or discretized vector captured via edge cameras or inductive loop sensors:
              </p>
              <ul className="text-xs font-mono text-slate-400 space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <li>• q_i: Queue length on lane i</li>
                <li>• d_i: Cumulative wait time</li>
                <li>• v_i: Approaching vehicle speeds</li>
                <li>• p_t: Current green phase index</li>
                <li>• t_p: Elapsed green duration (s)</li>
                <li>• e_flag: Emergency corridor bit</li>
              </ul>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                2. Action Space (A)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Discrete action set controlling light transitions with safety interlocks:
              </p>
              <div className="text-xs font-mono text-slate-300 space-y-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <div className="p-1.5 rounded bg-slate-800/60">
                  <strong className="text-emerald-400">Action 0: KEEP_PHASE</strong>
                  <div className="text-[11px] text-slate-400">Continue current green corridor</div>
                </div>
                <div className="p-1.5 rounded bg-slate-800/60">
                  <strong className="text-amber-400">Action 1: SWITCH_PHASE</strong>
                  <div className="text-[11px] text-slate-400">Initiate 3s yellow clearance → switch</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                *Subject to minimum green constraint (t_min ≥ 8s) to prevent driver disorientation.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                3. Transition & Policy (π)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The environment transitions based on vehicle departures and incoming stochastic arrival rates:
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
                P(s_{'{t+1}'} | s_t, a_t)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The objective is learning an optimal policy π*(a|s) that maximizes discounted future return:
              </p>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400">
                J(π) = E[ Σ γᵗ r_t ]
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DQN Architecture */}
      {activeTab === 'dqn' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Deep Q-Network (DQN) Neural Structure
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                While tabular Q-learning works for single intersections with coarse discretization, Deep Q-Networks (DQN) scale to continuous traffic telemetry without the curse of dimensionality.
              </p>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Input Layer:</span>
                  <span className="text-emerald-400">State Vector s ∈ ℝ¹²</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Hidden Layer 1:</span>
                  <span className="text-slate-200">Linear(12, 128) + ReLU</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Hidden Layer 2:</span>
                  <span className="text-slate-200">Linear(128, 64) + ReLU</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Output Layer:</span>
                  <span className="text-amber-400">Linear(64, 2) → [Q(s, 0), Q(s, 1)]</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Stabilization Mechanisms
              </h3>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <strong className="text-slate-200 block mb-1">1. Experience Replay Buffer (D)</strong>
                  <p className="text-slate-400">
                    Stores tuples (s_t, a_t, r_t, s_{'{t+1}'}). Random batch sampling breaks autocorrelation between consecutive traffic frames.
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <strong className="text-slate-200 block mb-1">2. Target Network Parameter Freezing</strong>
                  <p className="text-slate-400">
                    A separate target network Q_target updates every C steps to prevent non-stationary moving target divergence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Reward Engineering */}
      {activeTab === 'reward' && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Composite Reward Function Formulation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reward engineering dictates the convergence speed and behavior of the autonomous traffic controller. A naive reward (e.g. only counting cleared cars) causes driver starvation on low-volume lanes.
            </p>

            {/* Formula Block */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center font-mono text-sm text-emerald-300 overflow-x-auto">
              R(s, a) = - [ w₁ Σ q_i + w₂ Σ (d_v / 10)² + w₃ (EmergencyDelay) + w₄ 𝕀(switch) ]
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                <span className="font-bold text-slate-200 block mb-1">Why Squared Delay (d_v²)?</span>
                <p className="text-slate-400 leading-relaxed">
                  Linear delay allows cars to wait indefinitely if an opposing lane has slightly more volume. Squaring penalizes outlier delays aggressively, guaranteeing fair service to all drivers.
                </p>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                <span className="font-bold text-slate-200 block mb-1">Switching Friction Penalty (w₄)</span>
                <p className="text-slate-400 leading-relaxed">
                  Every signal change triggers a 3-second yellow clearance phase where zero vehicles can enter. The penalty prevents rapid oscillation ("chattering").
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Multi-Agent Network (MARL) */}
      {activeTab === 'marl' && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Multi-Agent Reinforcement Learning (MARL) for City Corridors
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Single-intersection control is limited when traffic backs up between adjacent intersections (spillback). MARL coordinates multiple traffic nodes to create synchronized "Green Waves".
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <strong className="text-slate-200 block">Independent Q-Learning (IQL)</strong>
                <p className="text-slate-400">
                  Each intersection treats others as dynamic environment elements. Simple, but suffers from non-stationarity.
                </p>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <strong className="text-emerald-400 block">Centralized Critic (MAPPO)</strong>
                <p className="text-slate-400">
                  Decentralized execution at each junction with a global critic evaluating corridor-wide vehicle delay.
                </p>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <strong className="text-blue-400 block">Graph Neural Networks (GNN)</strong>
                <p className="text-slate-400">
                  Models road network topology as a graph where message passing shares downstream queue pressure.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
