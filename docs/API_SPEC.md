# API Specification — FastAPI

Read/compute layer over the synchronized Postgres+TimescaleDB schema
(`docs/DATA_MODEL.md`), reusing the legacy DR v4 analysis engine. JSON over HTTPS,
JWT bearer auth, per-domain routers (pattern from `pezzrr-app/api`). Base path `/api`.

## Conventions
- Auth: `Authorization: Bearer <jwt>`; JWT carries `sub`, `role`. 401 clears client token.
- Roles: `guest < owner < utility_pm < analyst < admin`. Endpoints note the **min role**.
- Errors: `{ "detail": "message" }`, standard HTTP codes.
- Lists: `?limit=&offset=`, filters as query params; responses `{ items, total }`.
- Units explicit in field names (`_wft2`, `_kw`, `_f`, `_ft2`).

## Routers & endpoints

### `auth` — `/api/auth`
| Method | Path | Min role | Purpose |
|---|---|---|---|
| POST | `/login` | public | `{email,password}` → `{token, role, user}` |
| POST | `/refresh` | guest | rotate token |
| GET | `/me` | guest | current user |

### `reference` — `/api/reference` (dimensions for filters/dropdowns)
| GET | `/building-types` | guest | with group + sector |
| GET | `/climate-zones` | guest | |
| GET | `/vintages` | guest | |
| GET | `/programs` · `/utilities` | guest | program dims |
| GET | `/strategies` | guest | DF strategy taxonomy: `strategy_code,name,category,sub_category,flex_categories,levels` (`DF_STRATEGIES.md`); filter `?category,flex,sector` |
| GET | `/strategies/{strategy_code}` | guest | one strategy + Low/Med/High levels + grid services |

### `sites` — `/api/sites`
| GET | `/` | guest | filter by `sector,climate_zone,bldg_type,state,program,size_bucket,q`; guests get curated (no owner-private rows) |
| GET | `/{site_id}` | guest | metadata + strategies + linked analyses |
| GET | `/{site_id}/load` | owner¹ | interval load series `?from&to&step` (TimescaleDB) |
| POST | `/` · PUT `/{id}` · DELETE `/{id}` | analyst | curation |
¹ owner only for own sites; utility_pm/analyst for all.

### `potential` — `/api/potential` (DF potential assessment — HVAC)
Two estimators: **basic** (regression, needs only building type + OAT) and **advanced**
(engineering, user supplies AHU/chiller field data — LBNL ADR Tool "Option-2").
| GET | `/estimate` | guest | **basic**: inputs `bldg_type,precool_deg,reset_deg,event_hour,oat_f,output_unit` → evaluates `potential_equation` (DR potential % or shed W/ft²); optional `vintage,climate_zone` add `sim_result` aggregates (DDI, DII, kW/10k sf, %shed, net kWh) |
| GET | `/estimate/duty-cycle` | guest | **basic** RTU duty cycling: `building_type,climate_zone(CEC CZ03/04/12/13),event_hour,oat_f,minutes_off_per_hour,compressor_only[,meter_kw]` → full-cycle DR%, scaled fraction (`×minutes/60`), DR kW. LBNL ADR Tool CycleOnOff regressions. |
| POST | `/estimate/advanced` | guest | **advanced**: engineering VAV GTA + SP-reset calc from AHU/chiller inputs (airflow, static pressures, fan/motor eff, temps, AC capacity/eff, OSA%) → per-mechanism kW reductions + `total_direct_kw` + enthalpy coast. No DB. RTU duty-cycling advanced calc deferred. |
| GET | `/measures` | guest | available GTA measures per building type (`measure_id`, precool/reset, hours) |
| GET | `/curve` | guest | evaluate `potential_equation` across an OAT sweep → (OAT, value) points for the shed-vs-OAT chart |
| GET | `/matrix` | guest | grid of `sim_result` across GTA levels for a type×vintage×climate |

