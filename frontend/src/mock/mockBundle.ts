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

/** Mock "ED census" list for local testing (no Epic). */
export const mockEdPatientBundles: { patientId: string; bundle: PatientDataBundle }[] = [
  { patientId: mockPatientSummary.id, bundle: mockBundle },
  { patientId: mockPatientSummary2.id, bundle: mockBundle2 }
];

