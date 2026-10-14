import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EmergencyCodeBanner } from './components/EmergencyCodeBanner';
import { DashboardOverview } from './components/DashboardOverview';
import { PatientTriageBoard } from './components/PatientTriageBoard';
import { PatientDetailModal } from './components/PatientDetailModal';
import { AmbulanceDispatchMonitor } from './components/AmbulanceDispatchMonitor';
import { DisasterMciModule } from './components/DisasterMciModule';
import { ResourceInventory } from './components/ResourceInventory';
import { ClinicalProtocolsView } from './components/ClinicalProtocolsView';
import { EmergencyCodeModal } from './components/EmergencyCodeModal';
import {
  EmergencyPatient,
  HospitalCapacity,
  AmbulanceUnit,
  BloodInventoryItem,
  ActiveEmergencyCode,
  EsiLevel
} from './types/hems';
import {
  INITIAL_PATIENTS,
  INITIAL_CAPACITY,
  INITIAL_AMBULANCES,
  INITIAL_BLOOD_INVENTORY
} from './data/initialHemsData';
import { Download, HeartPulse, ShieldAlert, Siren, Building2 } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'command' | 'triage' | 'ambulances' | 'mci' | 'resources' | 'protocols'>('command');

  // Core Data State
  const [patients, setPatients] = useState<EmergencyPatient[]>(INITIAL_PATIENTS);
  const [capacity, setCapacity] = useState<HospitalCapacity>(INITIAL_CAPACITY);
  const [ambulances, setAmbulances] = useState<AmbulanceUnit[]>(INITIAL_AMBULANCES);
  const [bloodInventory, setBloodInventory] = useState<BloodInventoryItem[]>(INITIAL_BLOOD_INVENTORY);

  // Active Emergency Code Broadcast State
  const [activeCode, setActiveCode] = useState<ActiveEmergencyCode | null>(null);
  const [isMciActive, setIsMciActive] = useState<boolean>(false);

  // Modals & Drawers
  const [selectedPatient, setSelectedPatient] = useState<EmergencyPatient | null>(null);
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Live Real-Time Clock
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      // Increment active code timer
      if (activeCode) {
        setActiveCode((prev) => (prev ? { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 } : null));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCode]);

  // Periodic Ambulance ETA countdown
  useEffect(() => {
    const etaInterval = setInterval(() => {
      setAmbulances((prev) =>
        prev.map((amb) => {
          if (amb.etaMinutes > 1) {
            return { ...amb, etaMinutes: amb.etaMinutes - 1 };
          }
          return amb;
        })
      );
    }, 45000);
    return () => clearInterval(etaInterval);
  }, []);

  // Handlers
  const handleAddPatient = (newPatient: EmergencyPatient) => {
    setPatients((prev) => [newPatient, ...prev]);

    // Update capacity counters
    if (newPatient.location.includes('Trauma Bay')) {
      setCapacity((prev) => ({
        ...prev,
        traumaBays: { ...prev.traumaBays, occupied: Math.min(prev.traumaBays.total, prev.traumaBays.occupied + 1) }
      }));
    } else if (newPatient.location.includes('Acute Bed')) {
      setCapacity((prev) => ({
        ...prev,
        edAcuteBeds: { ...prev.edAcuteBeds, occupied: Math.min(prev.edAcuteBeds.total, prev.edAcuteBeds.occupied + 1) }
      }));
    }
  };

  const handleUpdatePatient = (patientId: string, updates: Partial<EmergencyPatient>) => {
    setPatients((prev) =>
      prev.map((pt) => {
        if (pt.id === patientId) {
          const updated = { ...pt, ...updates };
          if (selectedPatient && selectedPatient.id === patientId) {
            setSelectedPatient(updated);
          }
          return updated;
        }
        return pt;
      })
    );
  };

  const handleUpdateBloodUnits = (bloodType: string, delta: number) => {
    setBloodInventory((prev) =>
      prev.map((item) => {
        if (item.type === bloodType) {
          const newUnits = Math.max(0, item.units + delta);
          return {
            ...item,
            units: newUnits,
            status: newUnits <= item.minSafeReserve ? 'Critical' : 'Normal'
          };
        }
        return item;
      })
    );
  };

  const handleDispenseMtpPack = () => {
    handleUpdateBloodUnits('O Negative (Universal RBC)', -6);
    handleUpdateBloodUnits('Fresh Frozen Plasma (FFP)', -6);
    handleUpdateBloodUnits('Platelet Pheresis Packs', -1);

    // Also declare MTP Alert if not active
    if (!activeCode) {
      setActiveCode({
        code: 'MTP_ALERT',
        title: 'MTP ALERT: Massive Transfusion Protocol Dispensed',
        location: 'Trauma Bay 2 / Blood Bank Rapid Infuser',
        declaredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        elapsedSeconds: 0,
        respondingTeam: 'Trauma Surgery & Blood Bank Rapid Delivery',
        checklist: [
          { item: 'MTP Cooler #1 (6 PRBC : 6 FFP : 1 Plt) released to Trauma Bay', completed: true },
          { item: 'Rapid blood warmer set to 37°C and pressure infusor attached', completed: true },
          { item: 'Tranexamic Acid (TXA) 1g IV loading dose administered', completed: false },
          { item: 'Check ionized Calcium and transfuse 2g Calcium Gluconate IV', completed: false }
        ]
      });
    }
  };

  const handleUpdateVentilators = (delta: number) => {
    setCapacity((prev) => ({
      ...prev,
      ventilators: {
        ...prev.ventilators,
        inUse: Math.max(0, Math.min(prev.ventilators.total, prev.ventilators.inUse + delta))
      }
    }));
  };

  const handleTriggerMciSurge = (incidentName: string, victimCount: number) => {
    setIsMciActive(true);
    setCapacity((prev) => ({
      ...prev,
      hospitalCondition: 'RED',
      traumaBays: { ...prev.traumaBays, occupied: 6 }
    }));

    // Generate batch of MCI disaster patients
    const mciNames = ['MCI Victim Alpha-1', 'MCI Victim Alpha-2', 'MCI Victim Bravo-1', 'MCI Victim Bravo-2', 'MCI Victim Charlie-1', 'MCI Victim Charlie-2'];
    const generated: EmergencyPatient[] = mciNames.map((name, idx) => {
      const esiLevel: EsiLevel = idx % 2 === 0 ? 1 : 2;
      return {
        id: `mci-${Date.now()}-${idx}`,
        mrn: `MCI-${890000 + idx}`,
        name: `${name} (${incidentName})`,
        age: 20 + Math.floor(Math.random() * 45),
        gender: idx % 2 === 0 ? 'Male' : 'Female',
        arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        minutesInEd: 0,
        esiLevel,
        chiefComplaint: `MCI Blast & Extrication Trauma from ${incidentName}`,
        primaryDiagnosis: 'Multiple blunt polytrauma, blast contusion',
        location: esiLevel === 1 ? 'Trauma Bay 3' : 'Acute Bed 2',
        status: 'Immediate Resuscitation',
        vitals: {
          heartRate: 120 + Math.floor(Math.random() * 25),
          bloodPressureSystolic: 80 + Math.floor(Math.random() * 30),
          bloodPressureDiastolic: 50 + Math.floor(Math.random() * 20),
          oxygenSaturation: 89 + Math.floor(Math.random() * 8),
          respiratoryRate: 28,
          temperatureCelsius: 36.4,
          glasgowComaScale: 11
        },
        attendingPhysician: 'Disaster Surge Surgical Team',
        primaryNurse: 'Disaster Triage Station',
        isAllergic: false,
        activeProtocols: ['MCI START Protocol Active'],
        notes: [`Disaster triage intake registered at ED ambulance bay.`]
      };
    });

    setPatients((prev) => [...generated, ...prev]);

    // Trigger Code Orange banner
    setActiveCode({
      code: 'CODE_ORANGE',
      title: `CODE ORANGE: ${incidentName} (${victimCount} Victims)`,
      location: 'Regional Emergency Operations Center & Triage Bay',
      declaredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedSeconds: 0,
      respondingTeam: 'Hospital Incident Command System (HICS) & Off-Duty Recall',
      checklist: [
        { item: 'HICS Emergency Operations Center (EOC) activated', completed: true },
        { item: 'START Field Triage Station deployed at ambulance gate', completed: true },
        { item: 'Elective surgeries cancelled & PACU converted to surge beds', completed: false },
        { item: 'Blood Bank switched to Emergency Uncrossed O-Neg protocol', completed: false },
        { item: 'Off-duty trauma surgeons and anesthesiologists recalled', completed: false }
      ]
    });
  };

  const handleClearMci = () => {
    setIsMciActive(false);
    setCapacity((prev) => ({ ...prev, hospitalCondition: 'AMBER' }));
    if (activeCode?.code === 'CODE_ORANGE') {
      setActiveCode(null);
    }
  };

  const handleDeclareCode = (code: ActiveEmergencyCode) => {
    setActiveCode(code);
  };

  const handleClearCode = () => {
    setActiveCode(null);
  };

  const handleToggleChecklistItem = (index: number) => {
    if (!activeCode) return;
    const updated = [...activeCode.checklist];
    updated[index].completed = !updated[index].completed;
    setActiveCode({ ...activeCode, checklist: updated });
  };

  const handleDivertAmbulance = (ambId: string) => {
    setAmbulances((prev) => prev.filter((a) => a.id !== ambId));
  };

  const handleAssignBay = (ambId: string, bay: string) => {
    setAmbulances((prev) =>
      prev.map((a) => (a.id === ambId ? { ...a, assignedBay: bay } : a))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Clinical Command Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        capacity={capacity}
        activeCode={activeCode?.code || 'NONE'}
        onOpenCodeModal={() => setShowCodeModal(true)}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled((prev) => !prev)}
        currentTime={currentTime}
      />

      {/* Emergency Active Code Broadcast Banner */}
      <EmergencyCodeBanner
        activeCode={activeCode}
        onToggleChecklistItem={handleToggleChecklistItem}
        onClearCode={handleClearCode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Operations Hub Tab */}
        {activeTab === 'command' && (
          <DashboardOverview
            patients={patients}
            capacity={capacity}
            ambulances={ambulances}
            bloodInventory={bloodInventory}
            onSelectPatient={setSelectedPatient}
            onOpenIntakeModal={() => setShowIntakeModal(true)}
            onNavigateTab={setActiveTab}
            onOpenCodeModal={() => setShowCodeModal(true)}
          />
        )}

        {/* Patient Triage & Intake Tab */}
        {activeTab === 'triage' && (
          <PatientTriageBoard
            patients={patients}
            onSelectPatient={setSelectedPatient}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            showIntakeModal={showIntakeModal}
            onCloseIntakeModal={() => setShowIntakeModal(false)}
            onOpenIntakeModal={() => setShowIntakeModal(true)}
          />
        )}

        {/* Inbound EMS Ambulance Fleet Monitor */}
        {activeTab === 'ambulances' && (
          <AmbulanceDispatchMonitor
            ambulances={ambulances}
            onAddAmbulance={(amb) => setAmbulances((prev) => [amb, ...prev])}
            onAssignBay={handleAssignBay}
            onDivertAmbulance={handleDivertAmbulance}
          />
        )}

        {/* Mass Casualty Incident (MCI) & Disaster Operations */}
        {activeTab === 'mci' && (
          <DisasterMciModule
            onTriggerMciSurge={handleTriggerMciSurge}
            isMciActive={isMciActive}
            onClearMci={handleClearMci}
          />
        )}

        {/* Critical Hospital Resources & Blood Bank */}
        {activeTab === 'resources' && (
          <ResourceInventory
            bloodInventory={bloodInventory}
            capacity={capacity}
            onUpdateBloodUnits={handleUpdateBloodUnits}
            onDispenseMtpPack={handleDispenseMtpPack}
            onUpdateVentilators={handleUpdateVentilators}
          />
        )}

        {/* Clinical Protocols & Emergency SOPs */}
        {activeTab === 'protocols' && <ClinicalProtocolsView />}
      </main>

      {/* Patient Detail / Clinical Chart Drawer Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdatePatient={handleUpdatePatient}
        />
      )}

      {/* Emergency Code Broadcast Modal */}
      {showCodeModal && (
        <EmergencyCodeModal
          isOpen={showCodeModal}
          onClose={() => setShowCodeModal(false)}
          onDeclareCode={handleDeclareCode}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-400">
              Hospital Emergency Management System (HEMS) · Emergency Operations Directorate
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Level-1 Trauma Center Patient Triage (ESI 1-5), Hospital Surge Capacity, and Disaster Incident Command.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/download-hems-zip"
              download="hems-hospital-emergency-management.zip"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HEMS Source ZIP</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
