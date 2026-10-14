import React from 'react';
import { Siren, Clock, CheckCircle2, ShieldAlert, XCircle, AlertOctagon } from 'lucide-react';
import { ActiveEmergencyCode } from '../types/hems';

interface EmergencyCodeBannerProps {
  activeCode: ActiveEmergencyCode | null;
  onToggleChecklistItem: (index: number) => void;
  onClearCode: () => void;
}

export const EmergencyCodeBanner: React.FC<EmergencyCodeBannerProps> = ({
  activeCode,
  onToggleChecklistItem,
  onClearCode
}) => {
  if (!activeCode || activeCode.code === 'NONE') return null;

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCodeBlue = activeCode.code === 'CODE_BLUE';
  const isCodeOrange = activeCode.code === 'CODE_ORANGE';

  return (
    <div className={`w-full border-b text-white shadow-2xl transition-all ${
      isCodeBlue
        ? 'bg-blue-950/95 border-blue-500 shadow-blue-900/40'
        : isCodeOrange
        ? 'bg-amber-950/95 border-amber-500 shadow-amber-900/40'
        : 'bg-rose-950/95 border-rose-500 shadow-rose-900/40'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Code Information */}
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl text-white shrink-0 animate-bounce ${
              isCodeBlue ? 'bg-blue-600' : isCodeOrange ? 'bg-amber-600' : 'bg-rose-600'
            }`}>
              <Siren className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-wider uppercase font-bold text-rose-300">
                  CRITICAL HOSPITAL EMERGENCY BROADCAST
                </span>
                <span className="text-slate-400">·</span>
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ELAPSED: {formatElapsed(activeCode.elapsedSeconds)}</span>
                </div>
              </div>

              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                <span>{activeCode.title}</span>
                <span className="text-slate-300 font-normal text-sm">— Location:</span>
                <span className="underline decoration-rose-500 underline-offset-4">{activeCode.location}</span>
              </h2>

              <p className="text-xs text-slate-300 mt-1">
                Dispatched Teams: <strong className="text-white">{activeCode.respondingTeam}</strong>
              </p>
            </div>
          </div>

          {/* Quick Checklist & Stand-down Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Stat Response Checklist:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeCode.checklist.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onToggleChecklistItem(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      item.completed
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300 line-through opacity-85'
                        : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <CheckCircle2 className={`w-3 h-3 ${item.completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.item}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onClearCode}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Stand Down / Clear Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
