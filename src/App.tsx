import React, { useState } from 'react';
import { FinanceApp } from './components/FinanceApp';
import { TrafficApp } from './components/TrafficApp';
import { HemsApp } from './components/HemsApp';
import { Bot, TrafficCone, Hospital, Sparkles, Download, Layers } from 'lucide-react';

export type ActiveProject = 'finance' | 'traffic' | 'hems';

export const App: React.FC = () => {
  // Default to Personal Finance Advisor Bot
  const [activeProject, setActiveProject] = useState<ActiveProject>('finance');

  const projects = [
    {
      id: 'finance' as ActiveProject,
      name: 'Personal Finance Advisor Bot',
      badge: 'Flask + Gemini AI',
      icon: '💰',
      tagline: '50/30/20 Budgeting · Expense Tracking · Real-Time AI Advisor',
      downloadUrl: '/api/download-zip',
      filename: 'personal-finance-advisor-bot.zip',
    },
    {
      id: 'traffic' as ActiveProject,
      name: 'Smart Traffic Signal RL',
      badge: 'PyTorch + DQN',
      icon: '🚦',
      tagline: 'Deep Q-Network Adaptive Intersection Simulator',
      downloadUrl: '/api/download-traffic-zip',
      filename: 'smart-traffic-signal-rl.zip',
    },
    {
      id: 'hems' as ActiveProject,
      name: 'Hospital Emergency Management',
      badge: 'Level-1 Trauma & MCI',
      icon: '🏥',
      tagline: 'ESI 1-5 Triage Board, Ambulance Fleet & ICU Bed Telemetry',
      downloadUrl: '/api/download-hems-zip',
      filename: 'hems-hospital-emergency-management.zip',
    },
  ];

  const currentProj = projects.find((p) => p.id === activeProject)!;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Global Project Switcher Bar */}
      <div className="bg-slate-950 border-b border-slate-800/90 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Project Hub:</span>
            </span>
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              {projects.map((p) => {
                const isActive = activeProject === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveProject(p.id)}
                    className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span className="hidden sm:inline">{p.name}</span>
                    <span className="sm:hidden">{p.name.split(' ')[0]}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse hidden md:inline" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a
              href={currentProj.downloadUrl}
              download={currentProj.filename}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title={`Download complete source code for ${currentProj.name}`}
            >
              <Download className="w-3 h-3" />
              <span>Download {currentProj.name.split(' ')[0]} ZIP</span>
            </a>
          </div>
        </div>
      </div>

      {/* Render Selected Project View */}
      <div className="flex-1">
        {activeProject === 'finance' && <FinanceApp />}
        {activeProject === 'traffic' && <TrafficApp />}
        {activeProject === 'hems' && <HemsApp />}
      </div>
    </div>
  );
};

export default App;
