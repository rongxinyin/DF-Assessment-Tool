"""Request/response models for field-performance analyses (DR v4 engine)."""

from __future__ import annotations

from datetime import date, datetime, time
from typing import Literal

from pydantic import BaseModel, Field

BaselineType = Literal["oat_regression", "x_of_y"]
Adjustment = Literal["none", "morning", "day_of"]

# legacy vocab ids (baseline_types / baseline_adjustment seeds)
BASELINE_TYPE_IDS: dict[str, int] = {"x_of_y": 1, "oat_regression": 2}
ADJUSTMENT_IDS: dict[str, int] = {"morning": 1, "day_of": 2}


class BaselineSpec(BaseModel):
    type: BaselineType
    param1: int = Field(..., gt=0, description="X (highest days) or regression num_days")
    param2: int | None = Field(None, gt=0, description="Y (pool size), x_of_y only")
    adjustment: Adjustment = "none"
    adj_start: time | None = None
    adj_end: time | None = None
    lower_cap: float | None = Field(None, gt=0, description="e.g. 0.8")
    upper_cap: float | None = Field(None, gt=0, description="e.g. 1.2")


class ExclusionSpec(BaseModel):
    ex_weekends: bool = True
    ex_weekdays: bool = False
    ex_holidays: bool = True
    ex_dr_days: bool = True
    excluded_dates: list[date] = []


class AnalysisCreate(BaseModel):
    site_id: int
    analysis_name: str
    analysis_description: str | None = None
    program_id: int | None = None
    start_time: time                       # DR event window
    end_time: time
    dr_dates: list[date] = Field(..., min_length=1)
    station_id: int | None = None          # weather station for interval_weather
    exclusions: ExclusionSpec = ExclusionSpec()
    baselines: list[BaselineSpec] = []


class AnalysisOut(BaseModel):
    analysis_id: int
    analysis_name: str
    site_id: int
    start_time: time
    end_time: time
    dr_dates: list[date]
    baseline_ids: list[int]


class RunSummary(BaseModel):
    baseline_id: int
    dr_date: date
    n_points: int
    baseline_avg_kw: float | None = None
    actual_avg_kw: float | None = None
    shed_avg_kw: float | None = None
    shed_max_kw: float | None = None
    shed_pct_of_baseline: float | None = None
    shed_avg_wft2: float | None = None
    adjustment_ratio: float | None = None


class ResultPoint(BaseModel):
    baseline_id: int
    dr_date: date
    time_stamp: datetime
    load_value: float | None
    baseline_value: float | None
    temperature: float | None
