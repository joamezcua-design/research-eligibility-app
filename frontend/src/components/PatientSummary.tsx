import React from "react";
import type { PatientSummary as PatientSummaryType } from "../eligibility/studySchema";

interface PatientSummaryProps {
  /** Patient summary when loaded; null while loading or when no patient context. */
  patient: PatientSummaryType | null;
  /** True while patient data (and eligibility) are being fetched. */
  loading?: boolean;
  /** Optional status label, e.g. "Eligibility evaluated" or "Pending". */
  statusLabel?: string;
  /** When set (e.g. from Epic), show "Open in EMR" link. Template: use {patientId} as placeholder. */
  chartUrlTemplate?: string | null;
}

export const PatientSummary: React.FC<PatientSummaryProps> = ({
  patient,
  loading = false,
  statusLabel,
  chartUrlTemplate
}) => {
  if (loading) {
    return (
      <div className="patient-summary patient-summary--loading" aria-busy="true">
        <div className="patient-summary-row">
          <span className="loading">Loading patient data…</span>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-summary patient-summary--empty">
        <div className="patient-summary-row">
          <span className="status-text">No patient context available.</span>
        </div>
      </div>
    );
  }

  const displayAge = Number.isFinite(patient.age) ? patient.age : "—";
  const displayName = patient.name || "Unknown";
  const displayMrn = patient.mrn || "—";
  const displayGender = patient.gender || "—";

  return (
    <div className="patient-summary">
      <div className="patient-summary-row">
        <span className="patient-summary-name">{displayName}</span>
        <span className="tag tag-blue" title="Medical Record Number">
          {displayMrn}
        </span>
      </div>
      <div className="patient-summary-row">
        <span className="patient-summary-demographics">
          {displayAge} years · {displayGender}
        </span>
        {statusLabel && (
          <span className="tag tag-gray">{statusLabel}</span>
        )}
      </div>
      {chartUrlTemplate && patient.id && (
        <div className="patient-summary-row patient-summary-chart-link">
          <a
            href={chartUrlTemplate.replace(/\{patientId\}/g, encodeURIComponent(patient.id))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in EMR
          </a>
        </div>
      )}
    </div>
  );
};
