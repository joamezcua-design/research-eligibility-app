# Local development

How to run the Research Eligibility app on your machine for development and testing.

---

## 1. Prerequisites

- **Node.js** (v18 or 20 recommended). Check: `node -v`
- **npm** (comes with Node). Check: `npm -v`

If you don’t have Node: install from [nodejs.org](https://nodejs.org) or use `nvm` / `brew install node`.

---

## 2. Open the project

```bash
cd /Users/josephamezcua/research-eligibility-app
```

(Or open the `research-eligibility-app` folder in Cursor/VS Code.)

---

## 3. Install dependencies

From the project root:

```bash
cd frontend
npm install
```

---

## 4. (Optional) Epic client ID for launch testing

To test a **real Epic launch** from your machine (e.g. Epic sandbox pointing at your local URL), the app needs your Epic OAuth Client ID.

1. In the `frontend` folder, copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Open `frontend/.env` and set:
   ```bash
   VITE_EPIC_CLIENT_ID=your_non_production_client_id_here
   ```
   Use the **non-production** client ID from EMRAP. Save the file.

If you **don’t** set this, the app still runs locally but uses **mock patient data** (no real Epic connection). That’s enough for UI and eligibility logic.

---

## 5. Start the dev server

From the `frontend` folder:

```bash
npm run dev
```

You should see something like:

```text
  VITE v7.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173/** in your browser.

---

## 6. What you’ll see

- **Without Epic launch:** The app loads with **mock data** (e.g. “Jane Doe”). You can use “Current patient” and “ED census” and test eligibility with that data.
- **With Epic launch:** If Epic (or a sandbox) is configured to launch to `http://localhost:5173/` (and your `.env` has the client ID), opening that launch link will redirect to Epic to sign in, then back to your app with real patient context.  
  Note: Epic must have **http://localhost:5173/** (or your actual local URL) registered as a redirect URI for the client ID you use.

---

## 7. Other commands

| Command | What it does |
|--------|----------------|
| `npm run dev` | Start dev server (hot reload). |
| `npm run build` | Production build (output in `frontend/dist`). |
| `npm run preview` | Serve the production build locally (e.g. at http://localhost:4173). |

---

## 8. Troubleshooting

- **“SMART client ID is not configured”**  
  You’re hitting the Epic launch path but `VITE_EPIC_CLIENT_ID` isn’t set. Add it to `frontend/.env` (see step 4) or ignore and use mock data by opening the app directly at http://localhost:5173/ without launch params.

- **Port already in use**  
  Vite will try the next port (e.g. 5174). Use the URL it prints.

- **Epic redirect to localhost doesn’t work**  
  Confirm the non-production app in Epic has **http://localhost:5173/** (or your dev URL) as an allowed redirect URI.
