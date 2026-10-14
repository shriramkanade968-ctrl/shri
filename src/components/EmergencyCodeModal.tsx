import React, { useState } from 'react';
import {
  Siren,
  X,
  AlertTriangle,
  Flame,
  HeartPulse,
  Droplet,
  Brain,
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { EmergencyCodeType, ActiveEmergencyCode } from '../types/hems';

interface EmergencyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeclareCode: (code: ActiveEmergencyCode) => void;
}

export const EmergencyCodeModal: React.FC<EmergencyCodeModalProps> = ({
  isOpen,
  onClose,
  onDeclareCode
}) => {
  const [selectedCode, setSelectedCode] = useState<EmergencyCodeType>('CODE_BLUE');
  const [location, setLocation] = useState('Trauma Bay 1');

  if (!isOpen) return null;

  const codePresets = [
    {
      type: 'CODE_BLUE' as EmergencyCodeType,
      title: 'CODE BLUE: Cardiac / Respiratory Arrest',
      color: 'bg-blue-600',
      desc: 'Immediate dispatch of Code Blue Resus Team, Anesthesia, and Critical Care Pharmacist.',
      team: 'Code Blue Medical Response Team & Respiratory Therapy',
      checklist: [
        { item: 'Immediate high-quality chest compressions initiated (100-120 bpm)', completed: true },
        { item: 'Defibrillator pads attached & rhythm analyzed', completed: false },
        { item: 'Bag-Valve-Mask ventilation with 100% O2', completed: false },
        { item: 'IV/IO access secured & Epinephrine 1mg IV prepared', completed: false },
        { item: 'LUCAS chest compression mechanical device deployed', completed: false }
      ]
    },
    {
      type: 'CODE_ORANGE' as EmergencyCodeType,
      title: 'CODE ORANGE: Mass Casualty Incident (MCI)',
      color: 'bg-amber-600',
      desc: 'External disaster or mass casualty event requiring immediate surge mobilization and triage.',
      team: 'Hospital Incident Command System (HICS) & Disaster Surge Teams',
      checklist: [
        { item: 'Establish Emergency Operations Center (EOC)', completed: true },
        { item: 'Deploy START Triage Officer at ambulance intake gate', completed: false },
        { item: 'Activate off-duty trauma surgery & nursing recall', completed: false },
        { item: 'Discharge/transfer stable non-emergent patients', completed: false },
        { item: 'Notify Regional EMS Dispatch Center of hospital surge', completed: false }
      ]
    },
    {
      type: 'MTP_ALERT' as EmergencyCodeType,
      title: 'MTP ALERT: Massive Transfusion Protocol',
      color: 'bg-rose-600',
      desc: 'Exsanguinating life-threatening hemorrhage. Stat uncrossed blood product release.',
      team: 'Blood Bank & Trauma Surgery Resuscitation Lead',
      checklist: [
        { item: 'Blood Bank notified to release MTP Cooler #1 (6 PRBC : 6 FFP : 1 Plt)', completed: true },
        { item: 'Belmont rapid blood infuser primed and warmed to 37°C', completed: false },
        { item: 'Administer Tranexamic Acid (TXA) 1g IV over 10 min', completed: false },
        { item: 'Calcium Gluconate 2g IV push for hypocalcemia prophylaxis', completed: false }
      ]
    },
    {
      type: 'STROKE_ALERT' as EmergencyCodeType,
      title: 'CODE STROKE: Hyperacute Neurovascular Window',
      color: 'bg-purple-600',
      desc: 'Patient presenting with stroke symptoms within 24-hour treatment window.',
      team: 'Stroke Neurologist, Neuro-Interventional Radiology & CT Tech',
      checklist: [
        { item: 'Point-of-care blood glucose checked', completed: true },
        { item: 'Immediate non-contrast Head CT + CT Angiogram', completed: false },
        { item: 'Assess NIH Stroke Scale (NIHSS)', completed: false },
        { item: 'Tenecteplase (TNK) or Thrombectomy suitability determined', completed: false }
      ]
    },
    {
      type: 'CODE_RED' as EmergencyCodeType,
      title: 'CODE RED: Fire / Smoke Detection',
      color: 'bg-red-700',
      desc: 'Fire alarm or smoke observed within facility wings.',
      team: 'Hospital Security, Facilities Engineering & Municipal Fire Department',
      checklist: [
        { item: 'R.A.C.E. Protocol: Rescue patients in immediate danger', completed: true },
        { item: 'Activate fire pull station alarm & call emergency switchboard', completed: false },
        { item: 'Contain smoke by closing all corridor fire doors', completed: false },
        { item: 'Extinguish small flame using P.A.S.S. technique if safe', completed: false }
      ]
    }
  ];

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = codePresets.find((c) => c.type === selectedCode) || codePresets[0];

    // Synthesize audible 2-tone hospital alert chime
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.3); // E5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);

      osc1.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.9);
    } catch {
      // Audio fallback
    }

    const newCode: ActiveEmergencyCode = {
      code: preset.type,
      title: preset.title,
      location,
      declaredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedSeconds: 0,
      respondingTeam: preset.team,
      checklist: preset.checklist
    };

    onDeclareCode(newCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-base">
            <Siren className="w-5 h-5 animate-pulse" />
            <span>Emergency Directorate Code Broadcast</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Emergency Emergency Code
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {codePresets.map((c) => (
                <div
                  key={c.type}
                  onClick={() => setSelectedCode(c.type)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                    selectedCode === c.type
                      ? 'bg-slate-800 border-rose-500 shadow-md text-white'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-100 mb-0.5">
                    <span>{c.title}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Exact Incident Location / Wing
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Trauma Bay 2, 3rd Floor West, ICU Bay 4..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-rose-500"
            />
          </div>

          <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-900/50 flex items-center gap-2 text-xs text-rose-300">
            <Volume2 className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Broadcasting triggers system-wide audible chime and dispatches the on-duty response team.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-900/40 cursor-pointer flex items-center gap-2"
            >
              <Siren className="w-4 h-4" />
              <span>Broadcast Alert Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
