"""Pydantic response models for the DF potential endpoints."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

OutputUnit = Literal["pct", "wft2"]


class Measure(BaseModel):
    measure_id: str
    precool_deg: float
    reset_deg: float
    event_hours: list[int]


class EstimateResponse(BaseModel):
    building_type: str
    measure_id: str
    precool_deg: float
    reset_deg: float
    event_hour: int
    output_unit: OutputUnit
    oat_f: float
    value: float  # DR potential % (pct) or shed W/ft2 (wft2)


class CurvePoint(BaseModel):
    oat_f: float
    value: float


class CurveResponse(BaseModel):
    building_type: str
    measure_id: str
    event_hour: int
    output_unit: OutputUnit
    points: list[CurvePoint]


class DutyCycleEstimateResponse(BaseModel):
    building_type: str
    climate_zone: str          # CEC zone, e.g. 'CZ03'
    measure_id: str
    compressor_only: bool
    event_hour: int
    oat_f: float
    minutes_off_per_hour: float
    dr_pct_full_cycle: float   # regression DR% at 60 min off/hr
    dr_fraction: float         # scaled: dr_pct/100 * minutes/60
    dr_kw: float | None = None  # dr_fraction * meter_kw when meter_kw given


class SimResultRow(BaseModel):
    building_type: str
    vintage_code: str | None = None
    climate_zone: str | None = None
    gta_level_f: float | None = None
    highest_gta_scenario: str | None = None
    ddi_gta_only_wft2: float | None = None
    ddi_precool_adj_wft2: float | None = None
    kw_shed_per_10k_sf: float | None = None
    pct_shed_of_baseline: float | None = None
    dii: float | None = None
    precool_kwh_change_pct: float | None = None
    net_kwh_increase_pct: float | None = None
    optmax_gta_f: float | None = None
