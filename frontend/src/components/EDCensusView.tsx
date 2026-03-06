import React from "react";
import type {
  EligibilityResult,
  OverallStatus,
  PatientSummary as PatientSummaryType,
  StudyDefinition
} from "../eligibility/studySchema";

export interface EDCensusRow {
  patientSummary: PatientSummaryType;
  eligibilityResults: EligibilityResult[];
}

interface Props {
  studies: StudyDefinition[];
  rows: EDCensusRow[];
  loading: boolean;
  error: string | null;
  /** When set (e.g. from Epic), patient names link to open chart in EMR. Use {patientId} in template. */
  chartUrlTemplate?: string | null;
}

function statusLabel(status: OverallStatus | null): { label: string; className: string } {
  if (status === "eligible") {
    return { label: "Eligible", className: "eligibility-badge eligible" };
  }
  if (status === "not_eligible") {
    return { label: "Not eligible", className: "eligibility-badge not-eligible" };
  }
  if (status === "indeterminate") {
    return { label: "Indeterminate", className: "eligibility-badge indeterminate" };
  }
  return { label: "—", className: "eligibility-badge indeterminate" };
}

export const EDCensusView: React.FC<Props> = ({
  studies,
  rows,
  loading,
  error,
  chartUrlTemplate
}) => {
  if (error) {
    return (
      <div className="ed-census ed-census-error">
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ed-census ed-census-loading">
        <p>Loading ED census and evaluating eligibility…</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="ed-census ed-census-empty">
        <p>No patients in the current ED census (or no encounters returned).</p>
      </div>
    );
  }

  return (
    <div className="ed-census">
      <div className="ed-census-table-wrap">
        <table className="ed-census-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>MRN</th>
              <th>Age</th>
              <th>Sex</th>
              {studies.map((s) => (
                <th key={s.id}>{s.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const ageStr = Number.isFinite(row.patientSummary.age)
                ? String(row.patientSummary.age)
                : "—";
              const chartUrl =
                chartUrlTemplate && row.patientSummary.id
                  ? chartUrlTemplate.replace(/\{patientId\}/g, encodeURIComponent(row.patientSummary.id))
                  : null;
              return (
                <tr key={row.patientSummary.id}>
                  <td className="ed-census-patient-name">
                    {chartUrl ? (
                      <a
                        href={chartUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ed-census-patient-link"
                      >
                        {row.patientSummary.name}
                      </a>
                    ) : (
                      row.patientSummary.name
                    )}
                  </td>
                  <td>{row.patientSummary.mrn}</td>
                  <td>{ageStr}</td>
                  <td>{row.patientSummary.gender}</td>
                  {studies.map((study) => {
                    const result = row.eligibilityResults.find(
                      (r) => r.studyId === study.id
                    );
                    const status = result?.overallStatus ?? null;
                    const { label, className } = statusLabel(status);
                    return (
                      <td key={study.id}>
                        <span className={className}>{label}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
