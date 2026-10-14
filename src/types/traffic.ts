export type Direction = 'N' | 'S' | 'E' | 'W';

export type VehicleType = 'car' | 'bus' | 'emergency';

export interface Vehicle {
  id: string;
  direction: Direction;
  x: number;
  y: number;
  speed: number;
  maxSpeed: number;
  length: number;
  width: number;
  color: string;
  type: VehicleType;
  waitTime: number; // in seconds
  isWaiting: boolean;
  hasCrossed: boolean;
  spawnTime: number;
  clearedTime?: number;
}

export type TrafficPhase = 'NS_GREEN' | 'NS_YELLOW' | 'EW_GREEN' | 'EW_YELLOW';

export type ControllerMode = 'rl' | 'fixed' | 'actuated';

export type TrafficScenario = 'balanced' | 'rush_ns' | 'rush_ew' | 'bursts';

export interface IntersectionMetrics {
  totalVehiclesSpawned: number;
  totalVehiclesCleared: number;
  currentQueue: {
    N: number;
    S: number;
    E: number;
    W: number;
    total: number;
  };
  avgWaitTime: number;
  maxWaitTime: number;
  emergencyClearedCount: number;
  emergencyAvgWait: number;
  co2EmissionsSavedGrams: number;
  throughputPerMin: number;
}

export interface MetricHistoryPoint {
  time: number;
  mode: ControllerMode;
  avgWaitTime: number;
  totalQueue: number;
  throughput: number;
}

export interface RLHyperparameters {
  learningRate: number; // alpha (e.g. 0.1)
  discountFactor: number; // gamma (e.g. 0.95)
  explorationRate: number; // epsilon (e.g. 0.05)
  minGreenDuration: number; // in seconds (e.g. 10s)
  yellowDuration: number; // in seconds (e.g. 3s)
  weights: {
    queuePenalty: number;
    delayPenalty: number;
    emergencyBonus: number;
    switchPenalty: number;
  };
}

export interface RLTelemetry {
  state: number[]; // [qN, qS, qE, qW, phaseIndex, phaseElapsed]
  action: 'KEEP' | 'SWITCH';
  qKeep: number;
  qSwitch: number;
  reward: number;
  rewardBreakdown: {
    queuePenalty: number;
    delayPenalty: number;
    emergencyBonus: number;
    switchPenalty: number;
  };
  isExploring: boolean;
  learningUpdates: number;
  tdError: number;
}
