import {
  EmergencyPatient,
  HospitalCapacity,
  AmbulanceUnit,
  BloodInventoryItem,
  ClinicalProtocol
} from '../types/hems';

export const INITIAL_CAPACITY: HospitalCapacity = {
  traumaBays: { occupied: 4, total: 6 },
  icuBeds: { occupied: 17, total: 20 },
  edAcuteBeds: { occupied: 38, total: 45 },
  orSuites: { active: 3, total: 5 },
  ventilators: { inUse: 21, total: 28 },
  dialysisUnits: { inUse: 6, total: 8 },
  oxygenSupplyPercent: 94.6,
  powerStatus: 'Mains Grid Normal',
  hospitalCondition: 'AMBER' // High volume
};

export const INITIAL_PATIENTS: EmergencyPatient[] = [
  {
    id: 'pt-001',
    mrn: 'MRN-882104',
    name: 'Marcus Vance',
    age: 49,
    gender: 'Male',
    arrivalTime: '11:42 AM',
    minutesInEd: 22,
    esiLevel: 1, // Resuscitation
    chiefComplaint: 'Crushing Substernal Chest Pain, Diaphoretic, Radiating to L Arm',
    primaryDiagnosis: 'Acute Anterior STEMI (ST Elevation V1-V4)',
    location: 'Trauma Bay 1',
    status: 'Immediate Resuscitation',
    vitals: {
      heartRate: 118,
      bloodPressureSystolic: 88,
      bloodPressureDiastolic: 54,
      oxygenSaturation: 91,
      respiratoryRate: 26,
      temperatureCelsius: 36.8,
      glasgowComaScale: 14
    },
    attendingPhysician: 'Dr. Sarah Lin, MD (Trauma Lead)',
    primaryNurse: 'Nurse Rachel Hayes, RN',
    isAllergic: true,
    allergies: 'Penicillin, Contrast Dye',
    activeProtocols: ['STEMI Code Active', 'Cath Lab Prepped'],
    notes: [
      '11:44 AM: 12-lead ECG confirmed 4mm ST elevation in anterolateral leads.',
      '11:47 AM: Dual antiplatelet therapy loaded (Aspirin 324mg + Ticagrelor 180mg).',
      '11:51 AM: Interventional cardiology team en-route to Lab 2 for primary PCI.'
    ]
  },
  {
    id: 'pt-002',
    mrn: 'MRN-882119',
    name: 'Elena Rostova',
    age: 26,
    gender: 'Female',
    arrivalTime: '11:28 AM',
    minutesInEd: 36,
    esiLevel: 1, // Resuscitation
    chiefComplaint: 'High-Speed Motor Vehicle Collision, Flail Chest & Pelvic Instability',
    primaryDiagnosis: 'Polytrauma, Hemorrhagic Shock, Splenic Laceration',
    location: 'Trauma Bay 2',
    status: 'Immediate Resuscitation',
    vitals: {
      heartRate: 134,
      bloodPressureSystolic: 78,
      bloodPressureDiastolic: 46,
      oxygenSaturation: 89,
      respiratoryRate: 32,
      temperatureCelsius: 35.6,
      glasgowComaScale: 10
    },
    attendingPhysician: 'Dr. James Thorne, MD (Trauma Surgery)',
    primaryNurse: 'Nurse David Cho, BSN',
    isAllergic: false,
    activeProtocols: ['Massive Transfusion Protocol (MTP)', 'Level 1 Trauma Alert'],
    notes: [
      '11:30 AM: EFAST ultrasound positive for free fluid in Morison’s pouch and splenorenal space.',
      '11:35 AM: MTP Cooler #1 unpacked (4 PRBC, 4 FFP, 1 Platelet pack infusing via Belmont rapid infuser).',
      '11:42 AM: Pelvic binder secured. Surgical team clearing OR Suite 1 for emergent exploratory laparotomy.'
    ]
  },
  {
    id: 'pt-003',
    mrn: 'MRN-882133',
    name: 'Robert Chen',
    age: 71,
    gender: 'Male',
    arrivalTime: '11:15 AM',
    minutesInEd: 49,
    esiLevel: 2, // Emergent
    chiefComplaint: 'Sudden Right-Sided Hemiplegia & Expressive Aphasia (LKW 45 min ago)',
    primaryDiagnosis: 'Acute Ischemic Stroke (Left MCA Occlusion suspected)',
    location: 'CT Scanner 1',
    status: 'Awaiting Diagnostics (CT/X-Ray)',
    vitals: {
      heartRate: 84,
      bloodPressureSystolic: 178,
      bloodPressureDiastolic: 98,
      oxygenSaturation: 97,
      respiratoryRate: 18,
      temperatureCelsius: 37.1,
      glasgowComaScale: 12
    },
    attendingPhysician: 'Dr. Anita Patel, MD (Neurology)',
    primaryNurse: 'Nurse Emily Vance, RN',
    isAllergic: false,
    activeProtocols: ['Code Stroke Alert', 'Thrombectomy Candidate'],
    notes: [
      '11:18 AM: NIHSS score assessed at 16 (severe neurological deficit).',
      '11:22 AM: Point-of-care blood glucose 112 mg/dL. Non-contrast head CT in progress.',
      '11:30 AM: Tele-neurology consulted. Tenecteplase (TNK) bolus drawn at bedside pending hemorrhage rule-out.'
    ]
  },
  {
    id: 'pt-004',
    mrn: 'MRN-882098',
    name: 'Maya Henderson',
    age: 34,
    gender: 'Female',
    arrivalTime: '10:55 AM',
    minutesInEd: 69,
    esiLevel: 2, // Emergent
    chiefComplaint: 'Severe Rigors, Refractory Hypotension, Flank Pain with High Fever',
    primaryDiagnosis: 'Urosepsis with Septic Shock',
    location: 'Acute Bed 1',
    status: 'Active Treatment',
    vitals: {
      heartRate: 126,
      bloodPressureSystolic: 84,
      bloodPressureDiastolic: 50,
      oxygenSaturation: 93,
      respiratoryRate: 24,
      temperatureCelsius: 39.4,
      glasgowComaScale: 14
    },
    attendingPhysician: 'Dr. Gregory House, MD',
    primaryNurse: 'Nurse Samuel Miller, RN',
    isAllergic: true,
    allergies: 'Sulfa Drugs',
    activeProtocols: ['Sepsis Hour-1 Bundle'],
    notes: [
      '11:00 AM: Blood cultures x2 drawn. Serum lactate came back elevated at 4.2 mmol/L.',
      '11:10 AM: IV crystalline fluid bolus 30 mL/kg initiated with broad-spectrum Cefepime + Vancomycin.',
      '11:35 AM: Norepinephrine infusion started via peripheral line (titrating for MAP ≥ 65 mmHg).'
    ]
  },
  {
    id: 'pt-005',
    mrn: 'MRN-882087',
    name: 'Liam O’Connor',
    age: 9,
    gender: 'Male',
    arrivalTime: '11:35 AM',
    minutesInEd: 29,
    esiLevel: 2, // Emergent
    chiefComplaint: 'Acute Severe Asthma Exacerbation, Subcostal Retractions & Silent Chest',
    primaryDiagnosis: 'Status Asthmaticus',
    location: 'Pediatric ED 1',
    status: 'Active Treatment',
    vitals: {
      heartRate: 142,
      bloodPressureSystolic: 104,
      bloodPressureDiastolic: 62,
      oxygenSaturation: 88,
      respiratoryRate: 38,
      temperatureCelsius: 37.0,
      glasgowComaScale: 15
    },
    attendingPhysician: 'Dr. Clara Oswald, MD (Pediatrics)',
    primaryNurse: 'Nurse Jessica Alba, RN',
    isAllergic: false,
    activeProtocols: ['Pediatric Rapid Respiratory Pathway'],
    notes: [
      '11:36 AM: Continuous nebulized Albuterol + Ipratropium initiated via high-flow non-rebreather mask.',
      '11:40 AM: IV Dexamethasone 0.6 mg/kg and IV Magnesium Sulfate 50 mg/kg infused over 20 min.'
    ]
  },
  {
    id: 'pt-006',
    mrn: 'MRN-882054',
    name: 'Harold Jenkins',
    age: 63,
    gender: 'Male',
    arrivalTime: '10:10 AM',
    minutesInEd: 114,
    esiLevel: 3, // Urgent
    chiefComplaint: 'Right Lower Quadrant Abdominal Pain, Nausea, Vomiting for 18 Hours',
    primaryDiagnosis: 'Acute Appendicitis (Probable Perforation)',
    location: 'Acute Bed 3',
    status: 'OR Transfer Pending',
    vitals: {
      heartRate: 98,
      bloodPressureSystolic: 132,
      bloodPressureDiastolic: 82,
      oxygenSaturation: 98,
      respiratoryRate: 18,
      temperatureCelsius: 38.3,
      glasgowComaScale: 15
    },
    attendingPhysician: 'Dr. Sarah Lin, MD',
    primaryNurse: 'Nurse Rachel Hayes, RN',
    isAllergic: false,
    activeProtocols: ['Pre-Op Surgical Clearance'],
    notes: [
      '10:45 AM: Abdominal CT with IV contrast confirmed 12mm dilated appendix with appendicolith.',
      '11:15 AM: General surgery on-call consulted; booked for laparoscopic appendectomy in OR 3.'
    ]
  },
  {
    id: 'pt-007',
    mrn: 'MRN-882031',
    name: 'Zoe Martinez',
    age: 21,
    gender: 'Female',
    arrivalTime: '10:30 AM',
    minutesInEd: 94,
    esiLevel: 3, // Urgent
    chiefComplaint: 'Closed Right Tibia-Fibula Fracture following skiing fall',
    primaryDiagnosis: 'Midshaft Tibia Fracture (Neurovascular Intact)',
    location: 'Acute Bed 4',
    status: 'Active Treatment',
    vitals: {
      heartRate: 88,
      bloodPressureSystolic: 124,
      bloodPressureDiastolic: 76,
      oxygenSaturation: 99,
      respiratoryRate: 16,
      temperatureCelsius: 36.6,
      glasgowComaScale: 15
    },
    attendingPhysician: 'Dr. Gregory House, MD',
    primaryNurse: 'Nurse David Cho, BSN',
    isAllergic: false,
    activeProtocols: ['Fracture Reduction Pathway'],
    notes: [
      '10:50 AM: 3-view lower extremity X-rays reviewed. Closed reduction and posterior long-leg splinting planned under procedural sedation.'
    ]
  },
  {
    id: 'pt-008',
    mrn: 'MRN-882012',
    name: 'Franklin Boyd',
    age: 52,
    gender: 'Male',
    arrivalTime: '09:40 AM',
    minutesInEd: 144,
    esiLevel: 4, // Less Urgent
    chiefComplaint: 'Deep 6cm Forearm Laceration from Circular Saw (Hemostasis achieved)',
    primaryDiagnosis: 'Complex Forearm Laceration without tendon involvement',
    location: 'Acute Bed 5',
    status: 'Active Treatment',
    vitals: {
      heartRate: 76,
      bloodPressureSystolic: 128,
      bloodPressureDiastolic: 80,
      oxygenSaturation: 99,
      respiratoryRate: 14,
      temperatureCelsius: 36.7,
      glasgowComaScale: 15
    },
    attendingPhysician: 'Dr. James Thorne, MD',
    primaryNurse: 'Nurse Emily Vance, RN',
    isAllergic: false,
    activeProtocols: ['Wound Repair'],
    notes: [
      '10:15 AM: Wound irrigated with 1000mL sterile saline. Tetanus toxoid booster administered. 2-layer nylon closure underway.'
    ]
  },
  {
    id: 'pt-009',
    mrn: 'MRN-882005',
    name: 'Abigail Wright',
    age: 28,
    gender: 'Female',
    arrivalTime: '11:20 AM',
    minutesInEd: 44,
    esiLevel: 4, // Less Urgent
    chiefComplaint: 'Inversion Ankle Injury, Moderate Edema, Unable to bear weight',
    primaryDiagnosis: 'Lateral Ankle Sprain / Rule out distal fibular avulsion',
    location: 'Waiting Room',
    status: 'Awaiting Diagnostics (CT/X-Ray)',
    vitals: {
      heartRate: 72,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 74,
      oxygenSaturation: 100,
      respiratoryRate: 14,
      temperatureCelsius: 36.8,
      glasgowComaScale: 15
    },
    attendingPhysician: 'Dr. Sarah Lin, MD',
    primaryNurse: 'Nurse Samuel Miller, RN',
    isAllergic: false,
    activeProtocols: ['Ottawa Ankle Protocol'],
    notes: [
      '11:25 AM: Ottawa Ankle Rules positive at posterior edge of lateral malleolus; 3-view ankle radiograph ordered.'
    ]
  },
  {
    id: 'pt-010',
    mrn: 'MRN-881992',
    name: 'George Simmons',
    age: 68,
    gender: 'Male',
    arrivalTime: '11:32 AM',
    minutesInEd: 32,
    esiLevel: 5, // Non-Urgent
    chiefComplaint: 'Routine Catheter Tube Clogged, Urine Discomfort without Fever',
    primaryDiagnosis: 'Blocked Foley Catheter',
    location: 'Waiting Room',
    status: 'Awaiting Triage',
    vitals: {
      heartRate: 68,
      bloodPressureSystolic: 136,
      bloodPressureDiastolic: 84,
      oxygenSaturation: 98,
      respiratoryRate: 14,
      temperatureCelsius: 36.7,
      glasgowComaScale: 15
    },
    attendingPhysician: 'Triage Nurse Team',
    primaryNurse: 'Nurse Rachel Hayes, RN',
    isAllergic: false,
    activeProtocols: ['Nurse-Driven Foley Exchange'],
    notes: [
      '11:35 AM: Awaiting bed for 16 Fr Foley catheter replacement.'
    ]
  }
];

