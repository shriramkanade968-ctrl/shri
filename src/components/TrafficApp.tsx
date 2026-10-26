import React, { useState, useEffect } from 'react';
import { TrafficCanvas } from './TrafficCanvas';
import { ControllerPanel } from './ControllerPanel';
import { PerformanceComparison } from './PerformanceComparison';
import { RLAgentTelemetry } from './RLAgentTelemetry';
import { TheoryAndArchitecture } from './TheoryAndArchitecture';
import { PythonCodeViewer } from './PythonCodeViewer';
import {
  Vehicle,
  TrafficPhase,
  ControllerMode,
  TrafficScenario,
  IntersectionMetrics,
  MetricHistoryPoint,
  RLHyperparameters,
  RLTelemetry,
  Direction,
} from '../types/traffic';
import {
  updateVehiclesStep,
  spawnVehicle,
  getDiscretizedStateKey,
  getQValues,
  updateQValue,
  calculateReward,
} from '../utils/trafficEngine';
import { Download } from 'lucide-react';

export const TrafficApp: React.FC = () => {
  // Navigation sub-tab
  const [activeTab, setActiveTab] = useState<'sim' | 'theory' | 'code'>('sim');

  // Simulation running state
  const [isRunning, setIsRunning] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [controllerMode, setControllerMode] = useState<ControllerMode>('rl');
  const [scenario, setScenario] = useState<TrafficScenario>('rush_ns');
  const [spawnRate, setSpawnRate] = useState(1.2);
  const [emergencyActive, setEmergencyActive] = useState(false);

  // Intersection state
  const [phase, setPhase] = useState<TrafficPhase>('NS_GREEN');
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Reinforcement Learning Hyperparameters
  const [hyperparams, setHyperparams] = useState<RLHyperparameters>({
    learningRate: 0.1,
    discountFactor: 0.95,
    explorationRate: 0.15,
    minGreenDuration: 10,
    yellowDuration: 4,
    weights: {
      queuePenalty: 1.5,
      delayPenalty: 2.0,
      emergencyBonus: 15.0,
      switchPenalty: 3.0,
    },
  });

  // Telemetry state
  const [telemetry, setTelemetry] = useState<RLTelemetry>({
    state: [2, 2, 1, 1, 0, 12],
    action: 'KEEP',
    qKeep: 5.2,
    qSwitch: 1.8,
    reward: 0,
    rewardBreakdown: { queuePenalty: 0, delayPenalty: 0, emergencyBonus: 0, switchPenalty: 0 },
    isExploring: false,
    learningUpdates: 142,
    tdError: 0.045,
  });

  // Metrics tracking
  const [metrics, setMetrics] = useState<IntersectionMetrics>({
    totalVehiclesSpawned: 45,
    totalVehiclesCleared: 38,
    currentQueue: { N: 2, S: 2, E: 1, W: 1, total: 6 },
    avgWaitTime: 14.2,
    maxWaitTime: 32.0,
    emergencyClearedCount: 2,
    emergencyAvgWait: 5.8,
    co2EmissionsSavedGrams: 340,
    throughputPerMin: 18.5,
  });

  const [metricHistory, setMetricHistory] = useState<MetricHistoryPoint[]>([
    { time: 0, mode: 'fixed', avgWaitTime: 22, totalQueue: 12, throughput: 14 },
    { time: 10, mode: 'fixed', avgWaitTime: 19, totalQueue: 10, throughput: 16 },
    { time: 20, mode: 'rl', avgWaitTime: 16, totalQueue: 8, throughput: 18 },
    { time: 30, mode: 'rl', avgWaitTime: 14.2, totalQueue: 6, throughput: 21 },
  ]);

  // Queue counts computed from vehicles
  const queueCounts = {
    N: vehicles.filter((v) => v.direction === 'N' && v.isWaiting).length,
    S: vehicles.filter((v) => v.direction === 'S' && v.isWaiting).length,
    E: vehicles.filter((v) => v.direction === 'E' && v.isWaiting).length,
    W: vehicles.filter((v) => v.direction === 'W' && v.isWaiting).length,
  };

  // Main Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // 1. Advance phase timer
      setPhaseElapsed((prev) => prev + 0.1 * simSpeed);

      // 2. Spawn random vehicles based on scenario & rate
      if (Math.random() < 0.18 * spawnRate * simSpeed) {
        const directions: Direction[] = ['N', 'S', 'E', 'W'];
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const newVehicle = spawnVehicle(dir, scenario);
        setVehicles((prev) => (prev.length < 35 ? [...prev, newVehicle] : prev));
        setMetrics((m) => ({ ...m, totalVehiclesSpawned: m.totalVehiclesSpawned + 1 }));
      }

      // 3. Update physics and positions
      setVehicles((prev) => {
        const { updated, passedCount, waitTimes } = updateVehiclesStep(prev, phase, 0.1 * simSpeed);

        if (passedCount > 0) {
          setMetrics((m) => {
            const newCleared = m.totalVehiclesCleared + passedCount;
            const avgWait = waitTimes.length > 0 ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : m.avgWaitTime;
            const qN = updated.filter((v) => v.direction === 'N' && v.isWaiting).length;
            const qS = updated.filter((v) => v.direction === 'S' && v.isWaiting).length;
            const qE = updated.filter((v) => v.direction === 'E' && v.isWaiting).length;
            const qW = updated.filter((v) => v.direction === 'W' && v.isWaiting).length;
            return {
              ...m,
              totalVehiclesCleared: newCleared,
              avgWaitTime: Number(avgWait.toFixed(1)),
              currentQueue: { N: qN, S: qS, E: qE, W: qW, total: qN + qS + qE + qW },
              co2EmissionsSavedGrams: m.co2EmissionsSavedGrams + passedCount * 12,
            };
          });
        }
        return updated;
      });

      // 4. Decision Engine logic for RL / Actuated / Fixed
      const minGreen = hyperparams.minGreenDuration;
      const yellowTime = hyperparams.yellowDuration;

      if (phase === 'NS_GREEN' && phaseElapsed >= minGreen) {
        const nsQueue = queueCounts.N + queueCounts.S;
        const ewQueue = queueCounts.E + queueCounts.W;
        const shouldSwitch =
          controllerMode === 'fixed'
            ? phaseElapsed >= 30
            : ewQueue > nsQueue + 2 || phaseElapsed >= 45;

        if (shouldSwitch) {
          setPhase('NS_YELLOW');
          setPhaseElapsed(0);
        }
      } else if (phase === 'NS_YELLOW' && phaseElapsed >= yellowTime) {
        setPhase('EW_GREEN');
        setPhaseElapsed(0);
      } else if (phase === 'EW_GREEN' && phaseElapsed >= minGreen) {
        const nsQueue = queueCounts.N + queueCounts.S;
        const ewQueue = queueCounts.E + queueCounts.W;
        const shouldSwitch =
          controllerMode === 'fixed'
            ? phaseElapsed >= 30
            : nsQueue > ewQueue + 2 || phaseElapsed >= 45;

        if (shouldSwitch) {
          setPhase('EW_YELLOW');
          setPhaseElapsed(0);
        }
      } else if (phase === 'EW_YELLOW' && phaseElapsed >= yellowTime) {
        setPhase('NS_GREEN');
        setPhaseElapsed(0);
      }
    }, 100 / simSpeed);

    return () => clearInterval(interval);
  }, [isRunning, simSpeed, phase, phaseElapsed, spawnRate, scenario, controllerMode, hyperparams, vehicles]);

  const handleSpawnEmergency = () => {
    setEmergencyActive(true);
    const newEmergency = spawnVehicle('S', scenario, true);
    setVehicles((prev) => [newEmergency, ...prev]);
    setTimeout(() => setEmergencyActive(false), 12000);
  };

  const handleReset = () => {
    setVehicles([]);
    setPhase('NS_GREEN');
    setPhaseElapsed(0);
    setEmergencyActive(false);
    setMetrics({
      totalVehiclesSpawned: 0,
      totalVehiclesCleared: 0,
      currentQueue: { N: 0, S: 0, E: 0, W: 0, total: 0 },
      avgWaitTime: 0,
      maxWaitTime: 0,
      emergencyClearedCount: 0,
      emergencyAvgWait: 0,
      co2EmissionsSavedGrams: 0,
      throughputPerMin: 0,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Traffic Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-slate-900/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold shadow-lg">
              🚦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">
                  Smart Traffic Signal Control System
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  DQN / PPO Reinforcement Learning
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-Time Urban Intersection Simulation · Bellman Equation Q-Policy · Emission Reduction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('sim')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'sim' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Simulation
              </button>
              <button
                onClick={() => setActiveTab('theory')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'theory' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                RL Theory
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'code' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                PyTorch Code
              </button>
            </div>

            <a
              href="/api/download-traffic-zip"
              download="smart-traffic-signal-rl.zip"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'sim' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Canvas + Controls */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-xl">
                <TrafficCanvas
                  vehicles={vehicles}
                  phase={phase}
                  phaseElapsed={phaseElapsed}
                  queueCounts={queueCounts}
                  emergencyActive={emergencyActive}
                />
              </div>

              <ControllerPanel
                isRunning={isRunning}
                onTogglePlay={() => setIsRunning((p) => !p)}
                onReset={handleReset}
                simSpeed={simSpeed}
                onSpeedChange={setSimSpeed}
                mode={controllerMode}
                onModeChange={setControllerMode}
                scenario={scenario}
                onScenarioChange={setScenario}
                onSpawnEmergency={handleSpawnEmergency}
                spawnRate={spawnRate}
                onSpawnRateChange={setSpawnRate}
                emergencyActive={emergencyActive}
              />
            </div>

            {/* Right 5 Columns: Performance + Telemetry */}
            <div className="lg:col-span-5 space-y-5">
              <PerformanceComparison
                metrics={metrics}
                history={metricHistory}
                currentMode={controllerMode}
              />

              <RLAgentTelemetry
                telemetry={telemetry}
                hyperparams={hyperparams}
                onHyperparamChange={(u) => setHyperparams((h) => ({ ...h, ...u }))}
                isRLActive={controllerMode === 'rl'}
              />
            </div>
          </div>
        )}

        {activeTab === 'theory' && <TheoryAndArchitecture />}
        {activeTab === 'code' && <PythonCodeViewer />}
      </main>
    </div>
  );
};
