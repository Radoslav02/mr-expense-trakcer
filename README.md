# M&R Expense Tracker

A personal expense tracker built with React 18, TypeScript (strict), Redux Toolkit, Tailwind CSS
and Firebase. Firestore stores the data and Firebase Auth handles sign-in, so there is no custom
backend.

- **Expenses**: add, edit and delete expenses. The list is grouped by day and can be filtered by
  month, category, payment method and a text search.
- **Categories**: eight defaults are created on sign-up. You can rename, recolor, change icons and
  delete categories. When a category is deleted, its expenses move to *Other*.
- **Overview**: shows this month's total, last month's total with the % change, the daily
  average and the largest expense. It also has a category donut, a 6-month bar chart and a
  budget bar (green under 75%, yellow under 100%, red at 100% or more).
- **Settings**: choose the currency (RSD by default) and a monthly budget. A light/dark theme
  toggle is saved to `localStorage`.

## Requirements

- Node.js 20+ and npm
- A Firebase project (see [FIREBASE_CONFIG.md](FIREBASE_CONFIG.md))

## Setup

```bash
npm install
cp .env.example .env         # then fill in the VITE_FIREBASE_* values
npm run dev                  # http://localhost:5173
```

| Script           | What it does                                  |
| ---------------- | --------------------------------------------- |
| `npm run dev`    | Start the Vite dev server                     |
| `npm run build`  | Type-check (`tsc --noEmit`) and build to `dist/` |
| `npm run lint`   | ESLint (flat config, typescript-eslint strict) |
| `npm run format` | Prettier, including Tailwind class sorting    |
| `npm test`       | Vitest unit tests for the pure utilities      |

## Firebase console setup (one time)

### 1. Create the Firestore database

Firebase console → **Build → Firestore Database → Create database**. Choose a location close to
your users (for example `eur3` for Europe), then start in **production mode**. The rules below
take over from there.

### 2. Enable sign-in methods

Firebase console → **Build → Authentication → Sign-in method**:

1. **Email/Password**: click it, toggle **Enable**, then **Save**.
2. **Google**: click it, toggle **Enable**, pick a project support email, then **Save**.

Under **Authentication → Settings → Authorized domains**, make sure `localhost` is listed. Add
your production domain there too when you deploy (Firebase Hosting domains are added
automatically).

### 3. Deploy the security rules

The rules live in [`firestore.rules`](firestore.rules). Each user can only read and write
`users/{their uid}/**`.

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules   # uses your .firebaserc (copy .firebaserc.example)
```

You can also paste the contents of `firestore.rules` into **Firestore Database → Rules** in the
console and click **Publish**.

### 4. (Optional) Deploy the app to Firebase Hosting

`firebase.json` already serves `dist/` with an SPA rewrite:

```bash
npm run build
firebase deploy --only hosting
```

## Deploy to Vercel

`vercel.json` is already set up:
- every route falls back to `index.html` (client-side routing);
- `sw.js` and the manifest are never cached, so phones pick up new versions;
- `/__/auth/*` and `/__/firebase/*` are proxied to Firebase. Google sign-in then runs on
  your own domain, which Safari and the installed app require.

### 1. Import the project

Push the folder to GitHub and import it on vercel.com (or run `npx vercel` here). Vercel detects
Vite; build command `npm run build`, output `dist`.

### 2. Environment variables

In Vercel → Project → Settings → Environment Variables, add every key from `.env` with the
same values. Keep `VITE_FIREBASE_AUTH_DOMAIN` as `<project-id>.firebaseapp.com`. Redeploy after
changing variables, because Vite reads them at build time.

> Advanced, for Google sign-in inside the installed iPhone app: set `VITE_FIREBASE_AUTH_DOMAIN` to
> your Vercel domain. This only works after the Firebase project has a Hosting site (run
> `npx firebase-tools deploy --only hosting` once), because the proxied `/__/auth/*` pages
> depend on it. Then complete step 3.2.

### 3. Allow the domain in Firebase and Google

1. Firebase console → Authentication → Settings → **Authorized domains** → add your Vercel
   domain (for example `mr-expense-trakcer.vercel.app`). **Without this, Google sign-in fails
   with `auth/unauthorized-domain`.**
2. Google Cloud console → APIs & Services → Credentials → the OAuth 2.0 client named
   *Web client (auto created by Google Service)* → **Authorized redirect URIs** → add
   `https://mr-expenses.vercel.app/__/auth/handler` → Save. It can take a few minutes
   to take effect.

Step 3.2 is only needed for the advanced setup above.

### 4. Security rules

Rules are not part of the Vercel deploy. Publish `firestore.rules` in the Firebase console, or run
`npx firebase-tools login` once and then `npm run deploy:rules`.

## Install on your phone (PWA)

Open your Vercel URL on the phone:

- **Android (Chrome):** Settings → Install app → *Install*, or the browser menu → *Install app*.
- **iPhone (Safari):** Share → *Add to Home Screen*.

The installed app opens full screen and works offline: Firestore keeps a copy of your data on the
device and syncs when you're back online. Google sign-in uses a full-page redirect there instead
of a popup. After each deploy, phones load the new version the next time the app opens.

## Architecture

```
Component → dispatch(thunk) → service → Firestore → thunk returns data → slice → selector → Component
```

- `src/services/` is the **only** place that imports `firebase/*`. ESLint enforces this with
  `no-restricted-imports`, and components can't import services either.
- Thunks (`src/redux/*/…Thunks.ts`) call services and turn errors into readable messages through
  `rejectWithValue`.
- Each slice tracks `status: 'idle' | 'loading' | 'succeeded' | 'failed'` and `error`.
- Aggregations for the dashboard (monthly totals, category split, budget progress) are memoized
  selectors in `expensesSelectors.ts` built on pure helpers in `src/utils/`, which are unit tested.
- Every component lives in its own folder with `Component.tsx`, `Component.css` and `index.ts`.
  Tailwind handles layout and color in JSX. The `.css` file holds component-specific styles
  such as animations, complex selectors, chart theming and `@apply` groups.

```
src/
├── app/          store, typed hooks, typed createAsyncThunk
├── components/   reusable UI: Button, Input, Select, Modal, Card, Loader, Toast, Layout/…
├── features/     auth, expenses, categories, dashboard, settings
├── pages/        route-level screens
├── redux/        one folder per domain: slice, thunks, selectors, types
├── services/     Firebase access only
├── hooks/        useExpenseFilters, useExpenseForm, useTheme, …
├── utils/        pure helpers: currency, dates, aggregation, validation
├── constants/    routes, collection names, default categories, payment methods
├── types/        shared domain types
└── router/       AppRouter with lazy-loaded pages
```

## Design notes

The app is a work tool, so the interface stays out of the way:

- A warm neutral palette with one deep-green accent, used only for primary actions, the current
  selection and the active chart bar. Every color is a CSS variable token with light and dark
  values (`src/index.css`).
- Inter with tabular numerals, so amounts line up in lists and charts.
- Motion only signals state changes: buttons scale slightly when pressed, modals and toasts enter
  in about 200ms with a strong ease-out, and modals open as bottom sheets on phones. All motion
  respects `prefers-reduced-motion`.
- Accessibility: modals use the native `<dialog>` (focus is trapped, Esc closes, focus returns to
  the trigger). Every input has a label and errors are linked with `aria-describedby`. There is a
  skip link, a visible focus ring, and contrast is at least 4.5:1 for body text.
