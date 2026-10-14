export type EsiLevel = 1 | 2 | 3 | 4 | 5;

export type PatientStatus =
  | 'Awaiting Triage'
  | 'Triage In Progress'
  | 'Immediate Resuscitation'
  | 'Active Treatment'
  | 'Awaiting Diagnostics (CT/X-Ray)'
  | 'OR Transfer Pending'
  | 'ICU Admission Pending'
  | 'Discharged'
  | 'Deceased';

export type PatientLocation =
  | 'Waiting Room'
  | 'Triage Area'
  | 'Trauma Bay 1'
  | 'Trauma Bay 2'
  | 'Trauma Bay 3'
  | 'Trauma Bay 4'
  | 'Resus Room A'
  | 'Acute Bed 1'
  | 'Acute Bed 2'
  | 'Acute Bed 3'
  | 'Acute Bed 4'
  | 'Acute Bed 5'
  | 'Acute Bed 6'
  | 'Pediatric ED 1'
  | 'Pediatric ED 2'
  | 'ICU Bay 1'
  | 'ICU Bay 2'
  | 'OR Suite 1'
  | 'OR Suite 2'
  | 'CT Scanner 1';

export interface PatientVitals {
  heartRate: number; // bpm
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  oxygenSaturation: number; // %
  respiratoryRate: number; // breaths/min
  temperatureCelsius: number; // C
  glasgowComaScale: number; // 3-15
}

export interface EmergencyPatient {
  id: string;
  mrn: string; // Medical Record Number
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  arrivalTime: string;
  minutesInEd: number;
  esiLevel: EsiLevel;
  chiefComplaint: string;
  primaryDiagnosis?: string;
  location: PatientLocation;
  status: PatientStatus;
  vitals: PatientVitals;
  attendingPhysician: string;
  primaryNurse: string;
  isAllergic: boolean;
  allergies?: string;
  activeProtocols: string[]; // e.g. ['STEMI Code', 'Massive Transfusion']
  notes: string[];
}

export type EmergencyCodeType =
  | 'NONE'
  | 'CODE_BLUE' // Cardiac / Respiratory Arrest
  | 'CODE_RED' // Fire
  | 'CODE_ORANGE' // Mass Casualty / Hazmat
  | 'CODE_BLACK' // Disaster / Bomb Threat
  | 'CODE_SILVER' // Active Shooter / Violent Threat
  | 'MTP_ALERT' // Massive Transfusion Protocol
  | 'STROKE_ALERT' // Acute Neuro Stroke
  | 'TRAUMA_ALERT'; // Level 1 Polytrauma

export interface ActiveEmergencyCode {
  code: EmergencyCodeType;
  title: string;
  location: string;
  declaredAt: string;
  elapsedSeconds: number;
  respondingTeam: string;
  checklist: { item: string; completed: boolean }[];
}

export interface HospitalCapacity {
  traumaBays: { occupied: number; total: number };
  icuBeds: { occupied: number; total: number };
  edAcuteBeds: { occupied: number; total: number };
  orSuites: { active: number; total: number };
  ventilators: { inUse: number; total: number };
  dialysisUnits: { inUse: number; total: number };
  oxygenSupplyPercent: number;
  powerStatus: 'Mains Grid Normal' | 'Auxiliary Generator Active';
  hospitalCondition: 'GREEN' | 'AMBER' | 'RED' | 'BLACK'; // Black = Full Divert / MCI
}

export interface AmbulanceUnit {
  id: string;
  callSign: string;
  etaMinutes: number;
  priority: 'Priority 1 (Red)' | 'Priority 2 (Yellow)' | 'Priority 3 (Green)';
  chiefComplaint: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  vitalsPreview: string;
  assignedBay: string;
  paramedicNotes: string;
  isPreArrivalNotified: boolean;
}

export interface BloodInventoryItem {
  type: string;
  units: number;
  minSafeReserve: number;
  status: 'Normal' | 'Low' | 'Critical';
}

export interface ClinicalProtocol {
  id: string;
  title: string;
  category: 'Cardiac' | 'Neurology' | 'Trauma' | 'Infectious' | 'Disaster';
  acronym: string;
  indication: string;
  goldenHourMinutes: number;
  steps: string[];
}
