# Data Model — PostgreSQL 16 + TimescaleDB

**Synchronized with the legacy DR v4 engine** (`reference/pg_iep20_dr_v4_2015-10-14`,
reviewed in `docs/LEGACY_DB_REVIEW.md`). The strategy is to **reuse the proven analysis
engine** (sites → analyses → baselines → results) and **extend** it for DF *potential*
(simulation) and *benchmarking*, on a modern stack.

Conventions: `snake_case`; keep legacy natural key names where we reuse a table
(`site_id`, `bldg_type_id`, `analysis_id`, `baseline_id`) for continuity; new tables use
`bigint` identity PKs; `timestamptz` for time; units in column suffixes
(`_ft2`, `_kw`, `_wft2`, `_f`). TimescaleDB extension enabled for interval series.

---

## 0. Crosswalk: legacy → new

| Legacy table | Decision | New name / note |
|---|---|---|
| `sites` | **reuse+extend** | `sites` (+ lat/long, conditioned area, retail areas, data_source, owner) |
| `site_groups`, `site_group_user_links` | reuse | access scoping |
| `building_type_group`, `building_types` | reuse | + `sector` on group |
| `climate_zone`, `zip_to_climate_zone`, `holidays` | reuse | dimensions |
| `dr_programs`, `utilities`, `utility_program_links` | reuse | program dims |
| `dr_strategies` | **replace+enrich** | → `df_strategy` + `strategy_category` + `df_strategy_level` (§1b, `DF_STRATEGIES.md`); legacy 5 rows kept as categories |
| `dr_strategy_links` | reuse | re-pointed to `df_strategy` |
| `location_descriptions` | reuse | site location lookup |
| `import_files`, `file_types`, `file_groups` | reuse | provenance |
| `file_data` (file_id, ts, value) | **replace** | → `interval_load` hypertable |
| `dr_analysis`, `dr_analysis_dates` | **reuse** | analysis config + event dates |
| `dr_exclusions`, `dr_date_exclusions` | **reuse** | baseline exclusions |
| `dr_analysis_file_links`, `dr_analysis_noaa_links` | reuse | file/weather links |
| `baseline_types`, `baseline_adjustment` | **reuse** | method + adjustment vocab |
| `baselines` | **reuse** | baseline instance (type, X/Y, caps, adj) |
| `analysis_results`, `analysis_results_data` | **reuse** | computed series |
| `users`, `user_status` | reuse (re-hash) | bcrypt; drop legacy hashes |
| `user_levels {Admin,User,Guest}` | **modernize** | `role` enum, 5 roles |
| `sce_*`, `tbl_data_source`, `temp_insert_ms` | **drop** | env-specific staging |
| — | **new** | `sim_result`, `potential_equation` (DF potential) |
| — | **new** | `dr_event_performance` (post-processed DR results, both ref CSVs), `benchmark_cohort` |
| — | **new** | `upload_batch` (self-service provenance) |

---

## 1. Reference / dimension tables (reuse legacy)

```
building_type_group(bldg_type_group_id PK, bldg_type_group_description, sector)  -- sector NEW: 'commercial'|'residential'
building_types(bldg_type_id PK, description, bldg_type_group_id FK)
climate_zone(climate_zone_id PK, climate_zone_description)          -- e.g. '3C','2B'
dr_programs(program_id PK, description, code_description)
utilities(utility_id PK, description)
utility_program_links(utility_id FK, program_id FK, PK(utility_id,program_id))
location_descriptions(location_id PK, description)
-- DF strategy taxonomy: see §1b (replaces thin legacy dr_strategies)
zip_to_climate_zone(zip_code text, climate_zone_id, …)  idx on zip_code
holidays(holiday_date PK, description)
vintage(code PK)   -- NEW small dim: '1980-2004','pre-1980','post-2004' (for sim + benchmarking)
```

---

## 1b. DF strategy taxonomy (synchronized — replaces legacy `dr_strategies`)

Canonical name/id/category from `reference/DF Strategy Table.xlsx`; the full seed list
(27 strategies) is in `docs/DF_STRATEGIES.md`. Legacy `dr_strategies` held only 5 end-use
rows; that vocabulary is preserved via `strategy_category.legacy_id`.

