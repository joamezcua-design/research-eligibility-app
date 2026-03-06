import axios from "axios";
import { PatientDataBundle, PatientSummary } from "../eligibility/studySchema";
import { SmartClientState } from "./smartClient";

function buildHeaders(state: SmartClientState) {
  return {
    Authorization: `Bearer ${state.accessToken}`,
    Accept: "application/fhir+json"
  };
}

function buildPatientSummary(resource: any): PatientSummary {
  const name =
    resource?.name && Array.isArray(resource.name) && resource.name.length > 0
      ? `${resource.name[0].given?.[0] ?? ""} ${resource.name[0].family ?? ""}`.trim()
      : "Unknown";

  const mrnEntry =
    resource?.identifier &&
    Array.isArray(resource.identifier) &&
    resource.identifier[0];

  const mrn = mrnEntry?.value ?? "Unknown";

  const birthDate = resource?.birthDate;
  let age = NaN;

  if (birthDate) {
    const dob = new Date(birthDate);
    const now = new Date();
    age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
      age -= 1;
    }
  }

  const gender =
    typeof resource?.gender === "string"
      ? (resource.gender.charAt(0).toUpperCase() +
          resource.gender.slice(1).toLowerCase())
      : "Unknown";

  return {
    id: resource?.id ?? "unknown",
    name,
    mrn,
    age: Number.isFinite(age) ? age : NaN,
    gender
  };
}

export async function fetchPatient(
  state: SmartClientState
): Promise<any | null> {
  try {
    const response = await axios.get(
      `${state.fhirBaseUrl.replace(/\/+$/, "")}/Patient/${encodeURIComponent(
        state.patientId
      )}`,
      { headers: buildHeaders(state) }
    );
    return response.data;
  } catch (err) {
    console.error("Failed to fetch Patient", err);
    return null;
  }
}

export async function fetchObservations(
  state: SmartClientState,
  loincCodes?: string[]
): Promise<any[]> {
  try {
    const params: Record<string, string> = {
      patient: state.patientId
    };

    if (loincCodes && loincCodes.length > 0) {
      params.code = loincCodes.join(",");
    }

    const response = await axios.get(
      `${state.fhirBaseUrl.replace(/\/+$/, "")}/Observation`,
      {
        headers: buildHeaders(state),
        params
      }
    );

    const bundle = response.data;

    if (bundle?.entry && Array.isArray(bundle.entry)) {
      return bundle.entry
        .map((e: any) => e.resource)
        .filter((r: any) => r && r.resourceType === "Observation");
    }

    return [];
  } catch (err) {
    console.error("Failed to fetch Observations", err);
    return [];
  }
}

export async function fetchMedications(
  state: SmartClientState
): Promise<any[]> {
  try {
    const response = await axios.get(
      `${state.fhirBaseUrl.replace(/\/+$/, "")}/MedicationRequest`,
      {
        headers: buildHeaders(state),
        params: {
          patient: state.patientId,
          status: "active"
        }
      }
    );

    const bundle = response.data;

    if (bundle?.entry && Array.isArray(bundle.entry)) {
      return bundle.entry
        .map((e: any) => e.resource)
        .filter((r: any) => r && r.resourceType === "MedicationRequest");
    }

    return [];
  } catch (err) {
    console.error("Failed to fetch MedicationRequest", err);
    return [];
  }
}

export async function fetchConditions(
  state: SmartClientState
): Promise<any[]> {
  try {
    const response = await axios.get(
      `${state.fhirBaseUrl.replace(/\/+$/, "")}/Condition`,
      {
        headers: buildHeaders(state),
        params: {
          patient: state.patientId
        }
      }
    );

    const bundle = response.data;

    if (bundle?.entry && Array.isArray(bundle.entry)) {
      return bundle.entry
        .map((e: any) => e.resource)
        .filter((r: any) => r && r.resourceType === "Condition");
    }

    return [];
  } catch (err) {
    console.error("Failed to fetch Conditions", err);
    return [];
  }
}

/** State with a specific patient id (for loading another patient's data when token allows). */
export function stateForPatient(
  state: SmartClientState,
  patientId: string
): SmartClientState {
  return { ...state, patientId };
}

/** Load full patient bundle for a given patient id (same token, different patient). */
export async function loadPatientBundleForPatient(
  state: SmartClientState,
  patientId: string
): Promise<PatientDataBundle> {
  return loadPatientBundle(stateForPatient(state, patientId));
}

/**
 * Fetch in-progress encounters (e.g. ED). Epic may require user/Encounter.read
 * and may support type or class for ED (e.g. class=EMER). Returns raw Encounter resources.
 */
export async function fetchEncounters(
  state: SmartClientState,
  options: { status?: string; limit?: number } = {}
): Promise<any[]> {
  const { status = "in-progress", limit = 100 } = options;
  try {
    const params: Record<string, string | number> = {
      status,
      _count: limit
    };
    const response = await axios.get(
      `${state.fhirBaseUrl.replace(/\/+$/, "")}/Encounter`,
      {
        headers: buildHeaders(state),
        params
      }
    );

    const bundle = response.data;
    if (bundle?.entry && Array.isArray(bundle.entry)) {
      return bundle.entry
        .map((e: any) => e.resource)
        .filter((r: any) => r && r.resourceType === "Encounter");
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch Encounters", err);
    return [];
  }
}

/**
 * Get unique patient ids from in-progress encounters (e.g. current ED census).
 * Use with user/Encounter.read scope to see all ED patients; patient/Encounter.read may only return current patient.
 */
export async function getEDPatientIds(
  state: SmartClientState,
  limit: number = 50
): Promise<string[]> {
  const encounters = await fetchEncounters(state, { status: "in-progress", limit });
  const ids = new Set<string>();
  for (const enc of encounters) {
    const ref = enc?.subject?.reference;
    if (typeof ref === "string" && ref.startsWith("Patient/")) {
      ids.add(ref.replace(/^Patient\//, ""));
    }
  }
  return Array.from(ids);
}

export async function loadPatientBundle(
  state: SmartClientState
): Promise<PatientDataBundle> {
  const [patient, observations, medications, conditions] = await Promise.all([
    fetchPatient(state),
    fetchObservations(state),
    fetchMedications(state),
    fetchConditions(state)
  ]);

  const summary = patient ? buildPatientSummary(patient) : {
    id: "unknown",
    name: "Unknown",
    mrn: "Unknown",
    age: NaN,
    gender: "Unknown"
  };

  return {
    patient,
    observations,
    medications,
    conditions,
    patientSummary: summary
  };
}

