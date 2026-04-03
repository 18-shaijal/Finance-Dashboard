# Finance Dashboard UI

A small **Next.js (App Router)**, **TypeScript**, and **Material UI** dashboard for tracking balance, income, expenses, transactions, and simple spending insights. Data is **mocked on the client**; roles and persistence are **simulated in the browser**.

## Setup

```bash
cd finance-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Live reload (Fast Refresh):** only happens in **development** with `npm run dev`. The command `npm run start` serves a **production** build and does **not** watch files—use `dev` while editing code.

If saving files doesn’t trigger reloads (common on some network drives or strict macOS setups), use polling:

```bash
npm run dev:poll
```

Optional: `npm run dev:turbo` uses Turbopack for faster dev rebuilds.

```bash
npm run build   # production build
npm run start   # run production server
```

**Requirements:** Node.js 18+ (project was scaffolded with Next.js 14).

## Approach

- **UI:** MUI components, `AppRouterCacheProvider` for Emotion + App Router, and a client `ThemeProvider` for light/dark mode.
- **Charts:** [Recharts](https://recharts.org/) for a balance-over-time line chart and a spending-by-category donut chart.
- **State:** [Zustand](https://github.com/pmndrs/zustand) with the `persist` middleware so **transactions**, **role**, and **theme** survive reloads via `localStorage`.
- **Data:** Seed transactions in `src/data/seedTransactions.ts`; totals and insights are derived with pure helpers in `src/lib/financeSelectors.ts`.

## Features (assignment mapping)

| Requirement | Implementation |
|-------------|----------------|
| Summary cards | Total balance, income, expenses |
| Time-based chart | Cumulative balance trend (last 6 months) |
| Categorical chart | Expense breakdown by category (pie) |
| Transactions | Date, amount, category, type, description |
| Filter / sort / search | Type & category filters, sort by date or amount, search box |
| Role-based UI | **Viewer:** read-only · **Admin:** add / edit / delete (dropdown in app bar) |
| Insights | Top spending category, this month vs last month (expenses), activity snapshot |
| Empty states | Copy when filters match nothing or all data is cleared |
| Extras | Dark mode toggle, CSV/JSON export of **filtered** rows, reset demo data |

## Project layout (high level)

- `src/app/` — `layout.tsx` (fonts, MUI cache), `page.tsx` (loads dashboard client-side).
- `src/store/useFinanceStore.ts` — app state and actions.
- `src/components/dashboard/` — shell, cards, charts, table, dialogs, insights.
- `src/lib/` — formatting, derived metrics, CSV/JSON export.

## Notes

- The home page uses `dynamic(..., { ssr: false })` so the dashboard mounts only on the client, avoiding hydration mismatches with persisted Zustand state.
- “Admin” is **frontend-only**; there is no API or real authentication.
