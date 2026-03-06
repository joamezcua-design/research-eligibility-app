import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SmartProvider, useSmartContext } from "./fhir/smartClient";
import {
  loadPatientBundle,
  loadPatientBundleForPatient,
  getEDPatientIds
} from "./fhir/fhirQueries";
import { evaluateStudies } from "./eligibility/eligibilityEngine";
import type {
  StudyDefinition,
  EligibilityResult,
  PatientSummary as PatientSummaryType,
  PatientDataBundle
} from "./eligibility/studySchema";
import studiesConfig from "./config/studies.json";
import { PatientSummary } from "./components/PatientSummary";
import { StudySelector } from "./components/StudySelector";
import { EligibilitySummary } from "./components/EligibilitySummary";
import { CriteriaDetails } from "./components/CriteriaDetails";
import { EDCensusView, type EDCensusRow } from "./components/EDCensusView";
import { mockBundle, mockEdPatientBundles } from "./mock/mockBundle";

const studies: StudyDefinition[] = (Array.isArray(studiesConfig) ? studiesConfig : []) as StudyDefinition[];
const ED_CENSUS_PATIENT_LIMIT = 30;

type ViewMode = "current" | "edCensus";

const AppInner: React.FC = () => {
  const { clientState, error, loading: smartLoading } = useSmartContext();
  const [viewMode, setViewMode] = useState<ViewMode>("current");
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
  const [eligibilityResults, setEligibilityResults] = useState<EligibilityResult[] | null>(null);
  const [patientSummary, setPatientSummary] = useState<PatientSummaryType | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [edCensusRows, setEdCensusRows] = useState<EDCensusRow[]>([]);
  const [edCensusLoading, setEdCensusLoading] = useState(false);
  const [edCensusError, setEdCensusError] = useState<string | null>(null);
  const [selectedMockPatientId, setSelectedMockPatientId] = useState<string>(
    () => mockEdPatientBundles[0]?.patientId ?? ""
  );

  useEffect(() => {
    const run = async () => {
      setDataLoading(true);
      try {
        if (!clientState) {
          // In local development without SMART context, use mock data.
          const entry = mockEdPatientBundles.find((e) => e.patientId === selectedMockPatientId)
            ?? mockEdPatientBundles[0];
          const mock: PatientDataBundle = entry?.bundle ?? mockBundle;
          const results = evaluateStudies(mock, studies);
          setEligibilityResults(results);
          setPatientSummary(mock.patientSummary);
          return;
        }

        const bundle = await loadPatientBundle(clientState);
        setPatientSummary(bundle.patientSummary);
        const results = evaluateStudies(bundle, studies);
        setEligibilityResults(results);
      } catch (e) {
        console.error(e);
      } finally {
        setDataLoading(false);
      }
    };

    if (!clientState && !smartLoading) {
      // Mock path: run when we're not in SMART flow or when selected mock patient changes.
      void run();
    } else if (clientState) {
      void run();
    }
    // When smartLoading is true we keep dataLoading true so the UI shows loading.
  }, [clientState, smartLoading, selectedMockPatientId]);

  const loadEDCensus = useCallback(async () => {
    setEdCensusLoading(true);
    setEdCensusError(null);
    setEdCensusRows([]);
    try {
      if (!clientState) {
        // Mock: use fake ED list
        const rows: EDCensusRow[] = mockEdPatientBundles.map(({ bundle }) => ({
          patientSummary: bundle.patientSummary,
          eligibilityResults: evaluateStudies(bundle, studies)
        }));
        setEdCensusRows(rows);
        return;
      }
      const patientIds = await getEDPatientIds(clientState, ED_CENSUS_PATIENT_LIMIT);
      if (patientIds.length === 0) {
        setEdCensusRows([]);
        return;
      }
      const rows: EDCensusRow[] = [];
      for (const id of patientIds) {
        try {
          const bundle = await loadPatientBundleForPatient(clientState, id);
          rows.push({
            patientSummary: bundle.patientSummary,
            eligibilityResults: evaluateStudies(bundle, studies)
          });
        } catch (e) {
          console.warn("Failed to load bundle for patient", id, e);
        }
      }
      setEdCensusRows(rows);
    } catch (e) {
      console.error(e);
      setEdCensusError(e instanceof Error ? e.message : "Failed to load ED census.");
    } finally {
      setEdCensusLoading(false);
    }
  }, [clientState]);

  useEffect(() => {
    if (viewMode === "edCensus") {
      void loadEDCensus();
    }
  }, [viewMode, loadEDCensus]);

  const showPatientLoading = dataLoading || smartLoading;
  const statusLabel = eligibilityResults
    ? "Eligibility evaluated"
    : showPatientLoading
    ? undefined
    : "Pending";

  const selectedStudy = useMemo(
    () => studies.find((s) => s.id === selectedStudyId) ?? null,
    [selectedStudyId]
  );

  const selectedResult = useMemo(
    () =>
      eligibilityResults?.find((r) => r.studyId === selectedStudyId) ?? null,
    [eligibilityResults, selectedStudyId]
  );

  const chartUrlTemplate =
    (import.meta.env.VITE_EPIC_CHART_URL_TEMPLATE as string | undefined) || null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Research Eligibility</h1>
          <p>
            {viewMode === "current"
              ? "Evaluate this patient against configured research studies."
              : "Filter ED patients by study eligibility."}
          </p>
        </div>
        <div className="view-mode-toggle">
          <button
            type="button"
            className={viewMode === "current" ? "active" : ""}
            onClick={() => setViewMode("current")}
          >
            Current patient
          </button>
          <button
            type="button"
            className={viewMode === "edCensus" ? "active" : ""}
            onClick={() => setViewMode("edCensus")}
          >
            ED census
          </button>
        </div>
      </header>

      {viewMode === "edCensus" ? (
        <div className="app-content app-content--full">
          <section className="panel panel--ed-census">
            <div className="panel-title">ED census – eligibility by study</div>
            <EDCensusView
              studies={studies}
              rows={edCensusRows}
              loading={edCensusLoading}
              error={edCensusError}
              chartUrlTemplate={clientState ? chartUrlTemplate : null}
            />
          </section>
        </div>
      ) : (
        <div className="app-content">
          <section className="panel">
            <div className="panel-title">Patient &amp; Studies</div>

            {!clientState && mockEdPatientBundles.length > 0 && (
              <div className="mock-patient-picker">
                <label htmlFor="mock-patient-select">View patient (mock):</label>
                <select
                  id="mock-patient-select"
                  value={selectedMockPatientId}
                  onChange={(e) => setSelectedMockPatientId(e.target.value)}
                >
                  {mockEdPatientBundles.map(({ patientId, bundle }) => (
                    <option key={patientId} value={patientId}>
                      {bundle.patientSummary.name} ({bundle.patientSummary.mrn})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <PatientSummary
              patient={patientSummary}
              loading={showPatientLoading}
              statusLabel={showPatientLoading ? undefined : statusLabel}
              chartUrlTemplate={clientState ? chartUrlTemplate : null}
            />

            {smartLoading && <div className="loading">Loading from Epic…</div>}
            {error && <div className="error">{error}</div>}

            <StudySelector
              studies={studies}
              eligibilityResults={eligibilityResults ?? []}
              selectedStudyId={selectedStudyId}
              onSelectStudy={setSelectedStudyId}
            />
          </section>

          <section className="panel">
            <div className="panel-title">Eligibility Details</div>
            <EligibilitySummary
              studies={studies}
              eligibilityResults={eligibilityResults ?? []}
              selectedStudyId={selectedStudyId}
            />
            <CriteriaDetails
              study={selectedStudy}
              result={selectedResult}
            />
          </section>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SmartProvider>
      <AppInner />
    </SmartProvider>
  );
};

export default App;

