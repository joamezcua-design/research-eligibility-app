# Research Eligibility App — Public Documentation

**App name:** Research Eligibility  

**Version:** 1.0  

---

## What this app does

Research Eligibility is a **SMART on FHIR** web application that runs inside the electronic health record (EHR). It helps clinical and research staff identify patients who may be eligible for active research studies.

- **Single-patient view:** When launched from a patient chart, the app evaluates that patient against configured research studies and shows eligibility (Eligible / Not eligible / Indeterminate) with a breakdown of inclusion and exclusion criteria.
- **ED census view:** The app can list patients currently in the Emergency Department and show, for each patient, which studies they may qualify for, to support screening and enrollment workflows.

The app is **read-only**: it does not create, update, or delete any data in the EHR.

---

## Data access

The app requests access to the following types of patient data via the EHR’s FHIR API, only for the purpose of evaluating eligibility against study criteria:

- **Demographics** (e.g., age, sex)  
- **Diagnoses and conditions** (problem list, history)  
- **Laboratory and observation results** (e.g., labs, vitals)  
- **Medications** (current and recent)  
- **Encounters** (e.g., to identify current ED patients or recent hospitalizations)  
- **Procedures** (when needed for study criteria)  
- **Allergies and intolerances** (when needed for study criteria)

All access is limited to what is authorized by the EHR (e.g., Epic) when a user launches the app. The app does not store patient data on external servers; processing happens in the user’s browser or within the organization’s deployed environment.

---

## Privacy and security

- The app uses the **SMART on FHIR** authorization flow. Access to patient data is granted by the EHR based on the logged-in user’s role and the scopes requested by the app.
- No patient data is sent to third-party services for eligibility logic. Study definitions (inclusion/exclusion criteria) are configured within the organization’s deployment.
- The app is intended to be hosted on the organization’s own infrastructure or a trusted, compliant hosting environment (e.g., behind the same security and compliance policies as other clinical tools).

---

## Support

For technical or access questions about this app, contact your organization’s **ED Research Coordinator** or the **study team** responsible for research eligibility screening at your site.

---

*This app is used to support research study screening and enrollment workflows in alignment with institutional IRB and EHR governance policies.*
