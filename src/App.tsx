import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { TrafficCanvas } from './components/TrafficCanvas';
import { ControllerPanel } from './components/ControllerPanel';
import { RLAgentTelemetry } from './components/RLAgentTelemetry';
import { PerformanceComparison } from './components/PerformanceComparison';
import { TheoryAndArchitecture } from './components/TheoryAndArchitecture';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import {
  Vehicle,
  TrafficPhase,
  ControllerMode,
  TrafficScenario,
  IntersectionMetrics,
  MetricHistoryPoint,
  RLHyperparameters,
  RLTelemetry,
  Direction
} from './types/traffic';
import {
  CANVAS_SIZE,
  ROAD_WIDTH,
  LANE_WIDTH,
  CENTER,
  STOP_LINES,
  createVehicle,
  getDiscretizedStateKey,
  getQValues,
  updateQTable
} from './utils/trafficEngine';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'sim' | 'theory' | 'code'>('sim');

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [simTime, setSimTime] = useState<number>(0);

  // Controller Settings
  const [mode, setMode] = useState<ControllerMode>('rl');
  const [scenario, setScenario] = useState<TrafficScenario>('rush_ns');
  const [spawnRate, setSpawnRate] = useState<number>(0.045);
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);

  // Intersection State
  const [phase, setPhase] = useState<TrafficPhase>('NS_GREEN');
  const [phaseElapsed, setPhaseElapsed] = useState<number>(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // RL Hyperparameters
  const [hyperparams, setHyperparams] = useState<RLHyperparameters>({
    learningRate: 0.12,
    discountFactor: 0.95,
    explorationRate: 0.05,
    minGreenDuration: 8,
    yellowDuration: 3,
    weights: {
      queuePenalty: 0.5,
      delayPenalty: 0.15,
      emergencyBonus: 30.0,
      switchPenalty: 2.5
    }
  });

  // RL Telemetry
  const [telemetry, setTelemetry] = useState<RLTelemetry>({
    state: [0, 0, 0, 0, 0, 0],
    action: 'KEEP',
    qKeep: 2.5,
    qSwitch: 0.8,
    reward: -1.2,
    rewardBreakdown: {
      queuePenalty: -0.5,
      delayPenalty: -0.7,
      emergencyBonus: 0,
      switchPenalty: 0
    },
    isExploring: false,
    learningUpdates: 0,
    tdError: 0.024
  });

  // Metrics
  const [metrics, setMetrics] = useState<IntersectionMetrics>({
    totalVehiclesSpawned: 0,
    totalVehiclesCleared: 0,
    currentQueue: { N: 0, S: 0, E: 0, W: 0, total: 0 },
    avgWaitTime: 9.4,
    maxWaitTime: 12.0,
    emergencyClearedCount: 0,
    emergencyAvgWait: 0,
    co2EmissionsSavedGrams: 0,
    throughputPerMin: 18
  });

  const [history, setHistory] = useState<MetricHistoryPoint[]>([
    { time: 0, mode: 'rl', avgWaitTime: 12.0, totalQueue: 2, throughput: 15 },
    { time: 3, mode: 'rl', avgWaitTime: 10.5, totalQueue: 3, throughput: 17 },
    { time: 6, mode: 'rl', avgWaitTime: 8.8, totalQueue: 2, throughput: 19 }
  ]);

  // Keep refs for the animation loop to avoid stale closures
  const stateRef = useRef({
    isRunning,
    simSpeed,
    simTime,
    mode,
    scenario,
    spawnRate,
    phase,
    phaseElapsed,
    vehicles,
    hyperparams,
    telemetry,
    metrics,
    emergencyActive
  });

  useEffect(() => {
    stateRef.current = {
      isRunning,
      simSpeed,
      simTime,
      mode,
      scenario,
      spawnRate,
      phase,
      phaseElapsed,
      vehicles,
      hyperparams,
      telemetry,
      metrics,
      emergencyActive
    };
  }, [
    isRunning,
    simSpeed,
    simTime,
    mode,
    scenario,
    spawnRate,
    phase,
    phaseElapsed,
    vehicles,
    hyperparams,
    telemetry,
    metrics,
    emergencyActive
  ]);

  // Handle spawn emergency ambulance
  const handleSpawnEmergency = useCallback(() => {
    const curTime = stateRef.current.simTime;
    const ambulance = createVehicle('N', 'emergency', curTime);
    setVehicles((prev) => [...prev, ambulance]);
    setEmergencyActive(true);
  }, []);

  // Reset simulation
  const handleReset = useCallback(() => {
    setVehicles([]);
    setPhase('NS_GREEN');
    setPhaseElapsed(0);
    setSimTime(0);
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
      throughputPerMin: 0
    });
    setHistory([]);
  }, []);

  // Update Hyperparameters
  const handleHyperparamChange = useCallback((updated: Partial<RLHyperparameters>) => {
    setHyperparams((prev) => ({ ...prev, ...updated }));
  }, []);

  // Main Simulation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();
    let historyTimer = 0;
    let rlDecisionTimer = 0;

    const loop = (currentTimestamp: number) => {
      const deltaMs = Math.min(100, currentTimestamp - lastTimestamp);
      lastTimestamp = currentTimestamp;

      const {
        isRunning: running,
        simSpeed: speed,
        mode: currentMode,
        scenario: currentScenario,
        spawnRate: currentSpawnRate,
        hyperparams: hp
      } = stateRef.current;

      if (running) {
        const dt = (deltaMs / 1000) * speed;
        stateRef.current.simTime += dt;
        stateRef.current.phaseElapsed += dt;
        historyTimer += dt;
        rlDecisionTimer += dt;

        let curPhase = stateRef.current.phase;
        let curPhaseElapsed = stateRef.current.phaseElapsed;
        let curVehicles = [...stateRef.current.vehicles];
        let hasEmergencyOnField = curVehicles.some((v) => v.type === 'emergency' && !v.hasCrossed);

        if (!hasEmergencyOnField && stateRef.current.emergencyActive) {
          setEmergencyActive(false);
        }

        // 1. Spawning Logic based on Scenario
        const baseProb = currentSpawnRate * speed * 0.25;
        let probN = baseProb;
        let probS = baseProb;
        let probE = baseProb;
        let probW = baseProb;

        if (currentScenario === 'rush_ns') {
          probN = baseProb * 2.8;
          probS = baseProb * 2.4;
          probE = baseProb * 0.4;
          probW = baseProb * 0.4;
        } else if (currentScenario === 'rush_ew') {
          probE = baseProb * 2.8;
          probW = baseProb * 2.4;
          probN = baseProb * 0.4;
          probS = baseProb * 0.4;
        } else if (currentScenario === 'bursts') {
          const isBurst = Math.sin(stateRef.current.simTime * 0.8) > 0.6;
          if (isBurst) {
            probN *= 3.0;
            probE *= 3.0;
          }
        }

        const directions: { dir: Direction; prob: number }[] = [
          { dir: 'N', prob: probN },
          { dir: 'S', prob: probS },
          { dir: 'E', prob: probE },
          { dir: 'W', prob: probW }
        ];

        directions.forEach(({ dir, prob }) => {
          if (Math.random() < prob) {
            // Check if spawn location is clear
            const existingInEntry = curVehicles.filter(
              (v) =>
                v.direction === dir &&
                ((dir === 'N' && v.y < 40) ||
                  (dir === 'S' && v.y > CANVAS_SIZE - 40) ||
                  (dir === 'E' && v.x > CANVAS_SIZE - 40) ||
                  (dir === 'W' && v.x < 40))
            );

            if (existingInEntry.length === 0) {
              const type = Math.random() < 0.12 ? 'bus' : 'car';
              curVehicles.push(createVehicle(dir, type, stateRef.current.simTime));
              stateRef.current.metrics.totalVehiclesSpawned += 1;
            }
          }
        });

        // 2. Traffic Light Phase Transitions
        const isNsGreen = curPhase === 'NS_GREEN';
        const isNsYellow = curPhase === 'NS_YELLOW';
        const isEwGreen = curPhase === 'EW_GREEN';
        const isEwYellow = curPhase === 'EW_YELLOW';

        // Calculate queue lengths for state representation
        const queueN = curVehicles.filter(
          (v) => v.direction === 'N' && !v.hasCrossed && v.speed < 0.8 && v.y < STOP_LINES.N.y
        ).length;
        const queueS = curVehicles.filter(
          (v) => v.direction === 'S' && !v.hasCrossed && v.speed < 0.8 && v.y > STOP_LINES.S.y
        ).length;
        const queueE = curVehicles.filter(
          (v) => v.direction === 'E' && !v.hasCrossed && v.speed < 0.8 && v.x > STOP_LINES.E.x
        ).length;
        const queueW = curVehicles.filter(
          (v) => v.direction === 'W' && !v.hasCrossed && v.speed < 0.8 && v.x < STOP_LINES.W.x
        ).length;
        const totalQ = queueN + queueS + queueE + queueW;

        // Controller Switching Decision (Yellow vs Green)
        if (isNsYellow) {
          if (curPhaseElapsed >= hp.yellowDuration) {
            curPhase = 'EW_GREEN';
            curPhaseElapsed = 0;
          }
        } else if (isEwYellow) {
          if (curPhaseElapsed >= hp.yellowDuration) {
            curPhase = 'NS_GREEN';
            curPhaseElapsed = 0;
          }
        } else if (isNsGreen || isEwGreen) {
          let shouldSwitch = false;

          if (currentMode === 'fixed') {
            // Static Fixed-time controller (25 seconds green)
            if (curPhaseElapsed >= 25.0) {
              shouldSwitch = true;
            }
          } else if (currentMode === 'actuated') {
            // Sensor-actuated controller
            if (curPhaseElapsed >= hp.minGreenDuration) {
              const activeQ = isNsGreen ? queueN + queueS : queueE + queueW;
              const opposingQ = isNsGreen ? queueE + queueW : queueN + queueS;
              if (opposingQ > 2 && (activeQ === 0 || curPhaseElapsed >= 32.0)) {
                shouldSwitch = true;
              }
            }
          } else if (currentMode === 'rl') {
            // Reinforcement Learning Agent (Q-Learning / DQN evaluation)
            if (curPhaseElapsed >= hp.minGreenDuration && rlDecisionTimer >= 0.8) {
              rlDecisionTimer = 0;

              const stateKey = getDiscretizedStateKey(
                queueN,
                queueS,
                queueE,
                queueW,
                curPhase,
                curPhaseElapsed,
                hasEmergencyOnField
              );
              const [qKeep, qSwitch] = getQValues(stateKey);

              // Epsilon-greedy action
              const isExploring = Math.random() < hp.explorationRate;
              const actionChoice: 0 | 1 = isExploring
                ? Math.random() < 0.5 ? 0 : 1
                : qKeep >= qSwitch ? 0 : 1;

              // Compute reward components
              const queuePenalty = -hp.weights.queuePenalty * totalQ;
              const delaySum = curVehicles.reduce((acc, v) => acc + (v.isWaiting ? (v.waitTime / 10) ** 2 : 0), 0);
              const delayPenalty = -hp.weights.delayPenalty * delaySum;
              const emergencyWaiting = curVehicles.some((v) => v.type === 'emergency' && v.isWaiting);
              const emergencyBonus = emergencyWaiting ? -hp.weights.emergencyBonus : 0;
              const switchPenalty = actionChoice === 1 ? -hp.weights.switchPenalty : 0;
              const stepReward = queuePenalty + delayPenalty + emergencyBonus + switchPenalty;

              if (actionChoice === 1) {
                shouldSwitch = true;
              }

              // Next hypothetical state
              const nextStateKey = getDiscretizedStateKey(
                Math.max(0, queueN - (isNsGreen ? 1 : 0)),
                Math.max(0, queueS - (isNsGreen ? 1 : 0)),
                Math.max(0, queueE - (isEwGreen ? 1 : 0)),
                Math.max(0, queueW - (isEwGreen ? 1 : 0)),
                actionChoice === 1 ? (isNsGreen ? 'EW_GREEN' : 'NS_GREEN') : curPhase,
                actionChoice === 1 ? 0 : curPhaseElapsed + 1,
                hasEmergencyOnField
              );

              // Bellman update
              const { tdError } = updateQTable(
                stateKey,
                actionChoice,
                stepReward,
                nextStateKey,
                hp.learningRate,
                hp.discountFactor
              );

              setTelemetry({
                state: [queueN, queueS, queueE, queueW, isNsGreen ? 0 : 1, curPhaseElapsed],
                action: actionChoice === 0 ? 'KEEP' : 'SWITCH',
                qKeep,
                qSwitch,
                reward: stepReward,
                rewardBreakdown: {
                  queuePenalty,
                  delayPenalty,
                  emergencyBonus,
                  switchPenalty
                },
                isExploring,
                learningUpdates: stateRef.current.telemetry.learningUpdates + 1,
                tdError: Math.abs(tdError)
              });
            }
          }

          if (shouldSwitch) {
            curPhase = isNsGreen ? 'NS_YELLOW' : 'EW_YELLOW';
            curPhaseElapsed = 0;
          }
        }

        // 3. Vehicle Kinematics & Physics Step
        const activeGreen = curPhase;
        const clearedThisStep: Vehicle[] = [];

        curVehicles = curVehicles.map((veh) => {
          let targetSpeed = veh.maxSpeed;
          let mustStopAtLight = false;

          // Determine distance to stop line
          const stopLine = STOP_LINES[veh.direction];
          let distToStop = 999;

          if (veh.direction === 'N') distToStop = stopLine.y - (veh.y + veh.length / 2);
          else if (veh.direction === 'S') distToStop = (veh.y - veh.length / 2) - stopLine.y;
          else if (veh.direction === 'E') distToStop = (veh.x - veh.length / 2) - stopLine.x;
          else if (veh.direction === 'W') distToStop = stopLine.x - (veh.x + veh.length / 2);

          // Check if crossed
          if (!veh.hasCrossed && distToStop < -5) {
            veh.hasCrossed = true;
          }

          // Check red/yellow signal constraint if not crossed yet
          if (!veh.hasCrossed && distToStop > 0 && distToStop < 160) {
            if (veh.direction === 'N' || veh.direction === 'S') {
              if (activeGreen !== 'NS_GREEN') {
                mustStopAtLight = true;
              }
            } else {
              if (activeGreen !== 'EW_GREEN') {
                mustStopAtLight = true;
              }
            }
          }

          // Check leading vehicle in same lane
          const leadVehicles = curVehicles.filter(
            (other) =>
              other.id !== veh.id &&
              other.direction === veh.direction &&
              ((veh.direction === 'N' && other.y > veh.y) ||
                (veh.direction === 'S' && other.y < veh.y) ||
                (veh.direction === 'E' && other.x < veh.x) ||
                (veh.direction === 'W' && other.x > veh.x))
          );

          let minDistToLead = 999;
          leadVehicles.forEach((lead) => {
            let gap = 999;
            if (veh.direction === 'N') gap = lead.y - lead.length / 2 - (veh.y + veh.length / 2);
            else if (veh.direction === 'S') gap = veh.y - veh.length / 2 - (lead.y + lead.length / 2);
            else if (veh.direction === 'E') gap = veh.x - veh.length / 2 - (lead.x + lead.length / 2);
            else if (veh.direction === 'W') gap = lead.x - lead.length / 2 - (veh.x + veh.length / 2);

            if (gap > 0 && gap < minDistToLead) {
              minDistToLead = gap;
            }
          });

          // Intelligent Driver Model (Deceleration)
          if (minDistToLead < 14) {
            targetSpeed = 0;
          } else if (minDistToLead < 45) {
            targetSpeed = Math.min(veh.speed * 0.7, 0.9);
          } else if (mustStopAtLight) {
            if (distToStop < 10) {
              targetSpeed = 0;
            } else if (distToStop < 50) {
              targetSpeed = Math.min(veh.speed * 0.8, 1.0);
            }
          }

          // Smooth acceleration / deceleration
          if (veh.speed < targetSpeed) {
            veh.speed = Math.min(targetSpeed, veh.speed + 0.15 * speed);
          } else if (veh.speed > targetSpeed) {
            veh.speed = Math.max(targetSpeed, veh.speed - 0.25 * speed);
          }

          // Update position
          const stepDist = veh.speed * speed;
          if (veh.direction === 'N') veh.y += stepDist;
          else if (veh.direction === 'S') veh.y -= stepDist;
          else if (veh.direction === 'E') veh.x -= stepDist;
          else if (veh.direction === 'W') veh.x += stepDist;

          // Update wait time if stopped
          if (veh.speed < 0.4 && !veh.hasCrossed) {
            veh.isWaiting = true;
            veh.waitTime += dt;
          } else {
            veh.isWaiting = false;
          }

          return veh;
        });

        // Filter out vehicles that exited the canvas
        const remainingVehicles: Vehicle[] = [];
        curVehicles.forEach((v) => {
          const isOffCanvas =
            (v.direction === 'N' && v.y > CANVAS_SIZE + 40) ||
            (v.direction === 'S' && v.y < -40) ||
            (v.direction === 'E' && v.x < -40) ||
            (v.direction === 'W' && v.x > CANVAS_SIZE + 40);

          if (isOffCanvas) {
            clearedThisStep.push(v);
          } else {
            remainingVehicles.push(v);
          }
        });

        // 4. Update Metrics
        if (clearedThisStep.length > 0) {
          const newClearedTotal = stateRef.current.metrics.totalVehiclesCleared + clearedThisStep.length;
          const waitSumCleared = clearedThisStep.reduce((acc, v) => acc + v.waitTime, 0);

          // Idling fuel saving estimate (2.3g CO2 per idle second saved vs 24.5s baseline)
          const delaySavedSeconds = Math.max(0, 24.5 * clearedThisStep.length - waitSumCleared);
          const co2SavedThisBatch = delaySavedSeconds * 2.3;

          stateRef.current.metrics.totalVehiclesCleared = newClearedTotal;
          stateRef.current.metrics.co2EmissionsSavedGrams += co2SavedThisBatch;
        }

        // Calculate live average wait time across current vehicles
        const waitingVehicles = remainingVehicles.filter((v) => v.waitTime > 0);
        const liveAvgWait =
          waitingVehicles.length > 0
            ? waitingVehicles.reduce((acc, v) => acc + v.waitTime, 0) / waitingVehicles.length
            : 0;

        const liveMaxWait = remainingVehicles.reduce((max, v) => Math.max(max, v.waitTime), 0);

        // Throughput per min estimate
        const activeMinutes = Math.max(0.2, stateRef.current.simTime / 60);
        const throughputEstimate = Math.round(stateRef.current.metrics.totalVehiclesCleared / activeMinutes);

        const currentMetrics: IntersectionMetrics = {
          ...stateRef.current.metrics,
          currentQueue: {
            N: queueN,
            S: queueS,
            E: queueE,
            W: queueW,
            total: totalQ
          },
          avgWaitTime: liveAvgWait > 0 ? liveAvgWait : stateRef.current.metrics.avgWaitTime,
          maxWaitTime: liveMaxWait,
          throughputPerMin: throughputEstimate
        };

        // 5. Update History every 2.5 seconds
        if (historyTimer >= 2.5) {
          historyTimer = 0;
          setHistory((prev) => {
            const next = [
              ...prev,
              {
                time: Math.round(stateRef.current.simTime),
                mode: currentMode,
                avgWaitTime: currentMetrics.avgWaitTime,
                totalQueue: totalQ,
                throughput: throughputEstimate
              }
            ];
            return next.slice(-20); // Keep last 20 samples
          });
        }

        // Commit updates to React state
        setPhase(curPhase);
        setPhaseElapsed(curPhaseElapsed);
        setVehicles(remainingVehicles);
        setSimTime(stateRef.current.simTime);
        setMetrics(currentMetrics);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mode={mode}
        totalCleared={metrics.totalVehiclesCleared}
        simTime={simTime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Overview / Kicker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span>DEEP Q-LEARNING</span>
              <span className="text-slate-700">·</span>
              <span>MARKOV DECISION PROCESS</span>
              <span className="text-slate-700">·</span>
              <span>ADAPTIVE ARTERIAL CONTROL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Reinforcement Learning-Based Smart Traffic Signal Control System
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Replacing rigid, fixed-time traffic light cycles with an autonomous agent trained to minimize cumulative queue delay, eliminate intersection bottlenecks, and dynamically prioritize emergency vehicles.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0 text-xs font-mono">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block text-[10px]">THROUGHPUT</span>
              <strong className="text-emerald-400 text-sm">{metrics.throughputPerMin}</strong> cars/min
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block text-[10px]">CO₂ AVOIDED</span>
              <strong className="text-emerald-400 text-sm">{(metrics.co2EmissionsSavedGrams / 1000).toFixed(2)}</strong> kg
            </div>
          </div>
        </div>

        {/* Tab 1: Simulator & Telemetry Hub */}
        {activeTab === 'sim' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 2D Interactive Canvas Intersection */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <TrafficCanvas
                  vehicles={vehicles}
                  phase={phase}
                  phaseElapsed={phaseElapsed}
                  queueCounts={metrics.currentQueue}
                  emergencyActive={emergencyActive}
                />
              </div>

              {/* Right Column: Controller Panel & Telemetry */}
              <div className="lg:col-span-5 space-y-5">
                <ControllerPanel
                  isRunning={isRunning}
                  onTogglePlay={() => setIsRunning((prev) => !prev)}
                  onReset={handleReset}
                  simSpeed={simSpeed}
                  onSpeedChange={setSimSpeed}
                  mode={mode}
                  onModeChange={setMode}
                  scenario={scenario}
                  onScenarioChange={setScenario}
                  onSpawnEmergency={handleSpawnEmergency}
                  spawnRate={spawnRate}
                  onSpawnRateChange={setSpawnRate}
                  emergencyActive={emergencyActive}
                />

                <RLAgentTelemetry
                  telemetry={telemetry}
                  hyperparams={hyperparams}
                  onHyperparamChange={handleHyperparamChange}
                  isRLActive={mode === 'rl'}
                />
              </div>
            </div>

            {/* Performance Benchmarks & Emissions Section */}
            <PerformanceComparison
              metrics={metrics}
              history={history}
              currentMode={mode}
            />
          </div>
        )}

        {/* Tab 2: MDP Theory & Mathematical Architecture */}
        {activeTab === 'theory' && <TheoryAndArchitecture />}

        {/* Tab 3: PyTorch Implementation Code */}
        {activeTab === 'code' && <PythonCodeViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-400">
              Reinforcement Learning-Based Smart Traffic Signal Control System (RL-STSC)
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Built with React 19, TypeScript, 2D Canvas Kinematics, and Bellman Q-Learning Equations.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>MDP State Space: ℝ⁶</span>
            <span className="text-slate-700">·</span>
            <span>Q-Policy: ε-Greedy</span>
            <span className="text-slate-700">·</span>
            <span>Reward: Penalized Delay²</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