```
strategy_category(                                 -- end-use categories (id prefix)
  category_id  PK,
  code         text UNIQUE,        -- 'BE','HVAC','HVAC-P','LTG','WH','HPWH','MEL'
  name         text,               -- 'Building Envelope','HVAC Systems', …
  sector       text,               -- 'commercial' | 'residential' | 'both'
  legacy_id    int NULL,           -- back-ref to legacy dr_strategies.strategy_id
  description  text
)

df_strategy(                                       -- one row per control strategy
  strategy_id  PK,                 -- surrogate int (keeps dr_strategy_links FK continuity)
  strategy_code text UNIQUE,       -- canonical id: 'HVAC-A1','BE-A1','LTG-A2', …
  name         text,               -- 'Global temperature adjustment — cooling'
  category_id  FK->strategy_category,
  sub_category text,               -- 'VAV','Smart Windows','Packaged RTU', …
  description  text,
  recommended_sequence text,
  response_speed text,             -- '~15 minutes','Seconds', …
  -- GEB load-flexibility categories (multi-valued): 'Efficiency','Shed','Shift','Modulate','Generate'
  flex_categories text[],          -- e.g. '{Shift,Shed}'
  grid_services   text[],          -- '{Peak Capacity Management,Spinning Reserve}'
  references_note text
)

df_strategy_level(                                 -- Low/Medium/High response settings
  strategy_id  FK->df_strategy,
  level        text,               -- 'low' | 'medium' | 'high'  (1/2/3)
  setting_value text,              -- '2ºF','1.4"','0.7','on/off','4 hours'
  unit         text NULL,          -- 'degF','inWC','fraction','hours'
  PRIMARY KEY (strategy_id, level)
)

dr_strategy_links(                                 -- reuse: sites ↔ strategies (M:N)
  strategy_id FK->df_strategy, site_id FK->sites, PRIMARY KEY (strategy_id, site_id)
)
```
Notes: `flex_categories`/`grid_services` as `text[]` keep it simple; promote to link tables
only if faceted querying needs it. `sites.strategy_id` (legacy single-strategy column) is
retained but superseded by `dr_strategy_links`; ETL back-fills links and remaps to
`df_strategy`. Simulation/field terms (GTA→`HVAC-A1`, pre-cool→`BE-A1`) are mapped in
`DF_STRATEGIES.md`.

---

## 2. Sites & groups (reuse + extend)

```
sites(
  site_id PK, site_group_id FK, site_name, site_description,
  building_size_ft2, year_built, zip, climate_zone FK->climate_zone,
  location_id FK, bldg_type_id FK, bldg_sub_type_id, utility_id FK,
  strategy_id FK, file_group_id FK,
  -- NEW columns — only fields consistently available across ALL data sources
  -- (batch3/batch4 retail, paper site summaries, future uploads). Source-specific
  -- fields (selling/stock areas, HVAC counts, peak kW, floors, CEC zone, street
  -- address) are intentionally NOT stored on sites.
  site_code text UNIQUE,            -- 'T0363','T0013','P1'
  sector text,                       -- 'commercial'
  vintage_code FK->vintage,          -- derived from year_built
  year_renovated int,
  city text, state text,
  longitude double precision, latitude double precision,   -- geocoded later (map)
  hvac_type text,
  baseline_model text, data_source text,      -- 'batch3','batch4','paper','upload'
  owner_user_id FK->users
)
site_groups(site_group_id PK, site_group_name, site_group_description, comments,
            file_group_id, hidden)
site_group_user_links(site_group_id FK, user_id FK, PK(site_group_id,user_id))
```

---

## 3. Interval time-series (TimescaleDB — replaces `file_data`)

Keep `import_files` provenance; store the actual series in a hypertable. Two logical
channels — load and weather — matching the baseline functions' `kw_data`/`weather_data`.

```
import_files(file_id PK, file_group_id, file_type_id, file_name, file_description, import_date)
file_types(file_type_id PK, file_type_name)     -- 'load','weather', …
file_groups(file_group_id PK, user_group_id, group_name, group_description, created_time)

interval_load(                                   -- NEW hypertable (was file_data for load)
  site_id  FK->sites,
  file_id  FK->import_files,
  ts       timestamptz,
  kw       double precision,
  wft2     double precision,
  PRIMARY KEY (site_id, ts)
)
interval_weather(                                -- NEW hypertable (was file_data for weather)
  station_id int, file_id FK->import_files,
  ts timestamptz, oat_f double precision,
  PRIMARY KEY (station_id, ts)
)
```
```sql
SELECT create_hypertable('interval_load',    'ts', chunk_time_interval => INTERVAL '30 days');
SELECT create_hypertable('interval_weather', 'ts', chunk_time_interval => INTERVAL '30 days');
-- continuous aggregates for hourly/daily means power fast dashboards
```
Compatibility views so the legacy baseline functions port cleanly:
```sql
CREATE VIEW kw_data      AS SELECT site_id AS kw_id, ts AS time_stamp, kw AS value FROM interval_load;
CREATE VIEW weather_data AS SELECT station_id AS weather_id, ts AS time_stamp, oat_f AS value FROM interval_weather;
```

