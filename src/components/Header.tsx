import React from 'react';
import {
  Activity,
  AlertTriangle,
  Siren,
  Building2,
  Users,
  Truck,
  Droplet,
  FileText,
  Flame,
  Volume2,
  VolumeX,
  HeartPulse
} from 'lucide-react';
import { HospitalCapacity, EmergencyCodeType } from '../types/hems';

interface HeaderProps {
  activeTab: 'command' | 'triage' | 'ambulances' | 'mci' | 'resources' | 'protocols';
  onTabChange: (tab: 'command' | 'triage' | 'ambulances' | 'mci' | 'resources' | 'protocols') => void;
  capacity: HospitalCapacity;
  activeCode: EmergencyCodeType;
  onOpenCodeModal: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  currentTime: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  capacity,
  activeCode,
  onOpenCodeModal,
  audioEnabled,
  onToggleAudio,
  currentTime
}) => {
  const getConditionColor = (cond: HospitalCapacity['hospitalCondition']) => {
    switch (cond) {
      case 'GREEN':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50';
      case 'AMBER':
        return 'text-amber-400 bg-amber-950/60 border-amber-700/50';
      case 'RED':
        return 'text-rose-400 bg-rose-950/60 border-rose-700/50';
      case 'BLACK':
        return 'text-white bg-slate-900 border-red-500 animate-pulse';
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Operational Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-900 text-xs font-mono gap-2">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              ST. JUDE REGIONAL TRAUMA CENTER
            </span>
            <span className="text-slate-700">|</span>
            <span>LEVEL-1 ADULT & PEDIATRIC TRAUMA</span>
            <span className="text-slate-700">|</span>
            <span>ED COMMAND DESK</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div>
              SYS CLOCK: <strong className="text-slate-200">{currentTime}</strong>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <span>HOSPITAL STATUS:</span>
              <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${getConditionColor(capacity.hospitalCondition)}`}>
                CONDITION {capacity.hospitalCondition}
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <button
              onClick={onToggleAudio}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Toggle Alert Audio Chimes"
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px]">ALERTS ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px]">MUTED</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Navigation Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between h-auto md:h-16 py-3 md:py-0 gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-rose-900/30">
              <HeartPulse className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  HEMS COMMAND
                </span>
                <span className="text-slate-700 font-mono">/</span>
                <span className="text-xs font-mono text-rose-400 font-semibold tracking-wide">
                  TRAUMA & MCI SYSTEM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Hospital Emergency Management & Critical Care Operations
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => onTabChange('command')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'command'
                  ? 'bg-slate-800 text-rose-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Operations Hub</span>
            </button>

            <button
              onClick={() => onTabChange('triage')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'triage'
                  ? 'bg-slate-800 text-rose-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Patient Triage (ESI)</span>
            </button>

            <button
              onClick={() => onTabChange('ambulances')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ambulances'
                  ? 'bg-slate-800 text-rose-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Inbound EMS Fleet</span>
            </button>

            <button
              onClick={() => onTabChange('mci')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'mci'
                  ? 'bg-slate-800 text-amber-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>MCI Disaster Ops</span>
            </button>

            <button
              onClick={() => onTabChange('resources')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'resources'
                  ? 'bg-slate-800 text-rose-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Droplet className="w-3.5 h-3.5 text-rose-400" />
              <span>Blood & ICU Beds</span>
            </button>

            <button
              onClick={() => onTabChange('protocols')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'protocols'
                  ? 'bg-slate-800 text-rose-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Clinical SOPs</span>
            </button>

            {/* Emergency Broadcast Trigger */}
            <button
              onClick={onOpenCodeModal}
              className="ml-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-md shadow-rose-900/50 transition-all cursor-pointer animate-pulse"
            >
              <Siren className="w-3.5 h-3.5" />
              <span>BROADCAST CODE</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
