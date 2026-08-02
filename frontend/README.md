# DF Toolkit — Frontend

React 18 + TypeScript + Vite + Tailwind + ECharts + TanStack Query + Zustand.
Design system (tokens, AppShell/Sidebar/Card/MetricTile) follows the pezzrr-app
dashboard pattern — see `../docs/ARCHITECTURE.md` §4/§6.

## Run

```bash
# API first (from backend/, with DB up and ETL loaded):
#   uvicorn app.main:app --reload --port 8100
npm install
npm run dev        # http://localhost:5174  (proxies /api -> :8100; 5173 belongs to pezzrr)
npm run build      # tsc + vite build -> dist/
```

## Layout
```
src/
├── theme/tokens.css      design tokens (light/dark, teal accent)
├── lib/api.ts, types.ts  fetch wrapper + API types (mirror backend/schemas)
├── store/ui.ts           zustand (theme)
├── hooks/useECharts.ts   ECharts binding
├── components/           AppShell, Sidebar, PageHeader, Card, MetricTile, Field, icons
└── pages/
    ├── Overview.tsx      three-pillar landing
    ├── Potential.tsx     DF potential estimators (GTA + RTU duty cycling)
    └── Placeholder.tsx   Sites / Performance / Benchmarking / Reports ("soon")
```

## Notes
- Auth (JWT + RequireRole) is deferred until the backend auth router lands (Phase 1b+);
  the shell is currently open.
- Sidebar shows the full information architecture with roadmap pages disabled ("soon"),
  matching `docs/ARCHITECTURE.md` §6.
