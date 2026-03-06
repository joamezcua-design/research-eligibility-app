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
  onSelectStudy: (id: string | null) => void;
}

function statusForStudy(
  studyId: string,
  results: EligibilityResult[]
): OverallStatus | null {
  const result = results.find((r) => r.studyId === studyId);
  return result ? result.overallStatus : null;
}

function statusLabel(status: OverallStatus | null): {
  label: string;
  className: string;
} {
  if (status === "eligible") {
    return { label: "Eligible", className: "eligibility-badge eligible" };
  }
  if (status === "not_eligible") {
    return { label: "Not eligible", className: "eligibility-badge not-eligible" };
  }
  if (status === "indeterminate") {
    return {
      label: "Indeterminate",
      className: "eligibility-badge indeterminate"
    };
  }
  return {
    label: "Pending",
    className: "eligibility-badge indeterminate"
  };
}

export const StudySelector: React.FC<Props> = ({
  studies,
  eligibilityResults,
  selectedStudyId,
  onSelectStudy
}) => {
  return (
    <ul className="studies-list">
      {studies.map((study) => {
        const status = statusForStudy(study.id, eligibilityResults);
        const badge = statusLabel(status);
        const selected = study.id === selectedStudyId;

        return (
          <li
            key={study.id}
            className={`study-item${selected ? " selected" : ""}`}
            onClick={() =>
              onSelectStudy(selected ? null : study.id)
            }
          >
            <div>
              <div className="study-item-title">{study.name}</div>
              <div className="study-item-desc">{study.description}</div>
            </div>
            <div className={badge.className}>{badge.label}</div>
          </li>
        );
      })}
    </ul>
  );
};

