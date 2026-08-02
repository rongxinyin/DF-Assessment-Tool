# Roadmap — Commercial DF Toolkit

Phased delivery. Commercial sector first; residential is a later parallel module reusing
the same engine. Field-performance work **reuses the legacy DR v4 engine**
(`docs/LEGACY_DB_REVIEW.md`), so those milestones are integration, not green-field.

## Phase 0 — Foundation (scaffolding)
- Repo layout per `ARCHITECTURE.md §9`: `backend/`, `frontend/`, `scripts/etl/`, `docs/`.
- `docker-compose`: TimescaleDB, FastAPI (uvicorn), Vite dev.
- Alembic migration #1 = **synchronized schema** (`DATA_MODEL.md`), adapted from the DR v4
  DDL (drop env-specific `sce_*`/staging; add sim/benchmark/upload tables; roles).
- Frontend shell: Vite+TS+Tailwind, design tokens, `AppShell`/`Sidebar`, TanStack Query,
  Zustand auth, `apiFetch`, `RequireAuth`/`RequireRole` (port from pezzrr).
  **[shipped 2026-07 — `frontend/`; auth wrappers deferred until the auth router lands]**
- Auth: `/api/auth/login`, JWT, bcrypt users, seed one admin.

## Phase 1 — Curated dashboard (commercial)
**1a. DF potential assessment**
- ETL: seed **DF strategy taxonomy** from `DF Strategy Table.xlsx` → `strategy_category`,
  `df_strategy`, `df_strategy_level` (`docs/DF_STRATEGIES.md`); remap legacy strategy ids.
- ETL: `data_used_paper/simulation-results.csv` → `sim_result`;
  `df-estimation/*-Equations.csv` → `potential_equation` (GTA estimator params,
  linked to `strategy_code` HVAC-A1). Raw `Simulated-*Office-*-GTA.csv` curves not loaded.
- API: `/api/potential/*`. Analytics: `potential.py` (lookup + OAT interpolation).
  **[shipped: estimate/curve/measures/matrix + duty-cycle + advanced VAV calc]**
- UI `/potential`: pick type/vintage/CZ/precool/reset → metric tiles + shed-vs-OAT curve.
  **[shipped: GTA + duty-cycle sections with ECharts curve]**

**1b. Field performance quantification (reused engine)**
- ETL: retail `sites_batch3/Batch4` + `site-summary-update.csv` → `sites`; interval load
  (where available) → `interval_load`. **Post-processed DR results** → `dr_event_performance`
  (Tier B): parse retail `*_field_metrics_baseline_regression.csv` **and**
  `data_used_paper/site-dr-data-update.csv` (baseline-code taxonomy → type/X/Y/adjustment).
  **[shipped: load_sites (328 sites, consistent cross-source fields only) +
  load_event_performance (~9,150 events, 96% with mapped baseline type)]**
- Port `oat_regression` + `x_over_y_baseline` (+ exclusions, adjustment, caps) into
  `backend/analytics/baseline.py`; unit-test against known legacy outputs.
  **[shipped: engine + metrics + synthetic-data tests]**
- API: `/api/performance/*` (create analysis → baselines → run → results).
  **[shipped: create/run/results/list; runs engine over interval_load/interval_weather]**
- UI `/performance`: event explorer, baseline-vs-actual chart, shed metrics.
  **[shipped: Tier B event explorer (filters, summary tiles, paginated table);
  baseline-vs-actual chart lands with the Tier A upload UI]**

**1c. Sites + map + benchmarking**
- API `/api/sites`, `/api/benchmarking/*`; `benchmark_cohort` materialized view.
  **[shipped: /benchmarking/cohorts + /scatter + /reference dims; /api/sites pending]**
- UI `/sites` (table+detail), `/benchmarking` (MapLibre map, cohort scatter/box, percentile rank).
  **[shipped: /benchmarking page — shed-vs-OAT scatter by type + cohort stats table;
  map + percentile rank pending]**

**1d. Reports**
- `/api/reports/*`: WeasyPrint PDF + CSV for an analysis and for cohort benchmarks.

*Exit:* stakeholders explore curated sim + field + benchmark data with role-gated access.

## Phase 2 — Self-service analytics
- `/api/uploads/*` + `upload_batch`: user uploads interval meter CSV + event windows.
- Validation pipeline → `interval_load`; user creates a `dr_analysis` on own data and runs
  the same baseline engine; compare their site against the benchmark cohort.
- UI `/uploads` ("My Data") + owner-scoped site detail.
- Owner data isolation enforced via `site_groups`/`owner_user_id`.

*Exit:* a building owner uploads data and gets baseline + shed + cohort percentile.

## Phase 3 — Residential + hardening
- Residential building types/prototypes (new `sim_result` rows, `sector='residential'`).
- TimescaleDB continuous aggregates for dashboard speed; weather auto-fetch (NOAA links).
- Additional baseline variants if needed; audit log; multi-tenant org scoping (deferred
  from single-tenant) if stakeholder set demands it.

## Cross-cutting
- **Testing:** pytest for `analytics/` (baseline correctness vs legacy), API contract tests;
  Vitest/RTL for frontend.
- **Legacy retirement:** keep `client/`+`server/` on a tag until Phase 1 parity, then remove.
- **Data governance:** curated vs owner-private separation from day one (role checks + row scoping).

## Suggested sequence
```
P0 scaffold → P1a potential → P1b field/baseline → P1c sites/benchmark → P1d reports
   → P2 uploads → P3 residential/hardening
```