---

## 4. Analysis engine (reuse legacy verbatim — the core)

```
dr_analysis(
  analysis_id PK, analysis_name, analysis_description,
  site_id FK->sites, program_id FK->dr_programs,
  start_time time, end_time time,               -- DR event window
  high_start_time time, high_end_time time,      -- peak sub-window
  interpolate_data bool DEFAULT false, interp_interval smallint,
  sensitivity_start_date date, sensitivity_end_date date,
  last_update timestamptz DEFAULT now(),
  load_file_id FK->import_files, weather_file_id FK->import_files
)
dr_analysis_dates(analysis_id FK, dr_date date, PK(analysis_id,dr_date))
dr_date_exclusions(analysis_id FK, dr_date date, PK(analysis_id,dr_date))
dr_exclusions(analysis_id FK PK, ex_weekends, ex_weekdays, ex_sun..ex_sat,
              ex_dr_days DEFAULT true, ex_holidays DEFAULT true)   -- all boolean
dr_analysis_file_links(file_id FK, analysis_id FK, file_type_id FK, PK(analysis_id,file_type_id))
dr_analysis_noaa_links(station_id int, analysis_id FK PK)

baseline_types(baseline_type_id PK, description)         -- 1:'X/Y baseline', 2:'X day OAT regression'
baseline_adjustment(baseline_adjustment_id PK, baseline_adjustment_description)  -- 1:Morning, 2:Day-of
baselines(
  baseline_id PK, analysis_id FK->dr_analysis, baseline_type_id FK->baseline_types,
  param1 int, param2 int,                        -- X and Y (or regression num_days)
  adj_start_time time, adj_end_time time,        -- adjustment window
  lower_cap_percentage double precision, upper_cap_percentage double precision,
  baseline_adjustment_id FK->baseline_adjustment
)
analysis_results(analysis_result_id PK, analysis_id FK->dr_analysis, analysis_update_time timestamptz)
analysis_results_data(
  analysis_result_id FK->analysis_results, baseline_id FK->baselines,
  dr_date date, time_stamp timestamptz,
  load_value double precision, baseline_value double precision, temperature double precision,
  PRIMARY KEY (baseline_id, dr_date, time_stamp)
)
```
Baseline algorithms (`oat_regression`, `x_over_y_baseline`, `calc_valid_dates`,
`get_standard_error`, adjustments, caps) are reused — see `docs/LEGACY_DB_REVIEW.md`
and are ported to `backend/analytics/baseline.py`.

---

## 5. DF potential — simulation summary + estimation equations (NEW)

Powers the "DF potential assessment" pillar. Two parts, neither in the legacy DB:
- `sim_result` — aggregate per-prototype metrics from `simulation-results.csv`.
- `potential_equation` — the **estimation model**: piecewise-linear regressions of DR
  potential vs OAT from the df-estimation-tool (`reference/df-estimation/*`). This
  replaces the raw `Simulated-*Office-*-GTA.csv` shed curves (not stored).

