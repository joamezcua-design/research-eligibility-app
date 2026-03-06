# Epic SMART on FHIR Configuration

This document describes how to register and configure the Research Eligibility App as a SMART on FHIR client in Epic so it can be launched from the EHR and access patient data via Epic’s FHIR APIs.

## Overview

The app is a **browser-based SMART on FHIR app** that:

- Launches from Epic (e.g., from a patient chart or App Orchard)
- Uses the **authorization code** flow with PKCE (via the `fhirclient` library)
- Requests **patient context** and **read-only** FHIR scopes

You must register the app in Epic’s developer portal (App Orchard or your Epic environment’s app registration) and configure the same redirect URI, scopes, and launch type used by the app.

---

## 1. Register the app as a SMART on FHIR client

### Where to register

- **Epic App Orchard** (production): [Epic App Orchard](https://apporchard.epic.com/) — for distributing to Epic customers.
- **Epic FHIR sandbox / test environment**: Your organization’s Epic FHIR configuration or sandbox portal (e.g., Epic’s FHIR sandbox or your instance’s “App configuration” / “OAuth2 Applications”).

Use the registration UI to create a new **OAuth 2.0 / SMART on FHIR** application and note the **Client ID**. The app uses a **public client** (no client secret) with PKCE.

### Application type

- **Application type**: **Confidential** or **Public** — this app is typically used as a **public client** (SPA) with PKCE; if your Epic setup only offers “Confidential,” use that and ensure redirect URI and scopes match.
- **Grant type**: **Authorization Code** with **PKCE** (the `fhirclient` library handles PKCE).

---

## 2. Redirect URI

The app builds the redirect URI as:

```text
{origin}{pathname}
```

For example:

- Local dev: `http://localhost:5173/` (or the path where the app is served, e.g. `http://localhost:5173/index.html`)
- Production: `https://your-app-domain.com/` (or the exact path where the app is loaded, e.g. `https://your-app-domain.com/`)

**You must add this exact URL to the list of allowed Redirect URIs in Epic.**  
Epic will only redirect back to URIs that are explicitly registered; no wildcards. Use the same protocol, host, port (if non-default), and path that the browser uses when loading the app.

**Examples:**

| Environment | Redirect URI |
|-------------|--------------|
| Vite dev server (default) | `http://localhost:5173/` |
| Production (root) | `https://research-eligibility.your-org.org/` |
| Production (subpath) | `https://apps.your-org.org/eligibility/` |

Add every environment (dev, staging, prod) you plan to use.

---

## 3. Scopes

The app requests the following OAuth scopes (read-only, patient context):

| Scope | Purpose |
|-------|---------|
| `launch` | Required for EHR launch; provides `launch` and `iss` in the redirect. |
| `openid` | OpenID Connect (optional but often required by Epic). |
| `fhirUser` | Identity of the user in FHIR (e.g. `Practitioner`). |
| `patient/Patient.read` | Read patient demographics. |
| `patient/Observation.read` | Read lab results and other observations. |
| `patient/MedicationRequest.read` | Read medications. |
| `patient/Condition.read` | Read conditions (diagnoses, history). |
| `patient/Encounter.read` | Read encounters (used for **ED census**: list of patients currently in the ED). |

**Default scope string** used by the app (if `VITE_EPIC_SCOPE` is not set):

```text
launch openid fhirUser patient/Patient.read patient/Observation.read patient/MedicationRequest.read patient/Condition.read patient/Encounter.read
```

**ED census (multi-patient list):** The app can show “ED census”—all patients currently in the ED—and filter them by study eligibility. To see encounters for *all* ED patients (not just the current patient in context), Epic may require **user-level** scopes (e.g. `user/Encounter.read`, and possibly `user/Patient.read`, etc.). Ask your Epic connection team which scopes are needed for cross-patient encounter search in your environment.

In Epic’s app registration:

1. Ensure the application is allowed to request these scopes (or your environment’s equivalent).
2. Configure the app’s requested scopes to include at least the above. Some Epic configurations let you select “SMART on FHIR” or “Patient read” presets that map to these.

If you need a different set of scopes (e.g. user-level instead of patient-level), set **`VITE_EPIC_SCOPE`** in your build environment to a space-separated list of scopes; the app will use that instead of the default.

---

## 4. Launch type

The app supports **EHR launch** (launch from inside Epic with patient context):

- Epic passes `launch` and `iss` (and after redirect, `code`) to the app.
- The app uses `launch` and `iss` when initiating the authorization request and exchanges `code` for an access token.

In Epic:

- Set **Launch type** to **EHR launch** (or equivalent).
- Ensure the app is associated with the right launch context (e.g. patient chart, encounter) so that `patient` (and optionally `encounter`) are available in the token/context.

**Standalone launch** (user picks a patient outside Epic) is not required for the current flow; if you add it later, register an additional redirect URI or the same one if your app supports both.

---

## 5. Environment variables (app side)

The app reads the following at **build time** (Vite embeds them in the client bundle):

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_EPIC_CLIENT_ID` | Yes | OAuth 2.0 Client ID from Epic app registration. |
| `VITE_EPIC_SCOPE` | No | Space-separated scopes; if unset, the app uses the default scope string above. |
| `VITE_EPIC_CHART_URL_TEMPLATE` | No | URL template to open a patient chart in the EMR. Use `{patientId}` as placeholder. When set, “Open in EMR” and clickable patient names (ED census) appear. **Ask your Epic/EMRAP team for the exact URL format** for your instance. |

**Opening the patient chart in Epic:** To let users click a patient and open their chart in the EMR, set `VITE_EPIC_CHART_URL_TEMPLATE` to the URL pattern your Epic deployment uses. For example: `https://epic.your-org.org/patientchart?patientId={patientId}`. The app replaces `{patientId}` with the FHIR patient ID. Epic/EMRAP can provide the correct format for your environment.

Example `.env` for local development:

```env
VITE_EPIC_CLIENT_ID=your-epic-client-id
# Optional: override scopes
# VITE_EPIC_SCOPE=launch openid fhirUser patient/Patient.read patient/Observation.read patient/MedicationRequest.read patient/Condition.read
# Optional: link to open patient chart in EMR (ask Epic/EMRAP for the URL format)
# VITE_EPIC_CHART_URL_TEMPLATE=https://epic.your-org.org/patientchart?patientId={patientId}
```

For production, set these in your CI/CD or hosting platform so the built app has the correct client ID (and scopes, if overridden).

---

## 6. Deployment requirements

For Epic to open the app and redirect back after login:

1. **HTTPS in production** — Use a valid TLS certificate; Epic will not redirect to `http` in production.
2. **Reachable URL** — The app’s URL (origin + path) must be reachable from the networks where Epic runs (and from the user’s browser after redirect).
3. **Static hosting** — The app can be deployed as a static site (e.g. Vite build output). No backend is required for the SMART launch flow; the app uses the browser and Epic’s token endpoint.

---

## 7. Checklist summary

- [ ] Create an OAuth 2.0 / SMART on FHIR application in Epic (App Orchard or your Epic FHIR config).
- [ ] Copy the **Client ID** and set **`VITE_EPIC_CLIENT_ID`** in your build environment.
- [ ] Add the **exact Redirect URI(s)** (dev, staging, prod) to Epic.
- [ ] Configure **scopes** to include at least: `launch`, `openid`, `fhirUser`, and `patient/*.read` for Patient, Observation, MedicationRequest, and Condition.
- [ ] Set **Launch type** to **EHR launch** and attach the app to the desired launch context in Epic.
- [ ] Deploy the app over **HTTPS** at the same origin/path as the registered redirect URI.
- [ ] Test the launch from Epic (e.g. sandbox) and confirm the app receives `code`, exchanges it for a token, and can read patient data.

---

## References

- [SMART App Launch Framework](http://hl7.org/fhir/smart-app-launch/)
- [Epic on FHIR](https://fhir.epic.com/) — Epic’s FHIR documentation and developer resources.
- [App Orchard](https://apporchard.epic.com/) — Epic’s app marketplace and registration portal.
