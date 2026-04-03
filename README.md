# Finance Dashboard

Client-only finance dashboard: mock data, browser persistence, role simulation (no real auth or API).

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **MUI v7** + **Emotion**
- **Zustand** (`persist` → `localStorage`)
- **Recharts** (line + pie)
- **React Router** (`/` Overview, `/analytics` charts)
- **Three.js** (optional ambient background, lazy-loaded)
- **date-fns** for dates

## Setup

```bash
cd finance-dashboard
npm install
npm run dev
```

Open **http://localhost:5173** (Vite default).

```bash
npm run build    # typecheck + production bundle
npm run preview  # serve dist locally
npm run lint     # tsc --noEmit
```

**Node:** 18+ recommended.

## Features

| Area | Notes |
|------|--------|
| Overview + cards | Net / income / expenses for the **selected date range** + delta vs prior window |
| Charts | Balance trend (day/month buckets) and category pie on **Analytics** |
| Transactions | Table or stacked cards; pagination |
| Filters | Search, type, category; overview table + insights follow the shared date range |
| Sort | Date or amount, asc/desc |
| Roles | **Viewer:** read-only · **Admin:** add / edit / delete |
| Insights | Top category, expense comparison vs previous window, activity counts |
| State | **Zustand** + persist (transactions, theme, date range, bucket mode) |
| Layout | Responsive breakpoints, scrollable table, chart sizing |

Also: CSV/JSON export for the visible rows, dark mode, reset seed data, clear-filters chip, shortcuts (`/` focus search, `A` add as admin, `?` help).

## Layout (src)

- `src/main.tsx` — `BrowserRouter`, error boundary
- `src/App.tsx` — routes
- `src/layouts/AppLayout.tsx` — shell, tabs, date range strip, outlet
- `src/pages/OverviewPage.tsx` / `AnalyticsPage.tsx`
- `src/components/dashboard/` — cards, charts, table, dialogs, insights, date range
- `src/components/ambient/` — CSS mesh + Three canvas
- `src/store/useFinanceStore.ts` — state, persist, merge guards
- `src/lib/` — analytics range, selectors, export, formatting
- `src/data/seedTransactions.ts` — seed data

## Deploying (SPA)

Direct visits and refreshes on **`/analytics`** must serve **`index.html`** so React Router can run. Point the build output to **`dist/`** after `npm run build`.

### Netlify

Add **`public/_redirects`** in this project (Vite copies `public/` into `dist/`):

```
/*    /index.html   200
```

Or in the Netlify UI: **Site settings → Build & deploy → Redirects** with the same rule.

### Vercel

Add **`vercel.json`** at the repo root (or `finance-dashboard/` if that folder is the project root):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Build command: `npm run build` · Output directory: `dist`.

### GitHub Pages (subpath)

If the site is served from `https://user.github.io/repo-name/`, set `base` in `vite.config.ts` to `'/repo-name/'` and use a router `basename` to match (would require a small code change).

## Notes

- **Admin / Viewer** are UI-only; no backend.
- Persisted state can be cleared via browser storage or the header **reset demo data** control.
