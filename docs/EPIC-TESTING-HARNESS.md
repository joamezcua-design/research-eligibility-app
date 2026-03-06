# Epic Browser Simulator (EBS) – Testing Your App in the EHR

Epic may require you to test your web app using the **Epic Browser Simulator (EBS)** (also called the “testing harness”). The harness simulates how your app runs inside the browser embedded in Epic Hyperspace. You do **not** install the harness into your app; you run it separately and point it at your app’s URL.

---

## What the harness is

- **Epic Browser Simulator (EBS)** – A Windows program (e.g. `EpicBrowserTester.exe`) that loads a web page inside an Internet Explorer–based embedded browser, similar to Epic Hyperspace.
- **Purpose** – To verify your app works in the same environment Epic uses (IE emulation, document mode, no new windows).
- **Legal** – Use is governed by the **Agreement.html** in the TestingHarness folder (EULA). Use is for **testing only**, US only, and not in a live production environment.

---

## How to use it with the Research Eligibility app

### 1. Accept the agreement

Open **Agreement.html** from the TestingHarness folder, read the EULA, and accept it as required by Epic. Do not use EBS until you have accepted.

### 2. Set browser emulation (Windows)

Epic’s README says to set **FEATURE_BROWSER_EMULATION** so the tester uses the right IE version:

- **8000** – Epic 2012/2014 with IE8/9/10 (use **SetEpicBrowserTester8000.reg**).
- **10001** – Epic 2014/2015 with IE11 (use **SetEpicBrowserTester10001.reg**).

On a Windows machine:

1. Double‑click the appropriate `.reg` file (or right‑click → Merge).
2. Confirm adding to the registry.
3. Restart the Epic Browser Tester if it’s already running (README says to click “Relaunch” so a new instance uses the setting).

Confirm with your Epic/EMRAP team which Epic version you’re targeting so you use the correct emulation.

### 3. Run the tester and open your app

1. Run **EpicBrowserTester.exe** (or whatever executable Epic provided in the harness).
2. In the tester UI, in the **URL** field, enter your app’s address, for example:
   - **Local:** `http://localhost:5173/` (with your app running via `npm run dev`).
   - **Deployed:** `https://joamezcua-design.github.io/research-eligibility-app/`
3. Click **Navigate**.
4. The app loads inside the simulated embedded browser. Verify:
   - Page loads without errors.
   - Layout and styling look correct.
   - You can use the app (e.g. switch Current patient / ED census, select studies, see eligibility).

### 4. “No new browser windows”

The README states: **“The tester explicitly prevents new browser windows from showing.”**

- Links that use **`target="_blank"`** (e.g. “Open in EMR”) will **not** open a new window in the harness.
- That’s expected in the simulator. In real Epic, behavior may differ; confirm with Epic/EMRAP whether new windows are allowed there.
- If Epic also blocks new windows in production, you may need to change “Open in EMR” to open in the same window (e.g. same tab) instead of a new one.

### 5. Document mode (IE standards)

Epic recommends specific document modes (see README and the MSDN link there). For example, Epic 2015 + IE11 uses **IE10 standards mode**. Modern React/Vite apps assume modern browsers; if the harness uses an older mode, some features may not work. If you see layout or script errors in the harness, report them to Epic/EMRAP; they may have guidance or a newer harness for current Epic versions.

---

## Checklist for Epic

- [ ] Accept the EBS license (Agreement.html).
- [ ] Set FEATURE_BROWSER_EMULATION (8000 or 10001) per your Epic version.
- [ ] Run the Epic Browser Tester and navigate to your app URL (local or GitHub Pages).
- [ ] Confirm the app loads and core flows work (patient view, ED census, study selection, eligibility).
- [ ] Note any issues (blank page, script errors, layout problems) and share with Epic/EMRAP if needed.

---

## Where the harness lives

Keep the **TestingHarness** folder (Agreement.html, README.txt, .reg files, and any .exe) on your machine or your team’s shared location. Do **not** copy it into the research-eligibility-app repo unless Epic allows it; the EULA restricts use and distribution. This doc in the repo is only instructions for using the harness with your app.
