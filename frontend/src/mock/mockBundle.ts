import { PatientDataBundle, PatientSummary } from "../eligibility/studySchema";

const mockPatientSummary: PatientSummary = {
  id: "mock-patient-1",
  name: "Jane Doe",
  mrn: "MRN123456",
  age: 54,
  gender: "Female"
};

export const mockBundle: PatientDataBundle = {
  patient: {
    resourceType: "Patient",
    id: mockPatientSummary.id,
    name: [
      {
        family: "Doe",
        given: ["Jane"]
      }
    ],
    gender: "female",
    birthDate: "1971-01-01",
    identifier: [
      {
        system: "http://hospital.example.org/mrn",
        value: mockPatientSummary.mrn
      }
    ]
  },
  observations: [
    {
      resourceType: "Observation",
      id: "obs-hba1c",
      status: "final",
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "4548-4",
            display: "Hemoglobin A1c/Hemoglobin.total in Blood"
          }
        ],
        text: "HbA1c"
      },
      effectiveDateTime: "2025-12-01T10:00:00Z",
      valueQuantity: {
        value: 8.1,
        unit: "%",
        system: "http://unitsofmeasure.org",
        code: "%"
      }
    }
  ],
  medications: [
    {
      resourceType: "MedicationRequest",
      id: "metformin-medreq",
      status: "active",
      intent: "order",
      medicationCodeableConcept: {
        coding: [
          {
            system: "http://www.nlm.nih.gov/research/umls/rxnorm",
            code: "860975",
            display: "Metformin 500 MG Oral Tablet"
          }
        ],
        text: "Metformin"
      }
    }
  ],
  conditions: [
    {
      resourceType: "Condition",
      id: "cond-t2dm",
      clinicalStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
            code: "active"
          }
        ]
      },
      code: {
        coding: [
          {
            system: "http://hl7.org/fhir/sid/icd-10-cm",
            code: "E11",
            display: "Type 2 diabetes mellitus"
          }
        ],
        text: "Type 2 diabetes mellitus"
      }
    }
  ],
  patientSummary: mockPatientSummary
};

/** Second mock patient (younger, no T2DM – NEXUS eligible, T2DM study not). */
const mockPatientSummary2: PatientSummary = {
  id: "mock-patient-2",
  name: "John Smith",
  mrn: "MRN789012",
  age: 25,
  gender: "Male"
};

export const mockBundle2: PatientDataBundle = {
  patient: {
    resourceType: "Patient",
    id: mockPatientSummary2.id,
    name: [{ family: "Smith", given: ["John"] }],
    gender: "male",
    birthDate: "2000-05-15",
    identifier: [
      { system: "http://hospital.example.org/mrn", value: mockPatientSummary2.mrn }
    ]
  },
  observations: [],
  medications: [],
  conditions: [],
  patientSummary: mockPatientSummary2
};

/** Third mock patient: older, hip fracture + elevated troponin → HIP ATTACK-2 eligible. */
const mockPatientSummary3: PatientSummary = {
  id: "mock-patient-3",
  name: "Maria Garcia",
  mrn: "MRN345678",
  age: 68,
  gender: "Female"
};

export const mockBundle3: PatientDataBundle = {
  patient: {
    resourceType: "Patient",
    id: mockPatientSummary3.id,
    name: [{ family: "Garcia", given: ["Maria"] }],
    gender: "female",
    birthDate: "1957-03-22",
    identifier: [
      { system: "http://hospital.example.org/mrn", value: mockPatientSummary3.mrn }
    ]
  },
  observations: [
    {
      resourceType: "Observation",
      id: "obs-troponin-3",
      status: "final",
      code: {
        coding: [{ system: "http://loinc.org", code: "6598-7", display: "Troponin I" }]
      },
      effectiveDateTime: "2025-12-06T14:00:00Z",
      valueQuantity: { value: 42, unit: "ng/L", system: "http://unitsofmeasure.org", code: "ng/L" }
    }
  ],
  medications: [],
  conditions: [
    {
      resourceType: "Condition",
      id: "cond-hip-3",
      clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
      code: {
        coding: [
          { system: "http://hl7.org/fhir/sid/icd-10-cm", code: "S72.0", display: "Fracture of femoral neck" }
        ]
      }
    }
  ],
  patientSummary: mockPatientSummary3
};

/** Fourth mock patient: on rivaroxaban → TAKEDA REVERSER eligible. */
const mockPatientSummary4: PatientSummary = {
  id: "mock-patient-4",
  name: "Robert Chen",
  mrn: "MRN456789",
  age: 61,
  gender: "Male"
};

export const mockBundle4: PatientDataBundle = {
  patient: {
    resourceType: "Patient",
    id: mockPatientSummary4.id,
    name: [{ family: "Chen", given: ["Robert"] }],
    gender: "male",
    birthDate: "1964-08-10",
    identifier: [
      { system: "http://hospital.example.org/mrn", value: mockPatientSummary4.mrn }
    ]
  },
  observations: [],
  medications: [
    {
      resourceType: "MedicationRequest",
      id: "med-rivaroxaban",
      status: "active",
      intent: "order",
      medicationCodeableConcept: {
        coding: [
          { system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "316541", display: "Rivaroxaban" }
        ]
      }
    }
  ],
  conditions: [],
  patientSummary: mockPatientSummary4
};

/** Fifth mock patient: young adult, minimal data → NEXUS eligible only. */
const mockPatientSummary5: PatientSummary = {
  id: "mock-patient-5",
  name: "Alex Johnson",
  mrn: "MRN567890",
  age: 32,
  gender: "Female"
};

export const mockBundle5: PatientDataBundle = {
  patient: {
    resourceType: "Patient",
    id: mockPatientSummary5.id,
    name: [{ family: "Johnson", given: ["Alex"] }],
    gender: "female",
    birthDate: "1993-01-28",
    identifier: [
      { system: "http://hospital.example.org/mrn", value: mockPatientSummary5.mrn }
    ]
  },
  observations: [],
  medications: [],
  conditions: [],
  patientSummary: mockPatientSummary5
};

/** Mock "ED census" list for local testing (no Epic). */
export const mockEdPatientBundles: { patientId: string; bundle: PatientDataBundle }[] = [
  { patientId: mockPatientSummary.id, bundle: mockBundle },
  { patientId: mockPatientSummary2.id, bundle: mockBundle2 },
  { patientId: mockPatientSummary3.id, bundle: mockBundle3 },
  { patientId: mockPatientSummary4.id, bundle: mockBundle4 },
  { patientId: mockPatientSummary5.id, bundle: mockBundle5 }
];

