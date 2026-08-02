# ETL — reference data loaders

Idempotent loaders that populate the DF Toolkit database from `reference/`.
Run after `alembic upgrade head` (schema + strategy seed). They read DB settings from
`backend/.env` (or `DB_*` / `DATABASE_URL` env vars).

## Phase 1b — sites + Tier B event performance

```bash
python -m scripts.etl.load_sites                 # batch3/4 + paper site summaries -> sites (328)
python -m scripts.etl.load_event_performance     # field metrics + site-dr-data -> dr_event_performance (~9,150)
# order matters: events join sites by site_code / site_name
```

Sites keep only the fields **consistently available across all sources**
(code, name, type, DOE/ASHRAE climate zone, years, vintage, zip/city/state,
floor area, HVAC type, baseline model). Source-specific fields (selling/stock
areas, HVAC counts, peak kW, floors, street address) are not stored.
Paper sites in the DR data without a summary row get stub sites (`data_source
'paper-stub'`).

## Phase 1a — DF potential

```bash
# from repo root, with backend deps installed and DB reachable
python -m scripts.etl.load_potential                 # simulation-results.csv -> sim_result (53)
python -m scripts.etl.load_estimation_equations      # df-estimation/*-Equations.csv -> potential_equation (160, GTA)
python -m scripts.etl.load_cycle_equations           # ADR Tool V2.1 CycleOnOff -> potential_equation (96, duty cycling)

# validate parsing without a DB:
python -m scripts.etl.load_potential --dry-run
python -m scripts.etl.load_estimation_equations --dry-run
python -m scripts.etl.load_cycle_equations --dry-run
```

Notes:
- Dimensions (`building_types`, `vintage`, `climate_zone`) are get-or-created.
- Both are full-reload (DELETE + INSERT) on their target tables, so re-running is safe.
- Strategy mapping: GTA temp reset → **HVAC-A1**; RTU duty cycling → **HVAC-P3**.
- Duty-cycle equations use CEC climate zones (CZ03/CZ04/CZ12/CZ13), get-or-created in
  `climate_zone`; the loader needs `openpyxl` (in backend/requirements.txt).
- Raw `Simulated-*Office-*-GTA.csv` shed curves are **not** loaded — the estimator uses
  the `potential_equation` regressions instead.