export const INITIAL_AMBULANCES: AmbulanceUnit[] = [
  {
    id: 'amb-101',
    callSign: 'MEDIC 4',
    etaMinutes: 3,
    priority: 'Priority 1 (Red)',
    chiefComplaint: 'Out-of-Hospital Cardiac Arrest, Shock Delivered x2, ROSC Achieved en route',
    patientAge: 62,
    patientGender: 'Male',
    vitalsPreview: 'HR: 108 sinus, BP: 92/58, SpO2: 95% on BVM, GCS: 3T',
    assignedBay: 'Trauma Bay 3 (Reserved)',
    paramedicNotes: 'Endotracheal tube confirmed at 22cm at teeth. Ongoing epinephrine infusion. LUCAS mechanical CPR disengaged following pulse return.',
    isPreArrivalNotified: true
  },
  {
    id: 'amb-102',
    callSign: 'RESCUE 12',
    etaMinutes: 7,
    priority: 'Priority 1 (Red)',
    chiefComplaint: 'Industrial Crush Injury, Traumatic Amputation of Left Lower Leg',
    patientAge: 38,
    patientGender: 'Male',
    vitalsPreview: 'HR: 122, BP: 86/52, SpO2: 96% on 15L NRB, GCS: 13',
    assignedBay: 'Trauma Bay 4 (Reserved)',
    paramedicNotes: 'Combat Application Tourniquet (CAT) applied at 11:32 AM with complete distal hemostasis. IV access established with 1L warm saline infusing.',
    isPreArrivalNotified: true
  },
  {
    id: 'amb-103',
    callSign: 'LIFEGUARD 8',
    etaMinutes: 14,
    priority: 'Priority 2 (Yellow)',
    chiefComplaint: 'Diabetic Ketoacidosis, Kussmaul respirations, Glucose > 550 mg/dL',
    patientAge: 19,
    patientGender: 'Female',
    vitalsPreview: 'HR: 114, BP: 106/68, SpO2: 98%, RR: 28 deep, GCS: 14',
    assignedBay: 'Acute Bed 6 (Pending)',
    paramedicNotes: 'Heavy ketotic breath odor. 2 Liters normal saline administered over past 45 minutes.',
    isPreArrivalNotified: false
  },
  {
    id: 'amb-104',
    callSign: 'METRO 22',
    etaMinutes: 21,
    priority: 'Priority 3 (Green)',
    chiefComplaint: 'Uncomplicated Syncope at transit station, full recovery, vitals baseline',
    patientAge: 44,
    patientGender: 'Female',
    vitalsPreview: 'HR: 72 regular, BP: 120/78, SpO2: 99%, GCS: 15',
    assignedBay: 'Triage Waiting',
    paramedicNotes: 'Patient alert and oriented x4. Denies head strike or chest pain.',
    isPreArrivalNotified: false
  }
];

