# GOD MODE — Abhishek's Training Hub

A hybrid-athlete training, nutrition, and progress hub. Vite + React + TypeScript + Tailwind CSS,
with Firebase (Firestore + Google Auth) for cross-device sync, deployed to GitHub Pages.

The original single-file prototype lives in `legacy/` for reference.

## Stack

- **Vite + React + TypeScript** — build tooling and app framework
- **Tailwind CSS v4** — styling, design tokens in `src/index.css`
- **motion** (Framer Motion's current package name) — animation
- **Firebase** — Firestore (per-user data sync) + Google sign-in
- **Recharts** — weight trend chart
- **react-router-dom** — the 5 tabs (Today / Train / Diet / Tracker / Progress)

The app works fully offline on `localStorage` even without Firebase configured — Firebase only
adds cross-device sync once wired up.

## Local dev

```bash
npm install
npm run dev
```

## Firebase setup (for cross-device sync)

1. [Firebase Console](https://console.firebase.google.com) → Create project (free Spark plan).
2. **Build → Firestore Database** → Create database → production mode → pick a region.
3. **Build → Authentication** → Get started → enable **Google** sign-in provider.
4. **Project settings** (gear icon) → your apps → **Web** (`</>`) → register an app → copy the
   `firebaseConfig` values into a local `.env.local` (copy `.env.example` as a starting point).
5. In **Firestore → Rules**, replace the default with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

   This scopes every user to only their own `users/{uid}/...` data.

## Deploying to GitHub Pages

1. Push this repo to GitHub (already wired to `https://github.com/i-abhishekkk/Fitness-app.git`).
2. Repo **Settings → Pages → Build and deployment → Source**: select **GitHub Actions**.
3. Repo **Settings → Secrets and variables → Actions**, add the same 6 `VITE_FIREBASE_*` values
   from your `.env.local` as repository secrets (so CI can build with them — the values are safe
   to expose client-side, but keeping them as secrets avoids hardcoding in the workflow file).
4. Push to `main` — `.github/workflows/deploy.yml` builds and deploys automatically. The live
   site will be at `https://i-abhishekkk.github.io/Fitness-app/`.

## PWA / installability

The manifest and icons (`public/manifest.webmanifest`, `public/icons/`) make the deployed site
installable to a phone home screen from Safari (Share → Add to Home Screen) or Chrome
(⋮ → Add to Home screen/Install app).
