import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Clock,
  HeartPulse,
  Activity,
  AlertCircle,
  BedDouble,
  FileText,
  CheckCircle2,
  X,
  Stethoscope,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { EmergencyPatient, EsiLevel, PatientLocation, PatientStatus, PatientVitals } from '../types/hems';

interface PatientTriageBoardProps {
  patients: EmergencyPatient[];
  onSelectPatient: (patient: EmergencyPatient) => void;
  onAddPatient: (patient: EmergencyPatient) => void;
  onUpdatePatient: (patientId: string, updates: Partial<EmergencyPatient>) => void;
  showIntakeModal: boolean;
  onCloseIntakeModal: () => void;
  onOpenIntakeModal: () => void;
}

export const PatientTriageBoard: React.FC<PatientTriageBoardProps> = ({
  patients,
  onSelectPatient,
  onAddPatient,
  onUpdatePatient,
  showIntakeModal,
  onCloseIntakeModal,
  onOpenIntakeModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEsiFilter, setSelectedEsiFilter] = useState<number | 'ALL'>('ALL');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('ALL');

  // Intake Form State
  const [intakeName, setIntakeName] = useState('');
  const [intakeAge, setIntakeAge] = useState<number>(45);
  const [intakeGender, setIntakeGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [intakeComplaint, setIntakeComplaint] = useState('');
  const [intakeLocation, setIntakeLocation] = useState<PatientLocation>('Acute Bed 1');
  const [intakeHr, setIntakeHr] = useState<number>(85);
  const [intakeBpSys, setIntakeBpSys] = useState<number>(120);
  const [intakeBpDia, setIntakeBpDia] = useState<number>(80);
  const [intakeSpo2, setIntakeSpo2] = useState<number>(98);
  const [intakeRr, setIntakeRr] = useState<number>(16);
  const [intakeTemp, setIntakeTemp] = useState<number>(37.0);
  const [intakeGcs, setIntakeGcs] = useState<number>(15);

  // Auto-calculated ESI triage score based on vitals and complaint
  const calculateEsiScore = (): EsiLevel => {
    if (intakeGcs <= 8 || intakeSpo2 < 90 || intakeBpSys < 85 || intakeHr > 135) {
      return 1; // Immediate Resuscitation
    }
    const lower = intakeComplaint.toLowerCase();
    if (
      lower.includes('chest pain') ||
      lower.includes('stroke') ||
      lower.includes('weakness') ||
      lower.includes('overdose') ||
      lower.includes('severe pain') ||
      intakeBpSys > 185 ||
      intakeHr > 115
    ) {
      return 2; // Emergent
    }
    if (lower.includes('fracture') || lower.includes('abdominal') || lower.includes('fever') || lower.includes('asthma')) {
      return 3; // Urgent
    }
    if (lower.includes('laceration') || lower.includes('sprain') || lower.includes('cut')) {
      return 4; // Less Urgent
    }
    return 5; // Non-Urgent
  };

  const recommendedEsi = calculateEsiScore();

  const handleCreatePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeName.trim() || !intakeComplaint.trim()) return;

    const mrnRandom = Math.floor(100000 + Math.random() * 900000);
    const newPatient: EmergencyPatient = {
      id: `pt-${Date.now()}`,
      mrn: `MRN-${mrnRandom}`,
      name: intakeName.trim(),
      age: intakeAge,
      gender: intakeGender,
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      minutesInEd: 0,
      esiLevel: recommendedEsi,
      chiefComplaint: intakeComplaint.trim(),
      location: intakeLocation,
      status: recommendedEsi === 1 ? 'Immediate Resuscitation' : 'Triage In Progress',
      vitals: {
        heartRate: intakeHr,
        bloodPressureSystolic: intakeBpSys,
        bloodPressureDiastolic: intakeBpDia,
        oxygenSaturation: intakeSpo2,
        respiratoryRate: intakeRr,
        temperatureCelsius: intakeTemp,
        glasgowComaScale: intakeGcs
      },
      attendingPhysician: 'Dr. Sarah Lin, MD (On Duty)',
      primaryNurse: 'Triage Nurse Desk',
      isAllergic: false,
      activeProtocols: recommendedEsi === 1 ? ['Code Resus Protocol'] : [],
      notes: [`${new Date().toLocaleTimeString()}: Admitted via Emergency Triage with ESI Level ${recommendedEsi}.`]
    };

    onAddPatient(newPatient);
    onCloseIntakeModal();
    // Reset form
    setIntakeName('');
    setIntakeComplaint('');
  };

  // Filter patients
  const filteredPatients = patients.filter((pt) => {
    if (selectedEsiFilter !== 'ALL' && pt.esiLevel !== selectedEsiFilter) return false;
    if (selectedLocationFilter !== 'ALL' && !pt.location.includes(selectedLocationFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        pt.name.toLowerCase().includes(q) ||
        pt.mrn.toLowerCase().includes(q) ||
        pt.chiefComplaint.toLowerCase().includes(q) ||
        (pt.primaryDiagnosis && pt.primaryDiagnosis.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getEsiBadge = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 2:
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 3:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 4:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Triage Acuity Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-400" />
              <span>Emergency Patient Triage & Tracking Board</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live tracking by Emergency Severity Index (ESI 1-5) and trauma bay assignment
            </p>
          </div>

          <button
            onClick={onOpenIntakeModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Intake Emergency Patient</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, MRN, Chief Complaint, or Diagnosis..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-rose-500"
            />
          </div>

          {/* ESI Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setSelectedEsiFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedEsiFilter === 'ALL'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Acuity
            </button>
            <button
              onClick={() => setSelectedEsiFilter(1)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedEsiFilter === 1
                  ? 'bg-red-950 text-red-300 border border-red-700'
                  : 'text-red-400 hover:bg-slate-900'
              }`}
            >
              ESI 1 (Resus)
            </button>
            <button
              onClick={() => setSelectedEsiFilter(2)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedEsiFilter === 2
                  ? 'bg-orange-950 text-orange-300 border border-orange-700'
                  : 'text-orange-400 hover:bg-slate-900'
              }`}
            >
              ESI 2 (Emergent)
            </button>
            <button
              onClick={() => setSelectedEsiFilter(3)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedEsiFilter === 3
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'text-amber-400 hover:bg-slate-900'
              }`}
            >
              ESI 3 (Urgent)
            </button>
            <button
              onClick={() => setSelectedEsiFilter(4)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedEsiFilter === 4
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'text-emerald-400 hover:bg-slate-900'
              }`}
            >
              ESI 4-5
            </button>
          </div>
        </div>
      </div>

      {/* Patient Triage Grid / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Acuity</th>
                <th className="p-3.5">Patient / MRN</th>
                <th className="p-3.5">Chief Complaint & Diagnosis</th>
                <th className="p-3.5">Current Location</th>
                <th className="p-3.5">Key Vitals</th>
                <th className="p-3.5">Status & Time</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredPatients.map((pt) => (
                <tr
                  key={pt.id}
                  onClick={() => onSelectPatient(pt)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  {/* Acuity */}
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getEsiBadge(pt.esiLevel)}`}>
                      ESI {pt.esiLevel}
                    </span>
                  </td>

                  {/* Patient Info */}
                  <td className="p-3.5 whitespace-nowrap">
                    <strong className="text-slate-100 font-bold block text-sm">{pt.name}</strong>
                    <span className="text-[11px] font-mono text-slate-400">{pt.mrn} · {pt.age}yo {pt.gender}</span>
                  </td>

                  {/* Chief Complaint */}
                  <td className="p-3.5 max-w-xs">
                    <p className="font-medium text-slate-200 line-clamp-1">{pt.chiefComplaint}</p>
                    {pt.primaryDiagnosis && (
                      <span className="text-[11px] text-rose-300 font-semibold block line-clamp-1 mt-0.5">
                        Dx: {pt.primaryDiagnosis}
                      </span>
                    )}
                    {pt.activeProtocols.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {pt.activeProtocols.map((pr, i) => (
                          <span key={i} className="text-[10px] bg-rose-950/80 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800/60 font-mono">
                            {pr}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Location */}
                  <td className="p-3.5 whitespace-nowrap font-mono text-xs">
                    <span className="font-semibold text-slate-200 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {pt.location}
                    </span>
                  </td>

                  {/* Vitals */}
                  <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-slate-300">
                    <div>
                      HR: <strong className={pt.vitals.heartRate > 110 ? 'text-rose-400' : 'text-slate-100'}>{pt.vitals.heartRate}</strong> | 
                      BP: <strong className={pt.vitals.bloodPressureSystolic < 90 ? 'text-rose-400' : 'text-slate-100'}>{pt.vitals.bloodPressureSystolic}/{pt.vitals.bloodPressureDiastolic}</strong>
                    </div>
                    <div>
                      SpO₂: <strong className={pt.vitals.oxygenSaturation < 92 ? 'text-rose-400' : 'text-slate-100'}>{pt.vitals.oxygenSaturation}%</strong> | 
                      GCS: <strong className={pt.vitals.glasgowComaScale < 12 ? 'text-rose-400' : 'text-slate-100'}>{pt.vitals.glasgowComaScale}</strong>
                    </div>
                  </td>

                  {/* Status & Time */}
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-200 block text-xs">{pt.status}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{pt.minutesInEd}m in ED ({pt.arrivalTime})</span>
                    </span>
                  </td>

                  {/* Action */}
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(pt);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      Open Chart &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intake & Triage Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-rose-500" />
                  <span>Intake & Triage New Emergency Patient</span>
                </h3>
                <p className="text-xs text-slate-400">Emergency Department registration with automated ESI triage scoring</p>
              </div>
              <button
                onClick={onCloseIntakeModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatientSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jonathan Blake"
                    value={intakeName}
                    onChange={(e) => setIntakeName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={intakeAge}
                    onChange={(e) => setIntakeAge(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                  <select
                    value={intakeGender}
                    onChange={(e) => setIntakeGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Location / Bay</label>
                  <select
                    value={intakeLocation}
                    onChange={(e) => setIntakeLocation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none"
                  >
                    <option value="Trauma Bay 1">Trauma Bay 1 (Emergent)</option>
                    <option value="Trauma Bay 2">Trauma Bay 2 (Emergent)</option>
                    <option value="Resus Room A">Resus Room A (Cardiac)</option>
                    <option value="Acute Bed 1">Acute Bed 1</option>
                    <option value="Acute Bed 2">Acute Bed 2</option>
                    <option value="Pediatric ED 1">Pediatric ED 1</option>
                    <option value="Waiting Room">Waiting Room</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chief Complaint & Onset</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Sudden severe headache with neck stiffness, photophobia, fever since morning..."
                  value={intakeComplaint}
                  onChange={(e) => setIntakeComplaint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-rose-500"
                />
              </div>

              {/* Vitals Input Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Initial Triage Vitals
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">HR (bpm)</span>
                    <input
                      type="number"
                      value={intakeHr}
                      onChange={(e) => setIntakeHr(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Sys BP</span>
                    <input
                      type="number"
                      value={intakeBpSys}
                      onChange={(e) => setIntakeBpSys(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Dia BP</span>
                    <input
                      type="number"
                      value={intakeBpDia}
                      onChange={(e) => setIntakeBpDia(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">SpO₂ (%)</span>
                    <input
                      type="number"
                      value={intakeSpo2}
                      onChange={(e) => setIntakeSpo2(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">RR (/min)</span>
                    <input
                      type="number"
                      value={intakeRr}
                      onChange={(e) => setIntakeRr(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">GCS (3-15)</span>
                    <input
                      type="number"
                      value={intakeGcs}
                      onChange={(e) => setIntakeGcs(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Triage Calculator Recommendation Banner */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                    Algorithmic Triage Score (ESI):
                  </span>
                  <span className="text-xs text-slate-300">
                    {recommendedEsi === 1 && 'Level 1: Unstable Vitals / Immediate Resuscitation required'}
                    {recommendedEsi === 2 && 'Level 2: High Risk / Emergent condition (assess < 10 mins)'}
                    {recommendedEsi === 3 && 'Level 3: Urgent / Multiple diagnostic resources needed'}
                    {recommendedEsi >= 4 && 'Level 4-5: Less Urgent / Single resource requirement'}
                  </span>
                </div>

                <span className={`px-3 py-1 rounded-lg font-black text-sm border font-mono ${getEsiBadge(recommendedEsi)}`}>
                  ESI LEVEL {recommendedEsi}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onCloseIntakeModal}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-900/30 cursor-pointer"
                >
                  Register & Admit Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
