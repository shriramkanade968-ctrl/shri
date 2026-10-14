import React, { useEffect, useRef } from 'react';
import { Vehicle, TrafficPhase, Direction } from '../types/traffic';
import { CANVAS_SIZE, ROAD_WIDTH, LANE_WIDTH, CENTER, STOP_LINES } from '../utils/trafficEngine';

interface TrafficCanvasProps {
  vehicles: Vehicle[];
  phase: TrafficPhase;
  phaseElapsed: number;
  queueCounts: { N: number; S: number; E: number; W: number };
  emergencyActive: boolean;
}

export const TrafficCanvas: React.FC<TrafficCanvasProps> = ({
  vehicles,
  phase,
  phaseElapsed,
  queueCounts,
  emergencyActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    ctx.scale(dpr, dpr);

    // 1. Draw Background (Sidewalks, green turf, urban curbs)
    ctx.fillStyle = '#0f172a'; // Deep slate background
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Green grass lawn corners
    ctx.fillStyle = '#14532d'; // Dark forest green
    ctx.fillRect(0, 0, CENTER - ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2);
    ctx.fillRect(CENTER + ROAD_WIDTH / 2, 0, CENTER - ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2);
    ctx.fillRect(0, CENTER + ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2);
    ctx.fillRect(CENTER + ROAD_WIDTH / 2, CENTER + ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2);

    // Sidewalk border lines
    ctx.fillStyle = '#1e293b'; // Slate 800 curbs
    const curbW = 10;
    // Top-left curb
    ctx.fillRect(CENTER - ROAD_WIDTH / 2 - curbW, 0, curbW, CENTER - ROAD_WIDTH / 2);
    ctx.fillRect(0, CENTER - ROAD_WIDTH / 2 - curbW, CENTER - ROAD_WIDTH / 2, curbW);
    // Top-right curb
    ctx.fillRect(CENTER + ROAD_WIDTH / 2, 0, curbW, CENTER - ROAD_WIDTH / 2);
    ctx.fillRect(CENTER + ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2 - curbW, CENTER - ROAD_WIDTH / 2, curbW);
    // Bottom-left curb
    ctx.fillRect(CENTER - ROAD_WIDTH / 2 - curbW, CENTER + ROAD_WIDTH / 2, curbW, CENTER - ROAD_WIDTH / 2);
    ctx.fillRect(0, CENTER + ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2, curbW);
    // Bottom-right curb
    ctx.fillRect(CENTER + ROAD_WIDTH / 2, CENTER + ROAD_WIDTH / 2, curbW, CENTER - ROAD_WIDTH / 2);
    ctx.fillRect(CENTER + ROAD_WIDTH / 2, CENTER + ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2, curbW);

    // 2. Draw Asphalt Roads
    ctx.fillStyle = '#1e293b'; // Dark asphalt
    // North-South road
    ctx.fillRect(CENTER - ROAD_WIDTH / 2, 0, ROAD_WIDTH, CANVAS_SIZE);
    // East-West road
    ctx.fillRect(0, CENTER - ROAD_WIDTH / 2, CANVAS_SIZE, ROAD_WIDTH);

    // Intersection box
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(CENTER - ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2, ROAD_WIDTH, ROAD_WIDTH);

    // 3. Road Markings & Dashed Center Dividers
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);

    // North approach center divider
    ctx.beginPath();
    ctx.moveTo(CENTER, 0);
    ctx.lineTo(CENTER, CENTER - ROAD_WIDTH / 2);
    ctx.stroke();

    // South approach center divider
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER + ROAD_WIDTH / 2);
    ctx.lineTo(CENTER, CANVAS_SIZE);
    ctx.stroke();

    // West approach center divider
    ctx.beginPath();
    ctx.moveTo(0, CENTER);
    ctx.lineTo(CENTER - ROAD_WIDTH / 2, CENTER);
    ctx.stroke();

    // East approach center divider
    ctx.beginPath();
    ctx.moveTo(CENTER + ROAD_WIDTH / 2, CENTER);
    ctx.lineTo(CANVAS_SIZE, CENTER);
    ctx.stroke();

    ctx.setLineDash([]); // Reset dash

    // 4. White Stop Lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;

    // North stop line (for incoming south-bound traffic)
    ctx.beginPath();
    ctx.moveTo(CENTER - ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2);
    ctx.lineTo(CENTER, CENTER - ROAD_WIDTH / 2);
    ctx.stroke();

    // South stop line (for incoming north-bound traffic)
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER + ROAD_WIDTH / 2);
    ctx.lineTo(CENTER + ROAD_WIDTH / 2, CENTER + ROAD_WIDTH / 2);
    ctx.stroke();

    // East stop line (for incoming west-bound traffic)
    ctx.beginPath();
    ctx.moveTo(CENTER + ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2);
    ctx.lineTo(CENTER + ROAD_WIDTH / 2, CENTER);
    ctx.stroke();

    // West stop line (for incoming east-bound traffic)
    ctx.beginPath();
    ctx.moveTo(CENTER - ROAD_WIDTH / 2, CENTER);
    ctx.lineTo(CENTER - ROAD_WIDTH / 2, CENTER + ROAD_WIDTH / 2);
    ctx.stroke();

    // 5. Crosswalks (Zebra stripes)
    const drawCrosswalk = (startX: number, startY: number, w: number, h: number, horizontal: boolean) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      const stripes = 8;
      for (let i = 0; i < stripes; i++) {
        if (horizontal) {
          ctx.fillRect(startX + (i * w) / stripes, startY, w / stripes - 4, h);
        } else {
          ctx.fillRect(startX, startY + (i * h) / stripes, w, h / stripes - 4);
        }
      }
    };

    // North crosswalk
    drawCrosswalk(CENTER - ROAD_WIDTH / 2, CENTER - ROAD_WIDTH / 2 - 20, ROAD_WIDTH, 14, true);
    // South crosswalk
    drawCrosswalk(CENTER - ROAD_WIDTH / 2, CENTER + ROAD_WIDTH / 2 + 6, ROAD_WIDTH, 14, true);
    // West crosswalk
    drawCrosswalk(CENTER - ROAD_WIDTH / 2 - 20, CENTER - ROAD_WIDTH / 2, 14, ROAD_WIDTH, false);
    // East crosswalk
    drawCrosswalk(CENTER + ROAD_WIDTH / 2 + 6, CENTER - ROAD_WIDTH / 2, 14, ROAD_WIDTH, false);

    // 6. Draw Traffic Light Heads
    const isNsGreen = phase === 'NS_GREEN';
    const isNsYellow = phase === 'NS_YELLOW';
    const isEwGreen = phase === 'EW_GREEN';
    const isEwYellow = phase === 'EW_YELLOW';

    const drawSignal = (x: number, y: number, state: 'red' | 'yellow' | 'green', label: string) => {
      // Housing
      ctx.fillStyle = '#020617'; // Almost black housing
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x - 10, y - 24, 20, 48, 6);
      ctx.fill();
      ctx.stroke();

      // Red bulb
      ctx.fillStyle = state === 'red' ? '#ef4444' : '#450a0a';
      if (state === 'red') {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.arc(x, y - 14, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Yellow bulb
      ctx.fillStyle = state === 'yellow' ? '#f59e0b' : '#451a03';
      if (state === 'yellow') {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.arc(x, y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Green bulb
      ctx.fillStyle = state === 'green' ? '#10b981' : '#022c22';
      if (state === 'green') {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.arc(x, y + 14, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Small direction label
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 33);
    };

    // North approach signal (facing South)
    drawSignal(CENTER - ROAD_WIDTH / 2 - 16, CENTER - ROAD_WIDTH / 2 - 35, isNsGreen ? 'green' : isNsYellow ? 'yellow' : 'red', 'N');
    // South approach signal (facing North)
    drawSignal(CENTER + ROAD_WIDTH / 2 + 16, CENTER + ROAD_WIDTH / 2 + 35, isNsGreen ? 'green' : isNsYellow ? 'yellow' : 'red', 'S');
    // East approach signal (facing West)
    drawSignal(CENTER + ROAD_WIDTH / 2 + 35, CENTER - ROAD_WIDTH / 2 - 16, isEwGreen ? 'green' : isEwYellow ? 'yellow' : 'red', 'E');
    // West approach signal (facing East)
    drawSignal(CENTER - ROAD_WIDTH / 2 - 35, CENTER + ROAD_WIDTH / 2 + 16, isEwGreen ? 'green' : isEwYellow ? 'yellow' : 'red', 'W');

    // 7. Draw Vehicles
    vehicles.forEach((veh) => {
      ctx.save();
      ctx.translate(veh.x, veh.y);

      // Rotate based on direction
      let angle = 0;
      if (veh.direction === 'N') angle = Math.PI / 2;     // Moving down
      else if (veh.direction === 'S') angle = -Math.PI / 2; // Moving up
      else if (veh.direction === 'E') angle = Math.PI;    // Moving left
      else if (veh.direction === 'W') angle = 0;           // Moving right

      ctx.rotate(angle);

      // Vehicle shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(-veh.length / 2 + 2, -veh.width / 2 + 2, veh.length, veh.width, 4);
      ctx.fill();

      // Vehicle body
      ctx.fillStyle = veh.color;
      ctx.beginPath();
      ctx.roundRect(-veh.length / 2, -veh.width / 2, veh.length, veh.width, 4);
      ctx.fill();

      // Windshield & Roof
      ctx.fillStyle = '#0f172a';
      // Front windshield
      ctx.fillRect(-veh.length / 4, -veh.width / 2 + 2, veh.length / 5, veh.width - 4);
      // Roof
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(-veh.length / 8, -veh.width / 2 + 3, veh.length / 2.5, veh.width - 6);

      // Headlights (facing right in local coordinate system)
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(veh.length / 2 - 2, -veh.width / 2 + 2, 2, 3);
      ctx.fillRect(veh.length / 2 - 2, veh.width / 2 - 5, 2, 3);

      // Brake lights (facing left)
      ctx.fillStyle = veh.speed < 0.5 ? '#ef4444' : '#7f1d1d';
      ctx.fillRect(-veh.length / 2, -veh.width / 2 + 2, 2, 3);
      ctx.fillRect(-veh.length / 2, veh.width / 2 - 5, 2, 3);

      // Emergency Ambulance special beacon & siren
      if (veh.type === 'emergency') {
        const timeFactor = Math.floor(Date.now() / 150) % 2;
        ctx.fillStyle = timeFactor === 0 ? '#38bdf8' : '#ef4444';
        ctx.shadowColor = timeFactor === 0 ? '#38bdf8' : '#ef4444';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // White cross on roof
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1.5, -4, 3, 8);
        ctx.fillRect(-4, -1.5, 8, 3);
      }

      ctx.restore();

      // Wait time indicator if car has been waiting > 4s
      if (veh.waitTime > 4 && !veh.hasCrossed) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        const text = `${Math.round(veh.waitTime)}s`;
        ctx.font = 'bold 9px monospace';
        const txtW = ctx.measureText(text).width;
        ctx.beginPath();
        ctx.roundRect(veh.x - txtW / 2 - 4, veh.y - 18, txtW + 8, 12, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fca5a5';
        ctx.textAlign = 'center';
        ctx.fillText(text, veh.x, veh.y - 9);
      }
    });

    // 8. Queue Count Badges at Approach Ends
    const drawQueueBadge = (x: number, y: number, count: number, label: string) => {
      ctx.fillStyle = count > 5 ? '#ef4444' : count > 2 ? '#f59e0b' : '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(x - 28, y - 10, 56, 20, 6);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${label}: ${count} cars`, x, y + 4);
    };

    drawQueueBadge(CENTER - LANE_WIDTH / 2, 24, queueCounts.N, 'N');
    drawQueueBadge(CENTER + LANE_WIDTH / 2, CANVAS_SIZE - 24, queueCounts.S, 'S');
    drawQueueBadge(CANVAS_SIZE - 36, CENTER - LANE_WIDTH / 2, queueCounts.E, 'E');
    drawQueueBadge(36, CENTER + LANE_WIDTH / 2, queueCounts.W, 'W');

    // 9. Center HUD: Current Phase Timer & Active Corridor
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(CENTER - 45, CENTER - 18, 90, 36, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = phase.includes('GREEN') ? '#10b981' : '#f59e0b';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    const phaseLabel = phase.startsWith('NS') ? 'N-S ' : 'E-W ';
    const colorLabel = phase.includes('GREEN') ? 'GRN' : 'YEL';
    ctx.fillText(`${phaseLabel}${colorLabel}`, CENTER, CENTER - 2);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`${phaseElapsed.toFixed(1)}s`, CENTER, CENTER + 11);

  }, [vehicles, phase, phaseElapsed, queueCounts, emergencyActive]);

  return (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
        className="block"
      />
    </div>
  );
};
