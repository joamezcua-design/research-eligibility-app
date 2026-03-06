# Deploy Research Eligibility App to GitHub Pages

GitHub Pages can host your built app so Epic can launch it. Follow these steps.

---

## 1. Create a GitHub repo

- Create a new repository (e.g. `research-eligibility-app`).
- **Do not** initialize with a README if you already have local code.
- Push your local project to it:

```bash
cd /path/to/research-eligibility-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/research-eligibility-app.git
git push -u origin main
```

---

## 2. Set the base path (if repo name is different)

If your repo is **not** named `research-eligibility-app`, edit `frontend/vite.config.ts` and change the base:

```ts
base: process.env.GITHUB_PAGES === "true" ? "/YOUR-REPO-NAME/" : "/",
```

Your app URL will be: `https://YOUR_USERNAME.github.io/YOUR-REPO-NAME/`

---

## 3. Add Epic client ID for production build (optional)

To use real Epic launch in production, set your Epic Client ID when building. For the GitHub Action, add a repository secret:

1. In the repo: **Settings → Secrets and variables → Actions**.
2. Add a secret named `VITE_EPIC_CLIENT_ID` with your Epic OAuth Client ID.

Then in `frontend/package.json`, the build script can use it. Alternatively, build locally with:

```bash
cd frontend
VITE_EPIC_CLIENT_ID=your-client-id npm run build:github
```

For the **GitHub Action** to pass the secret into the build, update the "Install and build" step in `.github/workflows/deploy-pages.yml`:

```yaml
- name: Install and build
  env:
    VITE_EPIC_CLIENT_ID: ${{ secrets.VITE_EPIC_CLIENT_ID }}
  run: |
    cd frontend
    npm ci
    npm run build:github
```

---

## 4. Enable GitHub Pages

1. In the repo go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Save. The first deploy runs after the next push to `main` (or trigger the workflow manually under **Actions**).

---

## 5. Your URLs

After the first successful deploy:

| Purpose | URL |
|--------|-----|
| **App launch URL** (give to Epic as redirect URI) | `https://YOUR_USERNAME.github.io/research-eligibility-app/` |
| **Public documentation** (give to Epic) | `https://YOUR_USERNAME.github.io/research-eligibility-app/docs/` |

The workflow deploys the **app** from `frontend/dist`. To also serve the docs page at `/docs/`, either:

- Copy `docs/index.html` into `frontend/public/docs/` before build so it ends up at `.../docs/`, or  
- Use a second GitHub Pages site or a separate repo for docs.

**Quick option for docs:** Put `docs/index.html` into `frontend/public/docs/index.html`. Vite will copy `public/` into the build root, so the deployed site will have `.../docs/` with the documentation page.

---

## 6. Register in Epic

In Epic’s app registration:

- **Redirect URI:** `https://YOUR_USERNAME.github.io/research-eligibility-app/` (must match exactly, including trailing slash if you use it).
- **Public documentation URL:** `https://YOUR_USERNAME.github.io/research-eligibility-app/docs/` (if you added docs to `public/docs` as above).

---

## 7. Copy docs into the build (recommended)

So the docs are available at `/docs/` on the same site:

```bash
mkdir -p frontend/public/docs
cp docs/index.html frontend/public/docs/
```

Commit and push. Future builds will include the docs at the `/docs/` path.
