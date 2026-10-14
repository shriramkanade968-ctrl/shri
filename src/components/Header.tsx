import React from 'react';
import { Radio, Cpu, Activity, BarChart2, BookOpen, Code2, Download } from 'lucide-react';
import { ControllerMode } from '../types/traffic';

interface HeaderProps {
  activeTab: 'sim' | 'theory' | 'code';
  onTabChange: (tab: 'sim' | 'theory' | 'code') => void;
  mode: ControllerMode;
  totalCleared: number;
  simTime: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  mode,
  totalCleared,
  simTime
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black">
            <Radio className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-100">SmartSignal AI</span>
              <span className="text-slate-600 font-mono text-xs">/</span>
              <span className="text-xs font-mono text-emerald-400 font-medium">RL-STSC</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Reinforcement Learning-Based Smart Traffic Signal Control System
            </p>
          </div>
        </div>

        {/* Live Telemetry Status Readout (Clean unboxed typography) */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400 border-x border-slate-800/80 px-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium uppercase">{mode}</span>
          </div>
          <span className="text-slate-700">·</span>
          <div>
            Time: <strong className="text-slate-200">{simTime.toFixed(0)}s</strong>
          </div>
          <span className="text-slate-700">·</span>
          <div>
            Cleared: <strong className="text-emerald-400">{totalCleared}</strong>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('sim')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'sim'
                ? 'bg-slate-800 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulator & Agent
          </button>
          <button
            onClick={() => onTabChange('theory')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'theory'
                ? 'bg-slate-800 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MDP Theory
          </button>
          <button
            onClick={() => onTabChange('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'bg-slate-800 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PyTorch Code
          </button>
          <a
            href="/api/download-traffic-zip"
            download="smart-traffic-signal-rl.zip"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/50 transition-colors ml-2 cursor-pointer"
            title="Download complete project ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Project ZIP</span>
          </a>
        </nav>
      </div>
    </header>
  );
};
