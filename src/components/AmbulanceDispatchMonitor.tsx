import React, { useState } from 'react';
import {
  Truck,
  Clock,
  Radio,
  Siren,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  PhoneCall,
  BedDouble
} from 'lucide-react';
import { AmbulanceUnit } from '../types/hems';

interface AmbulanceDispatchMonitorProps {
  ambulances: AmbulanceUnit[];
  onAddAmbulance: (ambulance: AmbulanceUnit) => void;
  onAssignBay: (ambulanceId: string, bay: string) => void;
  onDivertAmbulance: (ambulanceId: string) => void;
}

export const AmbulanceDispatchMonitor: React.FC<AmbulanceDispatchMonitorProps> = ({
  ambulances,
  onAddAmbulance,
  onAssignBay,
  onDivertAmbulance
}) => {
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [callSign, setCallSign] = useState('MEDIC 7');
  const [complaint, setComplaint] = useState('High-speed motorcycle crash with open femur fracture');
  const [eta, setEta] = useState(8);
  const [age, setAge] = useState(29);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [priority, setPriority] = useState<'Priority 1 (Red)' | 'Priority 2 (Yellow)' | 'Priority 3 (Green)'>('Priority 1 (Red)');

  const handleDispatchNew = (e: React.FormEvent) => {
    e.preventDefault();
    const newUnit: AmbulanceUnit = {
      id: `amb-${Date.now()}`,
      callSign,
      etaMinutes: eta,
      priority,
      chiefComplaint: complaint,
      patientAge: age,
      patientGender: gender,
      vitalsPreview: 'HR: 118, BP: 94/62, SpO2: 94% on oxygen',
      assignedBay: 'Trauma Bay 1 (Standby)',
      paramedicNotes: 'En-route radio report received. IV access secured.',
      isPreArrivalNotified: true
    };
    onAddAmbulance(newUnit);
    setShowDispatchModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <span>Emergency Medical Services (EMS) Inbound Fleet Monitor</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry, radio reports, and trauma bay allocations for approaching ambulance units
          </p>
        </div>

        <button
          onClick={() => setShowDispatchModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Simulate Incoming EMS Unit</span>
        </button>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ambulances.map((amb) => (
          <div
            key={amb.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
                  <Truck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    {amb.callSign}
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">COUNTY 911 EMS REGION</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-black font-mono text-emerald-400 block leading-none">
                  ETA {amb.etaMinutes}m
                </span>
                <span className={`text-[10px] font-bold uppercase mt-0.5 inline-block ${
                  amb.priority.includes('Red') ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {amb.priority}
                </span>
              </div>
            </div>

            {/* Complaint & Demographics */}
            <div className="space-y-1.5">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Patient Demographics:</span>
                <strong className="text-slate-200">{amb.patientAge}yo {amb.patientGender}</strong>
              </div>

              <p className="text-sm font-semibold text-slate-100 leading-snug">
                {amb.chiefComplaint}
              </p>
            </div>

            {/* Vitals Telemetry Preview */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">En-Route Paramedic Vitals:</span>
              <p className="text-emerald-400/90">{amb.vitalsPreview}</p>
              <p className="text-[11px] text-slate-400 font-sans italic pt-1 border-t border-slate-900">
                "{amb.paramedicNotes}"
              </p>
            </div>

            {/* Assigned Receiving Bay & Actions */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <BedDouble className="w-3.5 h-3.5 text-rose-400" />
                <span>Reserved Bay: <strong className="text-rose-300">{amb.assignedBay}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDivertAmbulance(amb.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Divert to Mutual Aid
                </button>
                <button
                  onClick={() => onAssignBay(amb.id, 'Trauma Bay 1 (Locked)')}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Confirm Bay Ready
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              <span>Simulate Inbound EMS Dispatch</span>
            </h3>

            <form onSubmit={handleDispatchNew} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ambulance Call Sign</label>
                <input
                  type="text"
                  required
                  value={callSign}
                  onChange={(e) => setCallSign(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ETA (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={eta}
                    onChange={(e) => setEta(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  >
                    <option value="Priority 1 (Red)">Priority 1 (Red - Emergent)</option>
                    <option value="Priority 2 (Yellow)">Priority 2 (Yellow - Urgent)</option>
                    <option value="Priority 3 (Green)">Priority 3 (Green - Non-urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chief Complaint</label>
                <textarea
                  rows={2}
                  required
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Dispatch Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
