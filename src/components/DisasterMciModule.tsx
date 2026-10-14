import React, { useState } from 'react';
import {
  AlertTriangle,
  Siren,
  Users,
  ShieldAlert,
  Flame,
  Building2,
  CheckCircle2,
  Activity,
  Droplet,
  Radio,
  FileText
} from 'lucide-react';
import { EmergencyPatient } from '../types/hems';

interface DisasterMciModuleProps {
  onTriggerMciSurge: (incidentName: string, victimCount: number) => void;
  isMciActive: boolean;
  onClearMci: () => void;
}

export const DisasterMciModule: React.FC<DisasterMciModuleProps> = ({
  onTriggerMciSurge,
  isMciActive,
  onClearMci
}) => {
  const [selectedIncident, setSelectedIncident] = useState('Highway Multi-Vehicle Pileup');
  const [victimCount, setVictimCount] = useState(14);

  const incidents = [
    {
      title: 'Highway 101 Multi-Vehicle Collision',
      type: 'Trauma / Extrication',
      count: 14,
      desc: 'Multi-car and commercial tanker collision with severe vehicular entrapment, blunt polytrauma, and burns.'
    },
    {
      title: 'Industrial Chemical Plant Explosion',
      type: 'Toxic Inhalation & Burns',
      count: 22,
      desc: 'Chlorine and ammonia gas release with thermal blast injuries and acute respiratory distress.'
    },
    {
      title: 'Downtown Transit Train Derailment',
      type: 'Mass PolyTrauma',
      count: 32,
      desc: 'Commuter rail car rollover during morning rush hour with high volume of crush injuries and severe shock.'
    }
  ];

  const handleSimulate = (title: string, count: number) => {
    onTriggerMciSurge(title, count);
  };

  return (
    <div className="space-y-6">
      {/* MCI Alert Status Header */}
      <div className={`p-6 rounded-2xl border shadow-xl transition-all ${
        isMciActive
          ? 'bg-amber-950/90 border-amber-500 shadow-amber-900/40 text-amber-100'
          : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-xl shrink-0 ${
              isMciActive ? 'bg-amber-600 text-slate-950 animate-bounce' : 'bg-slate-800 text-amber-400'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-amber-400">
                  MASS CASUALTY INCIDENT (MCI) & DISASTER OPERATIONS
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                {isMciActive ? 'CODE ORANGE: MASS CASUALTY SURGE DECLARED' : 'Disaster Readiness & Hospital Incident Command (HICS)'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Hospital Incident Command System (HICS) protocol for disaster mobilization, surge capacity expansion, and rapid START field triage tags.
              </p>
            </div>
          </div>

          {isMciActive ? (
            <button
              onClick={onClearMci}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 shadow-lg cursor-pointer"
            >
              Stand Down Code Orange
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>HICS PLAN ON STANDBY</span>
            </div>
          )}
        </div>
      </div>

      {/* START Triage Protocol Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>START Triage Classification Protocol (Field to ED Gate)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* RED TAG */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold font-mono text-red-400 text-sm">RED: IMMEDIATE</span>
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Critical life-threatening injury. RR &gt; 30, no radial pulse, or unable to follow simple commands. Immediate Trauma Bay intake.
            </p>
            <span className="text-[10px] text-red-300 block font-mono font-bold">Goal: Resuscitation &lt; 15 mins</span>
          </div>

          {/* YELLOW TAG */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold font-mono text-amber-400 text-sm">YELLOW: DELAYED</span>
              <span className="w-3 h-3 rounded-full bg-amber-500" />
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Serious injuries, non-ambulatory, but normal perfusion (radial pulse present) and mental status intact.
            </p>
            <span className="text-[10px] text-amber-300 block font-mono font-bold">Goal: Treatment &lt; 60 mins</span>
          </div>

          {/* GREEN TAG */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold font-mono text-emerald-400 text-sm">GREEN: MINOR</span>
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              "Walking wounded". Minor abrasions, fractures, or lacerations. Diverted to secondary outpatient surge clinic.
            </p>
            <span className="text-[10px] text-emerald-300 block font-mono font-bold">Goal: Delayed care / Minor care</span>
          </div>

          {/* BLACK TAG */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold font-mono text-slate-400 text-sm">BLACK: EXPECTANT</span>
              <span className="w-3 h-3 rounded-full bg-slate-600" />
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Deceased or catastrophic injuries incompatible with life under current resource constraints.
            </p>
            <span className="text-[10px] text-slate-500 block font-mono font-bold">Palliative comfort care</span>
          </div>
        </div>
      </div>

      {/* Incident Scenarios Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Simulate Mass Casualty Surge Scenario</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Triggering a disaster scenario tests hospital surge capacity, mobilizes on-call staff, and automatically registers incoming batch victims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {incidents.map((inc, i) => (
            <div
              key={i}
              className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  {inc.type}
                </span>
                <h4 className="font-bold text-slate-100 text-sm">{inc.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{inc.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {inc.count} Victims Expected
                </span>
                <button
                  onClick={() => handleSimulate(inc.title, inc.count)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-md"
                >
                  Activate Code Orange
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
