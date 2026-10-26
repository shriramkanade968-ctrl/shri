import {
  Direction,
  Vehicle,
  VehicleType,
  TrafficPhase,
  ControllerMode,
  TrafficScenario,
  IntersectionMetrics,
  RLHyperparameters,
  RLTelemetry
} from '../types/traffic';

export const CANVAS_SIZE = 600;
export const ROAD_WIDTH = 120;
export const LANE_WIDTH = 60;
export const STOP_LINE_OFFSET = 60; // from center
export const CENTER = CANVAS_SIZE / 2; // 300

// Stop line coordinates
export const STOP_LINES = {
  N: { x: CENTER - LANE_WIDTH / 2, y: CENTER - ROAD_WIDTH / 2 }, // incoming from North going down
  S: { x: CENTER + LANE_WIDTH / 2, y: CENTER + ROAD_WIDTH / 2 }, // incoming from South going up
  E: { x: CENTER + ROAD_WIDTH / 2, y: CENTER - LANE_WIDTH / 2 }, // incoming from East going left
  W: { x: CENTER - ROAD_WIDTH / 2, y: CENTER + LANE_WIDTH / 2 }  // incoming from West going right
};

// Initial Q-table storage (state discretization key -> [Q_keep, Q_switch])
const Q_TABLE = new Map<string, [number, number]>();

export function getDiscretizedStateKey(
  queueN: number,
  queueS: number,
  queueE: number,
  queueW: number,
  phase: TrafficPhase,
  elapsedSec: number,
  hasEmergency: boolean
): string {
  // Discretize queues into buckets: 0 (empty), 1 (1-2 cars), 2 (3-5 cars), 3 (6+ cars)
  const bucket = (q: number) => (q === 0 ? 0 : q <= 2 ? 1 : q <= 5 ? 2 : 3);
  const qBucket = `${bucket(queueN)}_${bucket(queueS)}_${bucket(queueE)}_${bucket(queueW)}`;
  const p = phase.startsWith('NS') ? 'NS' : 'EW';
  const timeBucket = elapsedSec < 10 ? 'short' : elapsedSec < 25 ? 'mid' : 'long';
  const em = hasEmergency ? 'EM1' : 'EM0';
  return `${qBucket}:${p}:${timeBucket}:${em}`;
}

export function getQValues(stateKey: string): [number, number] {
  if (!Q_TABLE.has(stateKey)) {
    // Seed with reasonable heuristic priors
    const parts = stateKey.split(':');
    const [qN, qS, qE, qW] = (parts[0] || '0_0_0_0').split('_').map(Number);
    const phase = parts[1];
    const isEmergency = parts[3] === 'EM1';

    const nsQueue = qN + qS;
    const ewQueue = qE + qW;

    let qKeep = 0;
    let qSwitch = 0;

    if (phase === 'NS') {
      if (nsQueue > ewQueue) {
        qKeep = 5.0;
        qSwitch = -3.0;
      } else if (ewQueue > nsQueue + 1) {
        qKeep = -2.0;
        qSwitch = 6.0;
      }
    } else {
      if (ewQueue > nsQueue) {
        qKeep = 5.0;
        qSwitch = -3.0;
      } else if (nsQueue > ewQueue + 1) {
        qKeep = -2.0;
        qSwitch = 6.0;
      }
    }

    if (isEmergency) {
      qSwitch += 10.0;
    }

    Q_TABLE.set(stateKey, [qKeep, qSwitch]);
  }
  return Q_TABLE.get(stateKey)!;
}

export function updateQTable(
  stateKey: string,
  actionIdx: 0 | 1,
  reward: number,
  nextStateKey: string,
  alpha: number,
  gamma: number
): { tdError: number } {
  const currentQ = getQValues(stateKey);
  const nextQ = getQValues(nextStateKey);
  const maxNextQ = Math.max(nextQ[0], nextQ[1]);

  const target = reward + gamma * maxNextQ;
  const tdError = target - currentQ[actionIdx];
  currentQ[actionIdx] += alpha * tdError;

  Q_TABLE.set(stateKey, currentQ);
  return { tdError };
}

