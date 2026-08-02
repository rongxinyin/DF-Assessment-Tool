"""Response models for benchmarking + Tier B event browsing."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel


class EventRow(BaseModel):
    id: int
    site_code: str | None
    site_name: str | None
    bldg_type: str | None
    climate_zone: str | None
    data_source: str | None
    event_date: date | None
    shed_start: datetime | None
    shed_end: datetime | None
    program: str | None
    baseline_code: str | None
    baseline_type: str | None          # resolved description
    peak_oat_f: float | None
    event_avg_oat_f: float | None
    max_oat_f: float | None
    kw_avg: float | None
    peak_demand_intensity_wft2: float | None
    shed_avg_wft2: float | None
    wbp_pct_avg: float | None


class EventPage(BaseModel):
    items: list[EventRow]
    total: int


class EventSummary(BaseModel):
    n_events: int
    n_sites: int
    shed_avg_wft2_mean: float | None
    shed_avg_wft2_median: float | None
    pdi_wft2_mean: float | None


class CohortRow(BaseModel):
    bldg_type: str | None
    vintage_code: str | None
    climate_zone: str | None
    size_bucket: str
    n: int
    shed_wft2_mean: float | None
    shed_wft2_p25: float | None
    shed_wft2_median: float | None
    shed_wft2_p75: float | None
    shed_wft2_p90: float | None
    pdi_wft2_mean: float | None


class ScatterPoint(BaseModel):
    site_code: str | None
    bldg_type: str | None
    climate_zone: str | None
    data_source: str | None
    oat_f: float | None                # coalesce(peak, max, event_avg)
    shed_avg_wft2: float | None
