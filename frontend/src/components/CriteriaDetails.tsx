import React from "react";
import {
  Criterion,
  CriterionEvaluation,
  EligibilityResult,
  StudyDefinition
} from "../eligibility/studySchema";

interface Props {
  study: StudyDefinition | null;
  result: EligibilityResult | null;
}

function evaluationFor(
  criterion: Criterion,
  evaluations: CriterionEvaluation[]
): CriterionEvaluation | null {
  return evaluations.find((e) => e.criterionId === criterion.id) ?? null;
}

function pillClass(status: CriterionEvaluation["status"]): string {
  switch (status) {
    case "pass":
      return "pill pill-pass";
    case "fail":
      return "pill pill-fail";
    default:
      return "pill indeterminate";
  }
}

function pillLabel(status: CriterionEvaluation["status"]): string {
  switch (status) {
    case "pass":
      return "Pass";
    case "fail":
      return "Fail";
    default:
      return "Unknown";
  }
}

const renderCriteriaGroup = (
  title: string,
  criteria: Criterion[],
  evaluations: CriterionEvaluation[]
) => {
  if (criteria.length === 0) {
    return null;
  }

  return (
    <div className="criteria-section">
      <h3>{title}</h3>
      <ul className="criteria-list">
        {criteria.map((c) => {
          const ev = evaluationFor(c, evaluations);
          const status = ev?.status ?? "unknown";

          return (
            <li key={c.id} className="criterion-row">
              <div>
                <div className="criterion-label">{c.description}</div>
                {ev?.details && (
                  <div className="criterion-meta">{ev.details}</div>
                )}
              </div>
              <div className={pillClass(status)}>{pillLabel(status)}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const CriteriaDetails: React.FC<Props> = ({ study, result }) => {
  if (!study || !result) {
    return (
      <div className="status-text">
        Select a study on the left to see per-criterion details.
      </div>
    );
  }

  return (
    <div>
      {study.onePageSummary && (
        <div className="study-one-page-summary">
          <h3>One-page summary</h3>
          <div className="study-one-page-summary-content">
            {study.onePageSummary}
          </div>
        </div>
      )}
      {renderCriteriaGroup(
        "Inclusion criteria",
        study.inclusionCriteria,
        result.inclusion
      )}
      {renderCriteriaGroup(
        "Exclusion criteria",
        study.exclusionCriteria,
        result.exclusion
      )}
    </div>
  );
};