### `performance` — `/api/performance` (field quantification via reused engine)
| GET | `/analyses` | utility_pm | list `dr_analysis` (filter by site/program) |
| GET | `/analyses/{analysis_id}` | utility_pm | config: window, dates, exclusions, baselines |
| POST | `/analyses` | analyst | create analysis (site, program, event window, dates) |
| PUT | `/analyses/{id}/exclusions` | analyst | day-type + date exclusions (`dr_exclusions`, `dr_date_exclusions`) |
| POST | `/analyses/{id}/baselines` | analyst | add baseline: `type∈{oat_regression,x_over_y}`, `param1(X/num_days)`, `param2(Y)`, adjustment, caps |
| POST | `/analyses/{id}/run` | analyst | compute → populates `analysis_results_data`; returns summary (avg baseline, shed kW, shed W/ft², SE bands) |
| GET | `/analyses/{id}/results` | utility_pm | per-timestamp `{time_stamp, load_value, baseline_value, temperature}` for baseline-vs-actual chart |
| GET | `/events` | guest | curated `dr_event_performance` rows (Tier B post-processed) `?site,climate,program,baseline` |

### `benchmarking` — `/api/benchmarking`
| GET | `/cohorts` | guest | cohort stats (n, mean/median/p25/p75/p90 of shed_wft2, ddi) by type×vintage×climate×size |
| GET | `/rank` | guest | place a site/inputs on its cohort → percentile, distribution points |
| GET | `/map` | guest | site points `{site_id, lat, lng, shed_wft2, program}` for MapLibre |
| GET | `/scatter` | guest | x/y metric pairs for scatter (e.g., peak_oat vs shed_wft2) |

### `uploads` — `/api/uploads` (Phase 2, self-service)
| POST | `/` | owner | multipart CSV `{kind}` → `upload_batch` (validate, stage) |
| GET | `/{batch_id}` | owner | status + validation errors |
| POST | `/{batch_id}/commit` | owner | load into `interval_load`/`dr_event_performance`/site meta |

### `reports` — `/api/reports`
| POST | `/analysis/{id}` | utility_pm | build report → `{report_id}` |
| GET | `/analysis/{id}.pdf` | utility_pm | WeasyPrint PDF (baseline-vs-actual, metrics) |
| GET | `/analysis/{id}.csv` | utility_pm | results CSV |
| GET | `/benchmark.csv` | guest | cohort export |

### `admin` — `/api/admin`
| GET/POST/PUT | `/users` | admin | user + role management |
| POST | `/etl/{dataset}` | admin | trigger reference-data load |
| GET | `/etl/status` | admin | ETL run status |

## Compute flow (field performance — reused engine)
```
POST /analyses            → dr_analysis (+ dr_analysis_dates)
PUT  /analyses/{id}/exclusions → dr_exclusions, dr_date_exclusions
POST /analyses/{id}/baselines  → baselines (type_id, param1=X/num_days, param2=Y, caps, adj)
POST /analyses/{id}/run   → analytics.baseline.compute():
                              calc_valid_dates → oat_regression | x_over_y_baseline
                              → adjust (Morning/Day-of) → cap → analysis_results_data
GET  /analyses/{id}/results    → series for chart;  metrics.py → shed summary
```

## Pydantic schema sketch (key responses)
```python
class PotentialEstimate(BaseModel):
    bldg_type: str; vintage: str; climate_zone: str
    precool_deg: float; reset_deg: float
    shed_wft2: float; kw_shed_per_10k_sf: float
    ddi_wft2: float; dii: float; pct_shed_of_baseline: float; net_kwh_increase_pct: float

class BaselineSpec(BaseModel):
    type: Literal["oat_regression", "x_over_y"]
    param1: int            # X (num highest days) or num_days for regression
    param2: int | None     # Y (pool size) for x_over_y
    adjustment: Literal["none", "morning", "day_of"] = "none"
    lower_cap_pct: float | None = None; upper_cap_pct: float | None = None

class ResultPoint(BaseModel):
    time_stamp: datetime; load_value: float; baseline_value: float; temperature: float | None

class CohortStat(BaseModel):
    bldg_type: str; vintage: str; climate_zone: str; size_bucket: str; n: int
    shed_wft2_mean: float; shed_wft2_p25: float; shed_wft2_median: float
    shed_wft2_p75: float; shed_wft2_p90: float
```
