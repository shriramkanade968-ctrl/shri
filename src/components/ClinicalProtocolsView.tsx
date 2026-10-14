import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  HeartPulse,
  Brain,
  Droplet,
  Flame,
  Search,
  Check
} from 'lucide-react';
import { ClinicalProtocol } from '../types/hems';
import { CLINICAL_PROTOCOLS } from '../data/initialHemsData';

export const ClinicalProtocolsView: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<ClinicalProtocol>(CLINICAL_PROTOCOLS[0]);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (stepIdx: number) => {
    const key = `${selectedProtocol.id}-${stepIdx}`;
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getCategoryIcon = (category: ClinicalProtocol['category']) => {
    switch (category) {
      case 'Cardiac':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'Neurology':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'Trauma':
        return <Droplet className="w-4 h-4 text-rose-400" />;
      case 'Infectious':
        return <AlertOctagon className="w-4 h-4 text-amber-400" />;
      default:
        return <Flame className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose-400" />
            <span>Emergency Department Standard Operating Procedures (SOPs)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evidence-based clinical guidelines and time-critical resuscitation pathways
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Protocol Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          {CLINICAL_PROTOCOLS.map((proto) => {
            const isSelected = selectedProtocol.id === proto.id;
            return (
              <div
                key={proto.id}
                onClick={() => setSelectedProtocol(proto)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-rose-500 shadow-md text-white'
                    : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(proto.category)}
                    <span className="font-mono uppercase font-bold text-[10px] text-slate-400">
                      {proto.category}
                    </span>
                  </div>
                  <span className="font-mono text-rose-400 text-[10px] font-bold">
                    &lt; {proto.goldenHourMinutes}m Window
                  </span>
                </div>

                <h4 className="font-bold text-slate-100 text-sm">{proto.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {proto.indication}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Protocol Detailed Interactive Steps (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold mb-1">
                <span>PROTOCOL ACRONYM: {selectedProtocol.acronym}</span>
                <span className="text-slate-700">·</span>
                <span>GOLDEN WINDOW: &lt; {selectedProtocol.goldenHourMinutes} MINUTES</span>
              </div>
              <h3 className="text-lg font-black text-white">{selectedProtocol.title}</h3>
            </div>

            <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 self-start sm:self-auto font-bold">
              Active Clinical Pathway
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-500 uppercase font-bold text-[10px] block mb-0.5">Clinical Indication:</span>
            <p className="text-slate-200 leading-relaxed">{selectedProtocol.indication}</p>
          </div>

          {/* Interactive Steps Checklist */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Ordered Execution Sequence:
            </span>

            <div className="space-y-2.5">
              {selectedProtocol.steps.map((step, idx) => {
                const key = `${selectedProtocol.id}-${idx}`;
                const isChecked = !!completedSteps[key];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-slate-400'
                        : 'bg-slate-950 border-slate-800/90 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0 mt-0.5 border ${
                      isChecked ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="font-mono text-[10px] text-slate-400">{idx + 1}</span>}
                    </div>

                    <div className="flex-1 text-xs leading-relaxed">
                      <span className={isChecked ? 'line-through text-slate-400' : 'text-slate-100 font-medium'}>
                        {step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
