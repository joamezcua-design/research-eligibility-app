import React from "react";
import {
  EligibilityResult,
  OverallStatus,
  StudyDefinition
} from "../eligibility/studySchema";

interface Props {
  studies: StudyDefinition[];
  eligibilityResults: EligibilityResult[];
  selectedStudyId: string | null;
}

function overallCounts(results: EligibilityResult[]): Record<OverallStatus, number> {
  return results.reduce(
    (acc, r) => {
      acc[r.overallStatus] += 1;
      return acc;
    },
    { eligible: 0, not_eligible: 0, indeterminate: 0 } as Record<
      OverallStatus,
      number
    >
  );
}

export const EligibilitySummary: React.FC<Props> = ({
  studies,
  eligibilityResults,
  selectedStudyId
}) => {
  if (studies.length === 0) {
    return <div className="status-text">No studies configured.</div>;
  }

  if (eligibilityResults.length === 0) {
    return <div className="status-text">Run in Epic or use mock data to see eligibility.</div>;
  }

  const counts = overallCounts(eligibilityResults);
  const selected =
    selectedStudyId &&
    eligibilityResults.find((r) => r.studyId === selectedStudyId);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div className="status-text" style={{ marginBottom: "0.5rem" }}>
        Overall:{" "}
        <strong>
          {counts.eligible} eligible · {counts.not_eligible} not eligible ·{" "}
          {counts.indeterminate} indeterminate
        </strong>
      </div>

      {selected && (
        <div className="status-text">
          Selected study: <strong>{selected.studyName}</strong> —{" "}
          {selected.overallStatus === "eligible"
            ? "Eligible"
            : selected.overallStatus === "not_eligible"
            ? "Not eligible"
            : "Indeterminate"}
        </div>
      )}
    </div>
  );
};

