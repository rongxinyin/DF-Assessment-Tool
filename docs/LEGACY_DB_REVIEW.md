# Legacy Database Review — `pg_iep20_dr_v4_2015-10-14`

Review of the legacy PostgreSQL dump in `reference/pg_iep20_dr_v4_2015-10-14`
(DR analysis tool v4, "iep20", dumped 2015-10-14, owners `mspears`/`postgres`).
This is a **mature, production DR baseline-analysis engine**. We **reuse its schema and
algorithms** as the core of the new toolkit rather than reinventing them. See
`docs/DATA_MODEL.md` for the synchronized target schema and the crosswalk.

## What it is

A Postgres database (40 tables, 14 sequences, PL/pgSQL baseline functions) that:
1. imports interval load + weather time-series from files,
2. defines a **DR analysis** (site, program, event window, dates, exclusions),
3. computes **baselines** by two methods, with adjustments and caps,
4. stores per-timestamp results (actual load, baseline, temperature) for charting and
   shed quantification.

This is exactly "field performance quantification with baseline" — the second pillar
of the new toolkit — already solved in a well-normalized schema.

## Table groups

**Reference / dimensions**
`building_type_group`, `building_types` (→ group), `climate_zone`, `dr_programs`,
`utilities`, `utility_program_links`, `dr_strategies`, `dr_strategy_links`,
`location_descriptions`, `zip_to_climate_zone`, `zip_climate_zone_link`, `holidays`.

**Sites**
`sites` (site_id, site_group_id, name, `building_size_ft2`, `year_built`, `zip`,
`climate_zone`, `location_id`, `bldg_type_id`, `bldg_sub_type_id`, `utility_id`,
`strategy_id`, `file_group_id`), `site_groups`, `site_customer_links`.

**Time-series & files**
`import_files` (file_id, group, type, name, import_date), `file_types`, `file_groups`,
`file_data` (file_id, time_stamp, value) — generic interval store keyed by file.
`sce_data` / `sce_weather` / `tbl_data_source` / `temp_insert_ms` — utility-specific
import staging. Baseline functions reference logical views `kw_data(kw_id,…)` and
`weather_data(weather_id,…)` over this store.

**Analysis engine (the crown jewel)**
- `dr_analysis` — analysis config: `site_id`, `program_id`, event `start_time`/`end_time`,
  `high_start_time`/`high_end_time`, `interpolate_data`/`interp_interval`,
  `sensitivity_start_date`/`end_date`, `load_file_id`, `weather_file_id`.
- `dr_analysis_dates` — the DR event dates for an analysis.
- `dr_date_exclusions` — specific dates excluded from baseline pools.
- `dr_exclusions` — day-type flags (ex_weekends, ex_mon…ex_sat, ex_dr_days, ex_holidays).
- `dr_analysis_file_links` (analysis ↔ file ↔ file_type), `dr_analysis_noaa_links`
  (analysis ↔ NOAA weather station).
- `baseline_types` — **{1: "X/Y baseline", 2: "X day OAT regression"}**.
- `baseline_adjustment` — **{1: "Morning Adjustment", 2: "Day-of Adjustment"}**.
- `baselines` — a baseline instance: `baseline_type_id`, `param1`, `param2`
  (X and Y), `adj_start_time`/`adj_end_time`, `lower_cap_percentage`,
  `upper_cap_percentage`, `baseline_adjustment_id`.
- `analysis_results` / `analysis_results_data` — computed series:
  `(baseline_id, dr_date, time_stamp) → load_value, baseline_value, temperature`.

**Users & access**
`users` (email, password, status, level), `user_levels`
**{1: Administrator, 2: User, 3: Guest}**, `user_status` (+ password_reset),
`user_group_links`, `site_group_user_links` (group-scoped access to sites).

## Baseline algorithms (PL/pgSQL — the canonical spec)

Reuse these exactly; port to `backend/analytics/` (pandas/statsmodels) and/or keep as
SQL functions. Both accept an `event_id` and exclude `dr_date_exclusions` + day-types.

**`oat_regression(kw_id, weather_id, reg_time, num_days, event_id)` — weather-normalized regression**
1. `valid_days = calc_valid_dates(reg_time, num_days, weekdays=true, weekends=false, excluded)`.
2. For the event's time-of-day, gather `(OAT, kW)` pairs across `valid_days`.
3. OLS: `slope b = r·(σy/σx)`, `intercept a = ȳ − b·x̄` (r from Sxx/Syy/Sxy).
4. `baseline(t) = a + b · OAT_event(t)`.

**`x_over_y_baseline(kw_id, ts, X, Y, dr_start, dr_end, event_id)` — high X-of-Y**
1. `valid_days = calc_valid_dates(ts, Y, weekdays, excluded)` (requires X ≤ Y).
2. Rank the prior `Y` valid days by summed load over `[dr_start, dr_end)`.
3. Take the highest `X` days; `baseline(t) = mean of those days' load at time-of-day t`.

**Supporting functions:** `calc_valid_dates` (valid non-excluded day pool),
`get_standard_error` (regression SE, for confidence bands), `fill_kw_data` /
`fill_weather_data` (gap-fill), `interpolate` (resample series to a step).

**Adjustments & caps (from `baselines`):** apply Morning / Day-of multiplicative
adjustment from the pre-event `adj_*` window, then clamp within
`[lower_cap_percentage, upper_cap_percentage]` of the raw baseline.

## Reuse decision

- **Adopt** the analysis-engine core (`dr_analysis`, `dr_*_exclusions`, `baseline_types`,
  `baseline_adjustment`, `baselines`, `analysis_results*`) and both baseline algorithms
  verbatim as the toolkit's field-performance backbone.
- **Adopt** the reference/site/user structure, modernized (see crosswalk in DATA_MODEL).
- **Replace** the file-keyed `file_data` store with a TimescaleDB hypertable
  (`interval_load`) while keeping the `import_files` provenance abstraction.
- **Modernize** roles: legacy `user_levels {Admin,User,Guest}` →
  `{admin, analyst, utility_pm, owner, guest}`.
- **Extend** with new tables for DF *potential* (simulation) and *benchmarking* cohorts,
  which the legacy DB does not cover.

## Caveats

- Function bodies reference logical relations `kw_data`/`weather_data`/`dr_date_exclusions.event_id`
  that differ slightly from the dumped table names (`file_data`, `dr_date_exclusions.dr_date`) —
  the v4 engine evolved past this dump. Treat the **functions as the algorithm spec**; re-wire
  table names to the synchronized schema on port.
- Passwords in `users` are legacy hashes — do not import; re-provision with bcrypt.
- Owners `mspears`/`drv2_user` and `sce_*` staging tables are environment-specific; drop on migration.