export const INITIAL_BLOOD_INVENTORY: BloodInventoryItem[] = [
  { type: 'O Negative (Universal RBC)', units: 8, minSafeReserve: 12, status: 'Critical' },
  { type: 'O Positive (RBC)', units: 24, minSafeReserve: 15, status: 'Normal' },
  { type: 'A Positive (RBC)', units: 19, minSafeReserve: 15, status: 'Normal' },
  { type: 'A Negative (RBC)', units: 6, minSafeReserve: 8, status: 'Low' },
  { type: 'B Positive (RBC)', units: 14, minSafeReserve: 10, status: 'Normal' },
  { type: 'AB Positive / Universal Plasma', units: 11, minSafeReserve: 8, status: 'Normal' },
  { type: 'Platelet Pheresis Packs', units: 4, minSafeReserve: 6, status: 'Low' },
  { type: 'Fresh Frozen Plasma (FFP)', units: 28, minSafeReserve: 20, status: 'Normal' },
  { type: 'Cryoprecipitate Pools', units: 16, minSafeReserve: 10, status: 'Normal' }
];

export const CLINICAL_PROTOCOLS: ClinicalProtocol[] = [
  {
    id: 'proto-stemi',
    title: 'Code STEMI (Acute Coronary Syndrome)',
    category: 'Cardiac',
    acronym: 'STEMI',
    indication: 'Persistent chest discomfort with ST elevation ≥1mm in 2 contiguous leads or new LBBB.',
    goldenHourMinutes: 90, // Door-to-Balloon < 90 min
    steps: [
      'Acquire 12-lead ECG within 10 minutes of patient arrival.',
      'Administer chewed non-enteric coated Aspirin 324 mg unless contraindicated.',
      'Alert Cardiac Catheterization Lab Interventionalist & On-Call Team.',
      'Establish bilateral wide-bore (18G) IV lines in antecubital fossa.',
      'Administer P2Y12 inhibitor (Ticagrelor 180mg or Prasugrel 60mg) + Heparin bolus.',
      'Target Door-to-Balloon Inflation Time: < 90 minutes from ED triage.'
    ]
  },
  {
    id: 'proto-stroke',
    title: 'Code Stroke (Hyperacute Neurovascular)',
    category: 'Neurology',
    acronym: 'STROKE',
    indication: 'Sudden neurological deficit with Last Known Well (LKW) < 24 hours.',
    goldenHourMinutes: 60, // Door-to-Needle < 45-60 min
    steps: [
      'Immediate point-of-care fingerstick blood glucose to rule out hypoglycemia.',
      'Calculate baseline NIHSS neurological deficit score.',
      'Stat Non-Contrast Head CT + CT Angiography of head/neck within 20 minutes.',
      'Confirm no intracranial hemorrhage or absolute thrombolytic contraindications.',
      'Administer IV Tenecteplase (TNK 0.25 mg/kg) if LKW < 4.5 hours.',
      'Activate Neurointerventional team for Mechanical Thrombectomy if Large Vessel Occlusion (LVO) present.'
    ]
  },
  {
    id: 'proto-mtp',
    title: 'Massive Transfusion Protocol (MTP)',
    category: 'Trauma',
    acronym: 'MTP',
    indication: 'Exsanguinating hemorrhage, shock index > 1.0, or ABC score ≥ 2.',
    goldenHourMinutes: 15,
    steps: [
      'Notify Blood Bank to release MTP Cooler #1 (Ratio 1:1:1 = 6 PRBC : 6 FFP : 1 Single-Donor Platelet).',
      'Infuse blood products through calibrated fluid warming rapid infuser (Belmont/Level 1).',
      'Administer Tranexamic Acid (TXA) 1g IV over 10 minutes within 3 hours of trauma.',
      'Administer 1-2g Calcium Gluconate IV for every 4 units of blood products to prevent hypocalcemia.',
      'Monitor arterial blood gas: Target pH > 7.25, Temp > 35°C, Ionized Ca²⁺ > 1.1 mmol/L.'
    ]
  },
  {
    id: 'proto-sepsis',
    title: 'Sepsis Hour-1 Emergency Bundle',
    category: 'Infectious',
    acronym: 'SEPSIS',
    indication: 'Suspected infection + SOFA score ≥ 2 or qSOFA ≥ 2 (Hypotension, AMS, Tachypnea).',
    goldenHourMinutes: 60,
    steps: [
      'Measure serum blood lactate; remeasure within 2-4 hours if initial lactate > 2.0 mmol/L.',
      'Obtain blood cultures x2 prior to antibiotic administration without delaying therapy.',
      'Administer empiric broad-spectrum IV antimicrobials within 60 minutes.',
      'Rapidly administer 30 mL/kg IV crystalloid fluid for hypotension or lactate ≥ 4.0 mmol/L.',
      'Apply vasopressors (Norepinephrine first-line) if patient remains hypotensive during or after fluid loading (MAP ≥ 65 mmHg).'
    ]
  },
  {
    id: 'proto-mci',
    title: 'Code Orange: Mass Casualty Incident Protocol',
    category: 'Disaster',
    acronym: 'CODE_ORANGE',
    indication: 'External disaster generating a surge of patients exceeding normal ED operational capacity.',
    goldenHourMinutes: 30,
    steps: [
      'Hospital Incident Commander (HIC) establishes Emergency Operations Center (EOC).',
      'Deploy START Triage Officer at ambulance bay entrance (Red / Yellow / Green / Black tags).',
      'Convert Day Surgery & PACU units into Immediate Surge Care Units.',
      'Activate Disaster Staff Call-In: Off-duty trauma surgeons, anesthesiologists, and ED nurses.',
      'Blood Bank switches to emergency uncrossed O-Negative release protocol.',
      'Discharge / transfer all stable ESI 4-5 patients to outpatient treatment annex.'
    ]
  }
];
