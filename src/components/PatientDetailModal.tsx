import React, { useState } from 'react';
import {
  X,
  HeartPulse,
  Activity,
  Clock,
  ShieldAlert,
  FileText,
  BedDouble,
  UserCheck,
  CheckCircle2,
  Plus,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { EmergencyPatient, PatientLocation, PatientStatus } from '../types/hems';

interface PatientDetailModalProps {
  patient: EmergencyPatient | null;
  onClose: () => void;
  onUpdatePatient: (patientId: string, updates: Partial<EmergencyPatient>) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onUpdatePatient
}) => {
  const [newNote, setNewNote] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<PatientLocation>(patient?.location || 'Acute Bed 1');
  const [selectedStatus, setSelectedStatus] = useState<PatientStatus>(patient?.status || 'Active Treatment');

  if (!patient) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedNote = `${timeStr}: ${newNote.trim()}`;
    const updatedNotes = [...patient.notes, formattedNote];

    onUpdatePatient(patient.id, { notes: updatedNotes });
    setNewNote('');
  };

  const handleLocationChange = (newLoc: PatientLocation) => {
    setSelectedLocation(newLoc);
    onUpdatePatient(patient.id, { location: newLoc });
  };

  const handleStatusChange = (newStat: PatientStatus) => {
    setSelectedStatus(newStat);
    onUpdatePatient(patient.id, { status: newStat });
  };

  const handleToggleProtocol = (protocolName: string) => {
    const exists = patient.activeProtocols.includes(protocolName);
    const updated = exists
      ? patient.activeProtocols.filter((p) => p !== protocolName)
      : [...patient.activeProtocols, protocolName];
    onUpdatePatient(patient.id, { activeProtocols: updated });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                patient.esiLevel === 1
                  ? 'bg-red-500/20 text-red-400 border-red-500/50'
                  : patient.esiLevel === 2
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
              }`}>
                ESI LEVEL {patient.esiLevel}
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-xs text-slate-400">{patient.mrn}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Admitted {patient.arrivalTime} ({patient.minutesInEd}m ago)</span>
            </div>

            <h2 className="text-xl font-bold text-white mt-1">
              {patient.name}
              <span className="text-sm font-normal text-slate-400 ml-2">
                ({patient.age}yo {patient.gender})
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnosis & Complaint */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Chief Complaint & Working Diagnosis</span>
            <span className="text-slate-400 font-mono">Attending: <strong className="text-slate-200">{patient.attendingPhysician}</strong></span>
          </div>
          <p className="text-sm text-slate-100 font-medium">{patient.chiefComplaint}</p>
          {patient.primaryDiagnosis && (
            <div className="text-xs text-rose-300 font-semibold bg-rose-950/40 p-2 rounded-lg border border-rose-900/50">
              Primary Diagnosis: {patient.primaryDiagnosis}
            </div>
          )}
          {patient.isAllergic && (
            <div className="text-xs text-amber-300 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Known Allergies: {patient.allergies}</span>
            </div>
          )}
        </div>

        {/* Vitals Telemetry Box */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Bedside Physiological Telemetry
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Heart Rate</span>
              <span className={`text-base font-bold ${patient.vitals.heartRate > 110 ? 'text-rose-400' : 'text-slate-200'}`}>
                {patient.vitals.heartRate} <span className="text-[10px] text-slate-500">bpm</span>
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
              <span className={`text-base font-bold ${patient.vitals.bloodPressureSystolic < 90 ? 'text-rose-400' : 'text-slate-200'}`}>
                {patient.vitals.bloodPressureSystolic}/{patient.vitals.bloodPressureDiastolic} <span className="text-[10px] text-slate-500">mmHg</span>
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Oxygen Saturation</span>
              <span className={`text-base font-bold ${patient.vitals.oxygenSaturation < 92 ? 'text-rose-400' : 'text-slate-200'}`}>
                {patient.vitals.oxygenSaturation}% <span className="text-[10px] text-slate-500">SpO₂</span>
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Neurological GCS</span>
              <span className={`text-base font-bold ${patient.vitals.glasgowComaScale < 13 ? 'text-amber-400' : 'text-slate-200'}`}>
                {patient.vitals.glasgowComaScale} <span className="text-[10px] text-slate-500">/ 15</span>
              </span>
            </div>
          </div>
        </div>

        {/* Location & Status Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Transfer Bed / Bay</label>
            <select
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value as PatientLocation)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
            >
              <option value="Trauma Bay 1">Trauma Bay 1 (Level 1 Resus)</option>
              <option value="Trauma Bay 2">Trauma Bay 2 (Level 1 Resus)</option>
              <option value="Resus Room A">Resus Room A</option>
              <option value="CT Scanner 1">CT Scanner 1 (Imaging)</option>
              <option value="OR Suite 1">OR Suite 1 (Emergency Surgery)</option>
              <option value="ICU Bay 1">ICU Bay 1 (Intensive Care)</option>
              <option value="Acute Bed 1">Acute Bed 1</option>
              <option value="Acute Bed 2">Acute Bed 2</option>
              <option value="Pediatric ED 1">Pediatric ED 1</option>
              <option value="Waiting Room">Waiting Room</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Acuity Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value as PatientStatus)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
            >
              <option value="Immediate Resuscitation">Immediate Resuscitation</option>
              <option value="Active Treatment">Active Treatment</option>
              <option value="Awaiting Diagnostics (CT/X-Ray)">Awaiting Diagnostics</option>
              <option value="OR Transfer Pending">OR Transfer Pending</option>
              <option value="ICU Admission Pending">ICU Admission Pending</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>
        </div>

        {/* Active Protocols Toggle Chips */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Emergency Care Protocols:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {['STEMI Code Active', 'Code Stroke Alert', 'Massive Transfusion Protocol (MTP)', 'Sepsis Hour-1 Bundle', 'Trauma Alert'].map((proto) => {
              const active = patient.activeProtocols.includes(proto);
              return (
                <button
                  key={proto}
                  onClick={() => handleToggleProtocol(proto)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                    active
                      ? 'bg-rose-950/80 border-rose-600 text-rose-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {active ? '✓ ' : '+ '}{proto}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clinical Notes Timeline */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Clinical Handover & Shift Notes ({patient.notes.length})
          </span>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto space-y-1.5 text-xs text-slate-300">
            {patient.notes.map((note, i) => (
              <div key={i} className="border-l-2 border-rose-500/70 pl-2 py-0.5 leading-relaxed">
                {note}
              </div>
            ))}
          </div>

          {/* Add note input */}
          <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add physician order or nursing handover note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Post Note
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
