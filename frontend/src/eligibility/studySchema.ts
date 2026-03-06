export type ResourceType = "Patient" | "Observation" | "MedicationRequest" | "Condition";

export type CriterionStatus = "pass" | "fail" | "unknown";

export type OverallStatus = "eligible" | "not_eligible" | "indeterminate";

export interface Criterion {
  id: string;
  description: string;
  resourceType: ResourceType;
  minAge?: number;
  maxAge?: number;
  allowedSexes?: string[];
  code?: string;
  codeSystem?: string;
  numericComparator?: ">" | ">=" | "<" | "<=" | "==";
  numericValue?: number;
}

export interface StudyDefinition {
  id: string;
  name: string;
  description: string;
  /** Optional one-page summary (plain text or markdown) for the study. */
  onePageSummary?: string;
  inclusionCriteria: Criterion[];
  exclusionCriteria: Criterion[];
}

export interface PatientSummary {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
}

export interface CriterionEvaluation {
  criterionId: string;
  description: string;
  status: CriterionStatus;
  details?: string;
}

export interface EligibilityResult {
  studyId: string;
  studyName: string;
  overallStatus: OverallStatus;
  inclusion: CriterionEvaluation[];
  exclusion: CriterionEvaluation[];
}

export interface PatientDataBundle {
  patient: unknown;
  observations: unknown[];
  medications: unknown[];
  conditions: unknown[];
  patientSummary: PatientSummary;
}

