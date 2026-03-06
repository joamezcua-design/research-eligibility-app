import {
  Criterion,
  CriterionEvaluation,
  EligibilityResult,
  OverallStatus,
  PatientDataBundle,
  StudyDefinition
} from "./studySchema";

function calculateOverallStatus(
  inclusion: CriterionEvaluation[],
  exclusion: CriterionEvaluation[]
): OverallStatus {
  const hasFailedInclusion = inclusion.some((c) => c.status === "fail");
  const hasTriggeredExclusion = exclusion.some((c) => c.status === "pass");
  const hasUnknown = [...inclusion, ...exclusion].some(
    (c) => c.status === "unknown"
  );

  if (hasFailedInclusion || hasTriggeredExclusion) {
    return "not_eligible";
  }

  if (hasUnknown) {
    return "indeterminate";
  }

  return "eligible";
}

function evaluateCriterion(
  criterion: Criterion,
  bundle: PatientDataBundle,
  group: "inclusion" | "exclusion"
): CriterionEvaluation {
  if (criterion.resourceType === "Patient") {
    const age = bundle.patientSummary.age;
    const gender = (bundle.patientSummary.gender ?? "").toString().toLowerCase();

    if (
      typeof criterion.minAge === "number" &&
      Number.isFinite(criterion.minAge) &&
      age < criterion.minAge
    ) {
      return {
        criterionId: criterion.id,
        description: criterion.description,
        status: "fail",
        details: `Age ${age} is below minimum of ${criterion.minAge}.`
      };
    }

    if (
      typeof criterion.maxAge === "number" &&
      Number.isFinite(criterion.maxAge) &&
      age > criterion.maxAge
    ) {
      return {
        criterionId: criterion.id,
        description: criterion.description,
        status: "fail",
        details: `Age ${age} is above maximum of ${criterion.maxAge}.`
      };
    }

    if (
      Array.isArray(criterion.allowedSexes) &&
      criterion.allowedSexes.length > 0 &&
      !criterion.allowedSexes
        .map((s) => s.toLowerCase())
        .includes(gender)
    ) {
      return {
        criterionId: criterion.id,
        description: criterion.description,
        status: "fail",
        details: `Sex ${bundle.patientSummary.gender} not in allowed set.`
      };
    }

    return {
      criterionId: criterion.id,
      description: criterion.description,
      status: "pass",
      details: `Age ${age} and sex ${bundle.patientSummary.gender} satisfy criterion.`
    };
  }

  const resources =
    criterion.resourceType === "Observation"
      ? bundle.observations
      : criterion.resourceType === "Condition"
      ? bundle.conditions
      : bundle.medications;

  const matches = resources.filter((resource: any) => {
    const codingPath =
      criterion.resourceType === "Observation"
        ? resource.code?.coding
        : criterion.resourceType === "Condition"
        ? resource.code?.coding
        : resource.medicationCodeableConcept?.coding;

    if (!codingPath || !Array.isArray(codingPath)) {
      return false;
    }

    return codingPath.some((coding: any) => {
      const codeMatches =
        !criterion.code || coding.code === String(criterion.code);
      const systemMatches =
        !criterion.codeSystem || coding.system === String(criterion.codeSystem);
      return codeMatches && systemMatches;
    });
  });

  if (matches.length === 0) {
    return {
      criterionId: criterion.id,
      description: criterion.description,
      status: "fail",
      details:
        group === "inclusion"
          ? "No matching resources found."
          : "No matching resources found (no exclusion triggered)."
    };
  }

  if (
    criterion.numericComparator &&
    typeof criterion.numericValue === "number"
  ) {
    const latest = (matches as any[]).reduce((acc, cur) => {
      const accDate =
        acc.effectiveDateTime || acc.issued || acc.meta?.lastUpdated;
      const curDate =
        cur.effectiveDateTime || cur.issued || cur.meta?.lastUpdated;
      if (!accDate) return cur;
      if (!curDate) return acc;
      return new Date(curDate) > new Date(accDate) ? cur : acc;
    });

    const value = latest?.valueQuantity?.value;

    if (typeof value !== "number") {
      return {
        criterionId: criterion.id,
        description: criterion.description,
        status: "unknown",
        details: "Latest matching observation has no numeric value."
      };
    }

    const target = criterion.numericValue;
    let ok = false;

    switch (criterion.numericComparator) {
      case ">":
        ok = value > target;
        break;
      case ">=":
        ok = value >= target;
        break;
      case "<":
        ok = value < target;
        break;
      case "<=":
        ok = value <= target;
        break;
      case "==":
        ok = value === target;
        break;
    }

    return {
      criterionId: criterion.id,
      description: criterion.description,
      status: ok ? "pass" : "fail",
      details: `Latest value ${value} ${ok ? "meets" : "does not meet"} threshold ${
        criterion.numericComparator
      } ${target}.`
    };
  }

  return {
    criterionId: criterion.id,
    description: criterion.description,
    status: "pass",
    details: "Matching resource found."
  };
}

export function evaluateStudies(
  bundle: PatientDataBundle,
  studies: StudyDefinition[]
): EligibilityResult[] {
  return studies.map((study) => {
    const inclusion = study.inclusionCriteria.map((c) =>
      evaluateCriterion(c, bundle, "inclusion")
    );

    const exclusion = study.exclusionCriteria.map((c) =>
      evaluateCriterion(c, bundle, "exclusion")
    );

    const overallStatus = calculateOverallStatus(inclusion, exclusion);

    return {
      studyId: study.id,
      studyName: study.name,
      overallStatus,
      inclusion,
      exclusion
    };
  });
}