```
sim_result(                                       -- simulation-results.csv
  id PK,
  bldg_type_id FK->building_types, vintage_code FK->vintage, climate_zone_id FK->climate_zone,
  gta_level_f numeric, highest_gta_scenario text,   -- e.g. 'Precool-2F+GTA-4F'
  ddi_gta_only_wft2 numeric, ddi_precool_adj_wft2 numeric, delta_ddi_wft2 numeric,
  ddi_increase_pct numeric, kw_shed_per_10k_sf numeric, kw_shed_increase_per_10k numeric,
  pct_shed_of_baseline numeric, dii numeric,
  precool_kwh_change_pct numeric, net_kwh_increase_pct numeric, optmax_gta_f numeric
)  idx (bldg_type_id, vintage_code, climate_zone_id)

potential_equation(                               -- basic-estimator regression params
  id PK,
  bldg_type_id FK->building_types, strategy_id FK->df_strategy,
  climate_zone_id FK->climate_zone NULL,          -- CEC zone for duty cycling; NULL for GTA set
  measure_id text,                                -- 'GTA-10-14-0-14-18-2-LTG-0' | 'SmallOfficeCZ03CycleYes1'
  precool_deg numeric, reset_deg numeric,
  compressor_only boolean NULL,                   -- duty cycling: compressor-only vs whole RTU
  event_hour int,                                 -- 1..4 hours into the DR event
  output_unit text,                               -- 'pct' (DR potential %) | 'wft2' (shed W/ft2)
  oat_break_low numeric DEFAULT 75, oat_break_high numeric DEFAULT 95,
  seg1_alpha numeric, seg1_beta numeric,          -- OAT <= 75           : y = a1*OAT + b1
  seg2_alpha numeric, seg2_beta numeric,          -- 75 < OAT <= 95      : y = a2*OAT + b2
  seg3_alpha numeric, seg3_beta numeric,          -- OAT > 95            : y = a3*OAT + b3
  UNIQUE NULLS NOT DISTINCT (bldg_type_id, climate_zone_id, measure_id, precool_deg,
                             reset_deg, compressor_only, event_hour, output_unit)
)
-- Two strategy families share this table:
--   GTA temp reset (HVAC-A1): reference/df-estimation/*-Equations.csv; no CZ dimension.
--   RTU duty cycling (HVAC-P3): LBNL ADR Tool V2.1 'LoadShed Database' CZ*CycleOnOff
--     ranges (CEC CZ03/04/12/13 × SmallOffice/MediumOffice/Retail × Yes/No × hour 1-4).
--     Equations are full-hour cycling DR%; estimator scales by minutes_off/60 and
--     multiplies by meter kW (workbook 'Cycle Calculation' semantics).
-- Estimate: pick segment by OAT, y = alpha*OAT + beta. Mirrors the legacy
-- DRCalculations.js piecewise regression (temp bins pct_OAT<=75 / pct_75<=OAT<=95).
```

---

## 6. Field metrics & benchmarking (NEW)

### Two data tiers for realized performance
The DB holds **realized DR performance** at two tiers, both feeding benchmarking:

- **Tier A — raw → engine-computed.** Raw interval load (`interval_load`) + weather run
  through the reused baseline engine (§4) to produce per-timestamp
  `analysis_results_data` and derived shed. Full provenance, recomputable.
- **Tier B — post-processed import.** The reference datasets
  `reference/data_used_paper/site-dr-data-update.csv` and
  `reference/retail-bldg-data/*_field_metrics_baseline_regression.csv` are **already
  reduced to per-event metrics with a baseline applied**. There is no raw series to
  recompute, so they land directly in `dr_event_performance` below. This is how existing
  DR performance results are integrated without re-running analysis.

Both tiers are unioned into the benchmarking layer; a `computation` flag distinguishes them.

### `dr_event_performance` — unified post-processed per-event metrics (Tier B, extensible)
Superset covering **both** reference datasets. One row = one site × one DR event window ×
one baseline method. Nullable metrics because the two sources report different columns.

```
dr_event_performance(
  id PK,
  site_id            FK->sites,
  analysis_id        FK->dr_analysis NULL,     -- set if later reproduced by the engine (Tier A link)
  upload_batch_id    FK->upload_batch NULL,    -- set if user-uploaded (Phase 2)
  data_source        text,                     -- 'batch3','batch4','paper:site-dr-data-update','upload'
  event_seq          int NULL,                 -- event_id/order within source
  event_date         date,
  shed_start         timestamptz, shed_end timestamptz,
  program            text NULL,                -- DR-Program
  -- baseline taxonomy (parsed from source 'Baseline' code; see mapping below)
  baseline_code      text,                     -- raw code e.g. '10/10_MA_CBL','OAT_CBL','regression'
  baseline_type_id   FK->baseline_types NULL,  -- 1:X/Y, 2:OAT regression
  baseline_x         int NULL, baseline_y int NULL,          -- e.g. 3, 10  (from '3/10')
  baseline_adjustment_id FK->baseline_adjustment NULL,       -- 'MA' -> Morning Adjustment
  -- weather
  peak_oat_f numeric NULL, event_avg_oat_f numeric NULL, max_oat_f numeric NULL,
  -- absolute demand / shed (site-dr-data-update: kW_Max/Ave/Min)
  kw_max numeric NULL, kw_avg numeric NULL, kw_min numeric NULL,
  -- normalized intensity (both sources)
  peak_demand_intensity_wft2 numeric NULL, shed_avg_wft2 numeric NULL,
  wft2_max numeric NULL, wft2_avg numeric NULL, wft2_min numeric NULL,
  -- whole-building power % vs baseline (site-dr-data-update: WBP%_*)
  wbp_pct_max numeric NULL, wbp_pct_avg numeric NULL, wbp_pct_min numeric NULL,
  source_citation    text NULL,                -- paper/source reference
  UNIQUE(site_id, event_date, shed_start, baseline_code)
)  idx (site_id), (event_date), (data_source)
```

