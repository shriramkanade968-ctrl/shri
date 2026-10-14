import React from 'react';
import { BarChart3, TrendingDown, Gauge, Leaf, Timer, CheckCircle2, AlertCircle } from 'lucide-react';
import { IntersectionMetrics, MetricHistoryPoint, ControllerMode } from '../types/traffic';

interface PerformanceComparisonProps {
  metrics: IntersectionMetrics;
  history: MetricHistoryPoint[];
  currentMode: ControllerMode;
}

export const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({
  metrics,
  history,
  currentMode
}) => {
  // Baseline estimated stats for fixed-time under equal demand:
  const baselineDelay = 24.5;
  const currentDelay = metrics.avgWaitTime;
  const delayDelta = baselineDelay > 0 ? ((baselineDelay - currentDelay) / baselineDelay) * 100 : 0;
  const isBetter = delayDelta > 0;

  // Simple SVG sparkline chart for historical delay
  const maxDelay = Math.max(...history.map((h) => h.avgWaitTime), 30);
  const chartHeight = 80;
  const chartWidth = 400;

  const points = history.length > 1
    ? history
        .map((h, i) => {
          const x = (i / (history.length - 1)) * chartWidth;
          const y = chartHeight - (h.avgWaitTime / maxDelay) * chartHeight;
          return `${x},${Math.max(4, Math.min(chartHeight - 4, y))}`;
        })
        .join(' ')
    : '';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Performance Benchmarks & Environmental Impact
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Active Controller:</span>
          <span className="font-semibold text-emerald-400 uppercase font-mono">{currentMode}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Average Vehicle Delay */}
        <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Avg Vehicle Delay</span>
            <Timer className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-100">
              {metrics.avgWaitTime.toFixed(1)}s
            </span>
            <span className={`text-[11px] font-bold font-mono ${isBetter ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isBetter ? `-${delayDelta.toFixed(0)}%` : `+${Math.abs(delayDelta).toFixed(0)}%`}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">vs Fixed-Time ~24.5s baseline</span>
        </div>

        {/* Total Queue Length */}
        <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Intersection Queue</span>
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-100">
              {metrics.currentQueue.total} cars
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              [N:{metrics.currentQueue.N} S:{metrics.currentQueue.S} E:{metrics.currentQueue.E} W:{metrics.currentQueue.W}]
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">Max delay: {metrics.maxWaitTime.toFixed(0)}s</span>
        </div>

        {/* Throughput */}
        <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Throughput Rate</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400 rotate-180" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {metrics.throughputPerMin}
            </span>
            <span className="text-[11px] text-slate-400">cars / min</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Total cleared: {metrics.totalVehiclesCleared}</span>
        </div>

        {/* CO2 Emissions Avoided */}
        <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>CO₂ Avoided</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {(metrics.co2EmissionsSavedGrams / 1000).toFixed(2)} kg
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">From reduced vehicle idling</span>
        </div>
      </div>

      {/* Delay Timeline Chart */}
      <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            Real-Time Vehicle Delay Trajectory (Seconds per Vehicle)
          </span>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Observed Delay
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-500 inline-block" />
              Fixed Benchmark (24.5s)
            </span>
          </div>
        </div>

        <div className="relative w-full h-[85px] pt-2">
          {history.length > 2 ? (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              {/* Benchmark fixed baseline line */}
              <line
                x1="0"
                y1={chartHeight - (24.5 / maxDelay) * chartHeight}
                x2={chartWidth}
                y2={chartHeight - (24.5 / maxDelay) * chartHeight}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              {/* Observed line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
              Gathering episode delay trajectory data...
            </div>
          )}
        </div>
      </div>

      {/* Comparative Evaluation Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3">Feature Dimension</th>
              <th className="p-3">Traditional Fixed-Time</th>
              <th className="p-3">Actuated (Sensor Loops)</th>
              <th className="p-3 text-emerald-400">Reinforcement Learning (DQN)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 font-medium text-slate-200">Adaptation to Traffic Bursts</td>
              <td className="p-3 text-slate-400">Zero (Static timetable)</td>
              <td className="p-3 text-slate-400">Reactive (Local thresholds)</td>
              <td className="p-3 text-emerald-300 font-semibold">Proactive & Predictive (Learns policy)</td>
            </tr>
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 font-medium text-slate-200">Asymmetric Rush Hour Handling</td>
              <td className="p-3 text-rose-400">Severe Gridlock (Wastes green on empty cross-lanes)</td>
              <td className="p-3 text-amber-400">Moderate (Subject to max-timer timeouts)</td>
              <td className="p-3 text-emerald-300 font-semibold">Optimal (Dynamic arterial allocation)</td>
            </tr>
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 font-medium text-slate-200">Emergency Corridor Preemption</td>
              <td className="p-3 text-slate-400">None (Manual override required)</td>
              <td className="p-3 text-slate-400">Requires dedicated optical sensors</td>
              <td className="p-3 text-emerald-300 font-semibold">Instant Policy Shift via Reward Penalties</td>
            </tr>
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 font-medium text-slate-200">Multi-Intersection Coordination</td>
              <td className="p-3 text-slate-400">Manual Green-Wave offsets</td>
              <td className="p-3 text-slate-400">Isolated per intersection</td>
              <td className="p-3 text-emerald-300 font-semibold">Multi-Agent RL (Shared reward corridors)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