export const CAR_COLORS = [
  '#38bdf8', // sky blue
  '#818cf8', // indigo
  '#fbbf24', // amber
  '#f43f5e', // rose
  '#a855f7', // purple
  '#34d399', // emerald
  '#94a3b8'  // slate silver
];

export function createVehicle(
  direction: Direction,
  type: VehicleType = 'car',
  currentTime: number
): Vehicle {
  const id = `veh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const isEmergency = type === 'emergency';
  const isBus = type === 'bus';

  const length = isEmergency ? 32 : isBus ? 46 : 24;
  const width = isEmergency ? 18 : isBus ? 20 : 16;
  const maxSpeed = isEmergency ? 3.4 : isBus ? 1.8 : 2.4;
  const color = isEmergency ? '#ef4444' : isBus ? '#f59e0b' : CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];

  let x = 0;
  let y = 0;

  switch (direction) {
    case 'N': // Moving down from top
      x = CENTER - LANE_WIDTH / 2;
      y = -length;
      break;
    case 'S': // Moving up from bottom
      x = CENTER + LANE_WIDTH / 2;
      y = CANVAS_SIZE + length;
      break;
    case 'E': // Moving left from right
      x = CANVAS_SIZE + length;
      y = CENTER - LANE_WIDTH / 2;
      break;
    case 'W': // Moving right from left
      x = -length;
      y = CENTER + LANE_WIDTH / 2;
      break;
  }

  return {
    id,
    direction,
    x,
    y,
    speed: maxSpeed,
    maxSpeed,
    length,
    width,
    color,
    type,
    waitTime: 0,
    isWaiting: false,
    hasCrossed: false,
    spawnTime: currentTime
  };
}

export function spawnVehicle(
  direction: Direction,
  scenario: TrafficScenario = 'balanced',
  isEmergency = false
): Vehicle {
  let type: VehicleType = 'car';
  if (isEmergency) {
    type = 'emergency';
  } else {
    const r = Math.random();
    if (r < 0.15) type = 'bus';
  }
  return createVehicle(direction, type, Date.now());
}

export function updateQValue(
  stateKey: string,
  actionIdx: 0 | 1,
  reward: number,
  nextStateKey: string,
  alpha: number,
  gamma: number
) {
  return updateQTable(stateKey, actionIdx, reward, nextStateKey, alpha, gamma);
}

export function calculateReward(
  queueN: number,
  queueS: number,
  queueE: number,
  queueW: number,
  waitTimes: number[],
  hasEmergency: boolean,
  switched: boolean
) {
  const totalQueue = queueN + queueS + queueE + queueW;
  const queuePenalty = -1.5 * totalQueue;
  const avgWait = waitTimes.length > 0 ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0;
  const delayPenalty = -2.0 * avgWait;
  const emergencyBonus = hasEmergency ? 15.0 : 0;
  const switchPenalty = switched ? -3.0 : 0;

  const totalReward = queuePenalty + delayPenalty + emergencyBonus + switchPenalty;

  return {
    totalReward,
    breakdown: {
      queuePenalty,
      delayPenalty,
      emergencyBonus,
      switchPenalty
    }
  };
}

export function updateVehiclesStep(
  vehicles: Vehicle[],
  phase: TrafficPhase,
  deltaSec: number
): { updated: Vehicle[]; passedCount: number; waitTimes: number[] } {
  const isNsGreen = phase === 'NS_GREEN';
  const isEwGreen = phase === 'EW_GREEN';

  let passedCount = 0;
  const waitTimes: number[] = [];

  // Sort vehicles in each direction by distance to stop line so cars ahead block cars behind
  const sorted = [...vehicles].sort((a, b) => {
    if (a.direction === 'N') return b.y - a.y;
    if (a.direction === 'S') return a.y - b.y;
    if (a.direction === 'E') return a.x - b.x;
    return b.x - a.x; // W
  });

  const updated: Vehicle[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const v = { ...sorted[i] };
    const canMoveThrough =
      v.hasCrossed ||
      (v.direction === 'N' && isNsGreen) ||
      (v.direction === 'S' && isNsGreen) ||
      (v.direction === 'E' && isEwGreen) ||
      (v.direction === 'W' && isEwGreen);

    let targetSpeed = v.maxSpeed;
    let shouldStop = false;

    // Check stop line distance
    if (!canMoveThrough) {
      if (v.direction === 'N') {
        const stopY = STOP_LINES.N.y - v.length;
        if (v.y < stopY && v.y + v.speed * deltaSec * 60 >= stopY) {
          shouldStop = true;
          v.y = stopY;
        } else if (v.y >= stopY - 5 && v.y <= stopY + 5) {
          shouldStop = true;
        }
      } else if (v.direction === 'S') {
        const stopY = STOP_LINES.S.y;
        if (v.y > stopY && v.y - v.speed * deltaSec * 60 <= stopY) {
          shouldStop = true;
          v.y = stopY;
        } else if (v.y >= stopY - 5 && v.y <= stopY + 5) {
          shouldStop = true;
        }
      } else if (v.direction === 'E') {
        const stopX = STOP_LINES.E.x;
        if (v.x > stopX && v.x - v.speed * deltaSec * 60 <= stopX) {
          shouldStop = true;
          v.x = stopX;
        } else if (v.x >= stopX - 5 && v.x <= stopX + 5) {
          shouldStop = true;
        }
      } else if (v.direction === 'W') {
        const stopX = STOP_LINES.W.x - v.length;
        if (v.x < stopX && v.x + v.speed * deltaSec * 60 >= stopX) {
          shouldStop = true;
          v.x = stopX;
        } else if (v.x >= stopX - 5 && v.x <= stopX + 5) {
          shouldStop = true;
        }
      }
    }

    // Check car ahead in same lane
    const ahead = updated.find((other) => {
      if (other.direction !== v.direction) return false;
      if (v.direction === 'N') return other.y > v.y && other.y - (v.y + v.length) < 18;
      if (v.direction === 'S') return other.y < v.y && v.y - (other.y + other.length) < 18;
      if (v.direction === 'E') return other.x < v.x && v.x - (other.x + other.length) < 18;
      if (v.direction === 'W') return other.x > v.x && other.x - (v.x + v.length) < 18;
      return false;
    });

    if (ahead) {
      shouldStop = true;
    }

    if (shouldStop) {
      v.speed = 0;
      v.isWaiting = true;
      v.waitTime += deltaSec;
    } else {
      v.speed = targetSpeed;
      v.isWaiting = false;

      // Advance coordinate
      const step = v.speed * deltaSec * 60;
      if (v.direction === 'N') {
        v.y += step;
        if (v.y > STOP_LINES.N.y) v.hasCrossed = true;
      } else if (v.direction === 'S') {
        v.y -= step;
        if (v.y < STOP_LINES.S.y) v.hasCrossed = true;
      } else if (v.direction === 'E') {
        v.x -= step;
        if (v.x < STOP_LINES.E.x) v.hasCrossed = true;
      } else if (v.direction === 'W') {
        v.x += step;
        if (v.x > STOP_LINES.W.x) v.hasCrossed = true;
      }
    }

    // Check if vehicle has cleared intersection bounds
    const isOut =
      v.x < -80 || v.x > CANVAS_SIZE + 80 || v.y < -80 || v.y > CANVAS_SIZE + 80;

    if (isOut) {
      passedCount++;
      waitTimes.push(v.waitTime);
    } else {
      updated.push(v);
    }
  }

  return { updated, passedCount, waitTimes };
}

