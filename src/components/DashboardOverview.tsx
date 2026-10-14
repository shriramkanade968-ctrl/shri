import React from 'react';
import {
  Users,
  HeartPulse,
  BedDouble,
  Activity,
  Truck,
  Droplet,
  Clock,
  ArrowRight,
  AlertCircle,
  Siren,
  PlusCircle,
  Stethoscope,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { EmergencyPatient, HospitalCapacity, AmbulanceUnit, BloodInventoryItem } from '../types/hems';

interface DashboardOverviewProps {
  patients: EmergencyPatient[];
  capacity: HospitalCapacity;
  ambulances: AmbulanceUnit[];
  bloodInventory: BloodInventoryItem[];
  onSelectPatient: (patient: EmergencyPatient) => void;
  onOpenIntakeModal: () => void;
  onNavigateTab: (tab: 'triage' | 'ambulances' | 'mci' | 'resources' | 'protocols') => void;
  onOpenCodeModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  patients,
  capacity,
  ambulances,
  bloodInventory,
  onSelectPatient,
  onOpenIntakeModal,
  onNavigateTab,
  onOpenCodeModal
}) => {
  const criticalCount = patients.filter((p) => p.esiLevel <= 2 && p.status !== 'Discharged').length;
  const waitingCount = patients.filter((p) => p.status === 'Awaiting Triage' || p.location === 'Waiting Room').length;
  const activePatients = patients.filter((p) => p.status !== 'Discharged');

  // Trauma Bays 1 to 6 layout
  const traumaBays = [
    { name: 'Trauma Bay 1', patient: patients.find((p) => p.location === 'Trauma Bay 1') },
    { name: 'Trauma Bay 2', patient: patients.find((p) => p.location === 'Trauma Bay 2') },
    { name: 'Trauma Bay 3', patient: patients.find((p) => p.location === 'Trauma Bay 3') },
    { name: 'Trauma Bay 4', patient: patients.find((p) => p.location === 'Trauma Bay 4') },
    { name: 'Resus Room A', patient: patients.find((p) => p.location === 'Resus Room A') },
    { name: 'CT Scanner 1', patient: patients.find((p) => p.location === 'CT Scanner 1') }
  ];

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

  const oNegBlood = bloodInventory.find((b) => b.type.includes('O Negative'))?.units ?? 8;

  return (
    <div className="space-y-6">
      {/* Top Level Metric Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Active ED Patients */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>Active Patients</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-slate-100">{activePatients.length}</span>
            <span className="text-[11px] text-slate-400">in census</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">{waitingCount} in waiting room</span>
        </div>

        {/* High Acuity ESI 1-2 */}
        <div className="bg-slate-900 border border-rose-900/40 p-3.5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs text-rose-300 mb-1">
            <span>Critical ESI 1-2</span>
            <HeartPulse className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-rose-400">{criticalCount}</span>
            <span className="text-[11px] text-rose-300/80">Immediate</span>
          </div>
          <span className="text-[10px] text-rose-400/70 block mt-0.5">Resus & Emergent care</span>
        </div>

        {/* Trauma Bay Occupancy */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>Trauma Bays</span>
            <BedDouble className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-slate-100">
              {capacity.traumaBays.occupied}/{capacity.traumaBays.total}
            </span>
            <span className="text-[11px] text-amber-400 font-bold">
              {Math.round((capacity.traumaBays.occupied / capacity.traumaBays.total) * 100)}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {capacity.traumaBays.total - capacity.traumaBays.occupied} bay(s) available
          </span>
        </div>

        {/* ICU Bed Capacity */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>ICU Surge Beds</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-slate-100">
              {capacity.icuBeds.occupied}/{capacity.icuBeds.total}
            </span>
            <span className="text-[11px] text-slate-400">Occupied</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Ventilators: {capacity.ventilators.inUse}/{capacity.ventilators.total}
          </span>
        </div>

        {/* Inbound EMS Fleet */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>Inbound Fleet</span>
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-emerald-400">{ambulances.length}</span>
            <span className="text-[11px] text-slate-400">units en route</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 block mt-0.5">
            Nearest ETA: {ambulances[0]?.etaMinutes ?? 0} mins
          </span>
        </div>

        {/* O-Negative Blood Bank */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>O-Neg Blood</span>
            <Droplet className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono ${oNegBlood < 10 ? 'text-rose-400' : 'text-slate-100'}`}>
              {oNegBlood}
            </span>
            <span className="text-[11px] text-slate-400">units</span>
          </div>
          <span className={`text-[10px] font-bold block mt-0.5 ${oNegBlood < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {oNegBlood < 10 ? 'CRITICAL RESERVE' : 'Adequate reserve'}
          </span>
        </div>
      </div>

      {/* Main Operations Grid: Trauma Bays Map & High-Acuity Triage Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trauma Bay & Resus Room Grid (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-rose-400" />
                <span>Level-1 Trauma & Resuscitation Bays Map</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status of critical resuscitation suites</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={onOpenIntakeModal}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Intake Patient</span>
              </button>
            </div>
          </div>

          {/* Bays Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {traumaBays.map((bay, idx) => {
              const pt = bay.patient;
              return (
                <div
                  key={idx}
                  onClick={() => pt && onSelectPatient(pt)}
                  className={`p-3.5 rounded-xl border transition-all text-xs ${
                    pt
                      ? 'bg-slate-950/80 border-slate-700 hover:border-rose-500 cursor-pointer shadow-md'
                      : 'bg-slate-950/30 border-dashed border-slate-800 text-slate-500 flex flex-col justify-center items-center py-6'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="font-bold font-mono text-slate-300">{bay.name}</span>
                    {pt ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getEsiBadge(pt.esiLevel)}`}>
                        ESI {pt.esiLevel}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                        AVAILABLE
                      </span>
                    )}
                  </div>

                  {pt ? (
                    <div className="space-y-1.5">
                      <div>
                        <span className="font-bold text-slate-100 text-sm block truncate">{pt.name}</span>
                        <span className="text-[11px] text-slate-400">{pt.age}yo {pt.gender} · {pt.mrn}</span>
                      </div>

                      <p className="text-[11px] text-rose-300/90 font-medium line-clamp-2 leading-tight">
                        {pt.primaryDiagnosis || pt.chiefComplaint}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>HR: <strong className="text-slate-200">{pt.vitals.heartRate}</strong></span>
                        <span>BP: <strong className="text-slate-200">{pt.vitals.bloodPressureSystolic}/{pt.vitals.bloodPressureDiastolic}</strong></span>
                        <span>SpO₂: <strong className="text-slate-200">{pt.vitals.oxygenSaturation}%</strong></span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 text-center mt-1">Ready for emergent trauma intake</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Department Action Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>OR Suites Active: <strong className="text-slate-200">{capacity.orSuites.active}/{capacity.orSuites.total}</strong></span>
              <span className="text-slate-700">·</span>
              <span>O₂ Pressure: <strong className="text-emerald-400">{capacity.oxygenSupplyPercent}%</strong></span>
            </div>

            <button
              onClick={() => onNavigateTab('triage')}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All 45 ED Acute Beds</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Inbound Fleet & High-Priority Acuity Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Inbound EMS Radar Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Inbound EMS Pre-Arrival Radar ({ambulances.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('ambulances')}
                className="text-[11px] text-emerald-400 hover:underline font-semibold"
              >
                Full Fleet Radar &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {ambulances.slice(0, 3).map((amb) => (
                <div
                  key={amb.id}
                  className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      {amb.callSign}
                    </span>
                    <span className="font-mono text-emerald-400 font-black text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      ETA {amb.etaMinutes} MINS
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium leading-snug">
                    {amb.chiefComplaint}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>{amb.patientAge}yo {amb.patientGender}</span>
                    <span className="text-amber-400 font-semibold">{amb.assignedBay}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Launch Clinical Action Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Emergency Directorate Action Triggers
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenCodeModal}
                className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 hover:bg-rose-900/50 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Siren className="w-3.5 h-3.5 text-rose-400" />
                  <span>Code Blue / Arrest</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Cardiac arrest team dispatch</p>
              </button>

              <button
                onClick={() => onNavigateTab('mci')}
                className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800 hover:bg-amber-900/50 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Declare Code Orange</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Mass casualty disaster protocol</p>
              </button>

              <button
                onClick={() => onNavigateTab('resources')}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-500" />
                  <span>Release MTP Cooler</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Massive blood transfusion</p>
              </button>

              <button
                onClick={() => onNavigateTab('protocols')}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Golden Hour SOPs</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">STEMI, Stroke, Sepsis bundle</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
