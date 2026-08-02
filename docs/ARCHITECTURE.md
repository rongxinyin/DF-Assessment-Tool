# Demand Flexibility Toolkit — Architecture

**Status:** Planning (v1 draft) · **Date:** 2026-07-15 · **Scope of this phase:** Commercial sector

## 1. Purpose

A web toolkit for assessing and benchmarking building **demand flexibility (DF)** for
utilities, program managers, building owners, and researchers. Three capabilities,
all for the **commercial sector first** (residential is a later, parallel module):

1. **DF potential assessment** — estimate a building's shed potential from EnergyPlus
   Global Temperature Adjustment (GTA) prototype simulations, keyed by building
   type, vintage, climate zone, and control strategy (pre-cool + set-point reset).
2. **Field performance quantification** — compute realized shed from measured
   interval load against a computed **baseline** (weather-normalized regression to
   start; 10/10 and X-of-Y baselines later) over DR event windows.
3. **Benchmarking** — compare a site (or a user's uploaded building) against a cohort
   of like buildings (vintage × climate × size × HVAC) using normalized metrics
   (W/ft², DDI, DII, % shed).

This replaces the legacy `client/` (CRA + MUI) and `server/` (Express + MongoDB)
prototype, which hardcodes data in route files and does not scale to many stakeholders.
For **field performance quantification** it does **not** start from scratch: we reuse the
proven baseline-analysis engine and schema from the legacy DR v4 Postgres database
(`reference/pg_iep20_dr_v4_2015-10-14`) — see `docs/LEGACY_DB_REVIEW.md` and
`docs/DATA_MODEL.md`.

## 2. Decisions locked (2026-07-15)

| Area | Decision |
|------|----------|
| Product model | **Phased**: curated dashboard first, self-service upload second |
| Database | **PostgreSQL 16 + TimescaleDB** (hypertables for interval load) |
| Access control | **Multi-role, single org/tenant** (JWT + role-gated routes) |
| Backend | **FastAPI + asyncpg + Pydantic** (pattern from `pezzrr-app/api`) |
| Frontend | **React 18 + TypeScript + Vite + Tailwind + ECharts + TanStack Query + Zustand** (pattern from `pezzrr-app/dashboard`) |
| Analytics | **pandas / numpy / statsmodels** in a service layer, callable by API |
| Reports | Server-side **CSV + PDF export** (WeasyPrint), per pezzrr |

## 3. System overview

```
                         ┌──────────────────────────────────────────┐
                         │  Frontend (SPA)                            │
                         │  React + TS + Vite + Tailwind + ECharts    │
                         │  TanStack Query (server state) · Zustand   │
                         │  (auth/ui) · role-gated AppShell/Sidebar   │
                         └───────────────┬────────────────────────────┘
                                         │ HTTPS / JSON (JWT bearer)
                         ┌───────────────▼────────────────────────────┐
                         │  API (FastAPI)                              │
                         │  routers: auth, sites, events, potential,   │
                         │  performance, benchmarking, uploads,        │
                         │  reference, reports, admin                  │
                         │  ─ Pydantic schemas · role deps · CORS      │
                         └───────┬───────────────────────┬────────────┘
                                 │                        │
              ┌──────────────────▼──────┐     ┌───────────▼───────────────────┐
              │  Analytics service layer │     │  Data access (asyncpg pool)   │
              │  pandas/numpy/statsmodels│     │  repositories per aggregate   │
              │  · baseline regression   │     └───────────┬───────────────────┘
              │  · shed/DDI/DII metrics  │                 │
              │  · benchmark cohorts     │     ┌───────────▼───────────────────┐
              │  · GTA potential lookup  │     │  PostgreSQL 16 + TimescaleDB   │
              └──────────────────────────┘     │  relational metadata +         │
                                               │  interval_load hypertable      │
                                               └────────────────────────────────┘

  Batch ETL (offline):  reference/*.csv + simulation CSVs
       └── scripts/etl/  →  loads sites, events, field_metrics, sim_results, strategies
```

## 4. Technology stack

### Backend (`backend/`)
- **FastAPI** (async), **uvicorn** — HTTP layer, per-domain routers.
- **asyncpg** connection pool (created on `lifespan` startup) — see `pezzrr-app/api/db.py`.
- **Pydantic v2** — request/response schemas, config.
- **python-jose + bcrypt** — JWT auth, password hashing.
- **pandas / numpy / statsmodels** — baseline regression and metric computation,
  isolated in `backend/analytics/` so they are independently testable.
- **WeasyPrint** — PDF report rendering; CSV via pandas.
- **Alembic** — schema migrations (pattern from `sprinkler-controller-main`).
- **pytest** — unit tests for analytics + API.

### Frontend (`frontend/`)
- **React 18 + TypeScript + Vite** — SPA.
- **Tailwind CSS + CSS design tokens** (`theme/tokens.css`) — light/dark, teal accent,
  card/metric-tile system copied conceptually from `pezzrr-app/dashboard`.
- **ECharts** — charts (load profiles, shed bars, scatter benchmarks, box plots).
- **MapLibre GL** (open, no Mapbox token) — the site benchmarking map, replacing the
  current deck.gl/Mapbox map that needs a private token.
- **TanStack Query** — server state / caching; **Zustand** — auth + UI state.
- **react-router v6** — routing with `RequireAuth` / `RequireRole` wrappers.

### Database
- **PostgreSQL 16 + TimescaleDB**. Relational tables for metadata, events, metrics,
  simulation results, and users; a **hypertable** `interval_load` for measured 15-min
  meter data used to compute baselines. See `docs/DATA_MODEL.md`.

## 5. Roles & access (single tenant)

| Role | Can |
|------|-----|
| `guest` / public | Browse curated benchmarks, DF-potential estimator, aggregate charts (no raw site rows) |
| `owner` | Above + view detail for their own linked sites, upload own data (Phase 2) |
| `utility_pm` | Above + view all sites within programs, run cohort benchmarking, export reports |
| `analyst` | Full read of curated + field datasets, run analyses, manage benchmarks |
| `admin` | User/role management, dataset curation, ETL triggers |

Enforced by FastAPI dependencies (`require_role(...)`) on the API and
`RequireRole` route wrappers on the frontend (defense in depth). JWT carries `role`.

## 6. Frontend information architecture

```
AppShell (Sidebar + PageHeader + content)
├── /                     Overview        — portfolio KPIs, map, recent events
├── /potential            DF Potential    — GTA estimator: pick type/vintage/CZ/strategy
│                                           → shed W/ft², kW/10k sf, DDI/DII, curves
├── /sites                Sites           — searchable/filterable table + map
│   └── /sites/:id        Site detail     — metadata, load profile, event list
├── /performance          Field Perf.     — event explorer, baseline vs actual, shed
│   └── /performance/:eventId              — per-event baseline chart + metrics
├── /benchmarking         Benchmarking    — cohort scatter/box plots, percentile rank
├── /uploads   (Phase 2)  My Data         — upload meter+events, run baseline, compare
├── /reports              Reports         — build & export CSV/PDF
└── /admin     (admin)    Admin           — users, datasets, ETL status
```

Reusable components (mirror pezzrr): `AppShell`, `Sidebar`, `PageHeader`, `Card`,
`MetricTile`, `Badge`, `ExportButtons`, `charts/` (LoadProfileChart, ShedBarChart,
BenchmarkScatter, BaselineChart), `FilterBar`, `SiteMap`.

## 7. Analytics service layer (the domain core)

Kept framework-independent under `backend/analytics/` so it is unit-testable and can
also run in batch ETL:

- `baseline.py` — **ports the legacy DR v4 baseline engine** (`docs/LEGACY_DB_REVIEW.md`):
  `oat_regression` (X-day weather-normalized regression, `baseline = a + b·OAT`) and
  `x_over_y_baseline` (high X-of-Y averaging), plus `calc_valid_dates` (day-type/holiday/
  DR-day exclusions), Morning/Day-of adjustment, and lower/upper caps. Same two
  `baseline_types` as the legacy DB.
- `metrics.py` — shed W/ft², peak demand intensity, DDI (demand decrease intensity),
  DII, % shed of baseline, kWh rebound — from `simulation-results.csv` definitions.
- `potential.py` — **basic** DF potential estimator: evaluates the piecewise-linear
  `potential_equation` regressions (segment by OAT: `y = alpha*OAT + beta`) for two
  strategy families — GTA temp reset (by building type × measure × precool/reset ×
  event hour, in `%` or `W/ft²`) and RTU duty cycling (by building type × CEC climate
  zone × compressor-only × event hour, full-hour DR% scaled by `minutes_off/60`);
  plus aggregate lookups from `sim_result`. Ports the legacy `DRCalculations.js` and
  ADR Tool "Cycle Calculation" math.
- `hvac_advanced.py` — **advanced** engineering estimator (no DB): VAV Global
  Temperature Adjustment + Static Pressure reset from AHU/chiller field inputs, via
  fan-affinity (`kW = CFM·SP·0.746 / (6356·FanEff·MotorEff)`), chiller-interactive,
  direct-chiller, and enthalpy-coast terms. Ports the LBNL ADR Tool "Option-2 VAV GTA,
  SP Reset (AHU)" tab (`reference/df-estimation-tool/`); validated against its worked
  example in `tests/`.
- `benchmark.py` — build cohorts (vintage × climate × size × HVAC), compute
  distribution stats and a site's percentile rank.

The baseline logic is the legacy DR v4 PL/pgSQL algorithms re-expressed in Python (and
optionally retained as SQL functions over the synchronized schema). The legacy
`client/src/logic/DRCalculations.js` GTA lookup folds into `potential.py`.

## 8. Deployment

- **Dev:** `docker-compose` — `db` (timescale/timescaledb-ha), `api` (uvicorn reload),
  `web` (vite dev). Frontend proxies `/api` to the API.
- **Prod:** containers behind a reverse proxy (Caddy/nginx); API + Postgres managed;
  static frontend served by the proxy/CDN. Config via env / mounted JSON (pezzrr
  pattern). Secrets not in repo.
- **Migrations:** Alembic on deploy. **ETL:** `scripts/etl/` run manually or scheduled.

## 9. Repository layout (target)

```
DF-Assessment-Tool/
├── backend/
│   ├── app/ (main.py, db.py, config.py, security.py, deps.py)
│   ├── routers/ (auth, sites, events, potential, performance,
│   │             benchmarking, uploads, reference, reports, admin)
│   ├── schemas/         Pydantic models
│   ├── repositories/    SQL data access
│   ├── analytics/       baseline, metrics, potential, benchmark
│   ├── migrations/      Alembic
│   └── tests/
├── frontend/            Vite + TS app (see §6)
├── scripts/etl/         CSV → Postgres loaders
├── docs/                ARCHITECTURE, DATA_MODEL, API_SPEC, ROADMAP,
│                        LEGACY_DB_REVIEW, DF_STRATEGIES
├── reference/           source data & papers (existing, gitignored large files)
└── docker-compose.yml
```

Legacy `client/` and `server/` are retired once feature parity is reached (kept on a
branch/tag for reference during migration).

## 10. Migration from legacy

| Legacy | New home |
|--------|----------|
| **DR v4 Postgres DB** (`reference/pg_iep20_dr_v4_*`) | **reused** — analysis/baseline engine schema + algorithms (`DATA_MODEL.md`, `LEGACY_DB_REVIEW.md`) |
| `server/models/*.js` (Mongoose) | Postgres tables + Pydantic schemas (`DATA_MODEL.md`) |
| Hardcoded seed data in routes | `scripts/etl/` loading from `reference/` |
| `client/logic/*Calculations.js` | `backend/analytics/` |
| MUI components | Tailwind + token-based component system |
| deck.gl + Mapbox (token) | MapLibre GL (no token) |
| Chart.js | ECharts |

See `docs/ROADMAP.md` for sequencing.
