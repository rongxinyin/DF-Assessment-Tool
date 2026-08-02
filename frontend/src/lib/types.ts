// API response types — mirror backend/schemas/potential*.py.

export type OutputUnit = 'pct' | 'wft2'

export interface Measure {
  measure_id: string
  precool_deg: number
  reset_deg: number
  event_hours: number[]
}

export interface Estimate {
  building_type: string
  measure_id: string
  precool_deg: number
  reset_deg: number
  event_hour: number
  output_unit: OutputUnit
  oat_f: number
  value: number
}

export interface CurvePoint {
  oat_f: number
  value: number
}

export interface Curve {
  building_type: string
  measure_id: string
  event_hour: number
  output_unit: OutputUnit
  points: CurvePoint[]
}

// ── performance / benchmarking (mirror backend/schemas/benchmarking.py) ────
export interface EventRow {
  id: number
  site_code: string | null
  site_name: string | null
  bldg_type: string | null
  climate_zone: string | null
  data_source: string | null
  event_date: string | null
  shed_start: string | null
  shed_end: string | null
  program: string | null
  baseline_code: string | null
  baseline_type: string | null
  peak_oat_f: number | null
  event_avg_oat_f: number | null
  max_oat_f: number | null
  kw_avg: number | null
  peak_demand_intensity_wft2: number | null
  shed_avg_wft2: number | null
  wbp_pct_avg: number | null
}

export interface EventPage {
  items: EventRow[]
  total: number
}

export interface EventSummary {
  n_events: number
  n_sites: number
  shed_avg_wft2_mean: number | null
  shed_avg_wft2_median: number | null
  pdi_wft2_mean: number | null
}

export interface CohortRow {
  bldg_type: string | null
  vintage_code: string | null
  climate_zone: string | null
  size_bucket: string
  n: number
  shed_wft2_mean: number | null
  shed_wft2_p25: number | null
  shed_wft2_median: number | null
  shed_wft2_p75: number | null
  shed_wft2_p90: number | null
  pdi_wft2_mean: number | null
}

export interface ScatterPoint {
  site_code: string | null
  bldg_type: string | null
  climate_zone: string | null
  data_source: string | null
  oat_f: number | null
  shed_avg_wft2: number | null
}

export interface RefBuildingType {
  bldg_type_id: number
  description: string
  group: string | null
}

export interface RefClimateZone {
  climate_zone_id: number
  climate_zone_description: string
}

export interface DutyCycleEstimate {
  building_type: string
  climate_zone: string
  measure_id: string
  compressor_only: boolean
  event_hour: number
  oat_f: number
  minutes_off_per_hour: number
  dr_pct_full_cycle: number
  dr_fraction: number
  dr_kw: number | null
}