**Column mapping from the two reference CSVs**

| Target | `retail-bldg-data/*_field_metrics_*` | `site-dr-data-update.csv` |
|---|---|---|
| `site_code` (→ site) | `event_id` (e.g. T0363) | `site_name` |
| `event_date` | `event_date` | `DR-Event-Day` |
| `shed_start/end` | `shed_start_time`/`shed_end_time` | `DR-StartTime`/`DR-EndTime` |
| `program` | (site metadata) | `DR-Program` |
| `baseline_code` | `regression` (implied) | `Baseline` (e.g. `10/10_MA_CBL`) |
| `peak_oat_f` | `peak_oat` | — |
| `event_avg_oat_f` | `event_avg_oat` | — |
| `max_oat_f` | — | `max_oat` |
| `peak_demand_intensity_wft2` | `peak_demand_intensity_wft2` | — |
| `shed_avg_wft2` | `shed_avg_wft2` | `W/ft2_Avg` |
| `wft2_max/min` | — | `W/ft2_Max`/`W/ft2_Min` |
| `kw_max/avg/min` | — | `kW_Max`/`kW_Ave`/`kW_Min` |
| `wbp_pct_max/avg/min` | — | `WBP%_Max`/`WBP%_Avg`/`WBP%_Min` |
| `source_citation` | — | `source` |

**Baseline-code taxonomy** (aligns Tier B with the legacy engine vocab §4):
`3/10`, `10/10` → `baseline_type_id=1` (X/Y) with `baseline_x`/`baseline_y`;
`OAT` → `baseline_type_id=2` (OAT regression);
`_MA_` → `baseline_adjustment_id=1` (Morning Adjustment);
`_CBL` = Customer Baseline Load; `Custom_Baseline` → type NULL, keep raw code.

### `benchmark_cohort` — materialized view (both tiers)
```
benchmark_cohort  -- MATERIALIZED VIEW over sites + dr_event_performance
                  --   (Tier B) UNION derived shed from analysis_results_data (Tier A) + sim_result
-- grouped by (bldg_type_id, vintage_code, climate_zone_id, size_bucket):
--   n, mean/median/p25/p75/p90 of shed_avg_wft2, peak_demand_intensity_wft2, ddi, wbp_pct_avg
-- size_bucket derived from building_size_ft2 (small/medium/large)
```

---

## 7. Users & access (reuse legacy structure, modern roles)

```
users(
  user_id PK, first_name, last_name, email UNIQUE, password text,  -- bcrypt (re-provisioned)
  status_id FK->user_status, role text,                            -- role NEW (see below)
  created_date timestamptz DEFAULT now(), comments text
)
user_status(status_id PK, status_description, password_reset bool)
-- role replaces legacy user_levels: 'admin' | 'analyst' | 'utility_pm' | 'owner' | 'guest'
user_group_links(user_group_id, user_id, PK(user_group_id,user_id))

upload_batch(                                       -- NEW: Phase-2 self-service provenance
  id PK, user_id FK->users, kind text,              -- 'interval_load','events','site_meta'
  filename text, status text,                        -- received|validated|loaded|failed
  row_count int, error_log jsonb, created_at timestamptz DEFAULT now()
)
```

---

## 8. Entity relationships (summary)

```
building_type_group ─< building_types ─┐
vintage ───────────────────────────────┤
climate_zone ──────────────────────────┼─< sites >──< dr_strategy_links >── df_strategy ─┬─> strategy_category
                                        │      │                                          └─< df_strategy_level
                                        │      │└─ site_group_id ─> site_groups >─< site_group_user_links >─ users
utilities >─< utility_program_links >─ dr_programs
sites ─< dr_analysis ─┬─< dr_analysis_dates
                      ├─< dr_date_exclusions / dr_exclusions
                      ├─< dr_analysis_file_links / dr_analysis_noaa_links
                      └─< baselines (→ baseline_types, baseline_adjustment)
                              └─< analysis_results ─< analysis_results_data
sites ─< interval_load (hypertable) ;  station ─< interval_weather (hypertable)
import_files ─ file_types / file_groups
building_types ─< sim_result (× vintage × climate) , potential_equation (× measure × hour)
sites ─< dr_event_performance (Tier B post-processed; opt. → dr_analysis / upload_batch)
benchmark_cohort ⇐ (dr_event_performance ∪ analysis_results_data-derived shed) + sim_result
users ─< upload_batch , sites(owner)
```
