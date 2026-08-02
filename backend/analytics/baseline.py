"""Field-performance baseline engine — port of the legacy DR v4 PL/pgSQL functions
(reference/pg_iep20_dr_v4_2015-10-14; see docs/LEGACY_DB_REVIEW.md).

Pure pandas/numpy: series in, series out — no DB. The API layer feeds it interval
load/weather from the TimescaleDB hypertables and persists results to
analysis_results_data.

Ported functions:
  calc_valid_dates      -> valid_days()
  oat_regression        -> oat_regression_baseline()
  x_over_y_baseline     -> x_of_y_baseline()
  morning/day-of adjust -> adjustment_ratio() + apply_adjustment()

Conventions: input series are indexed by naive pd.DatetimeIndex at a regular
interval; matching across days is by exact time-of-day, as in the legacy engine.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, time, timedelta

import numpy as np
import pandas as pd


# ── day pool (legacy calc_valid_dates) ─────────────────────────────────────
@dataclass(frozen=True)
class ExclusionRules:
    """Which days may enter the baseline pool (legacy dr_exclusions flags)."""

    exclude_weekends: bool = True
    exclude_weekdays: bool = False
    excluded_dates: frozenset = field(default_factory=frozenset)  # DR days, holidays, manual


def valid_days(event_date: date, num_days: int, rules: ExclusionRules) -> list[date]:
    """Walk backwards from (not including) event_date until num_days valid days
    are collected. Exact port of legacy calc_valid_dates."""
    days: list[date] = []
    cur = event_date
    while len(days) < num_days:
        cur = cur - timedelta(days=1)
        is_weekend = cur.weekday() >= 5  # Sat=5, Sun=6
        if rules.exclude_weekends and is_weekend:
            continue
        if rules.exclude_weekdays and not is_weekend:
            continue
        if cur in rules.excluded_dates:
            continue
        days.append(cur)
    return days


# ── helpers ────────────────────────────────────────────────────────────────
def _at_time_on_days(series: pd.Series, tod: time, days: list[date]) -> pd.Series:
    """Values of `series` at time-of-day `tod` on each of `days` (missing dropped)."""
    idx = pd.DatetimeIndex([pd.Timestamp.combine(d, tod) for d in days])
    return series.reindex(idx).dropna()


# ── X-day OAT regression (legacy oat_regression) ───────────────────────────
def oat_regression_baseline(
    load: pd.Series,
    oat: pd.Series,
    event_timestamps: pd.DatetimeIndex,
    num_days: int,
    rules: ExclusionRules,
) -> pd.Series:
    """Weather-normalized baseline: for each event timestamp, OLS of load vs OAT
    at the same time-of-day across the prior num_days valid days, evaluated at
    the event's OAT. slope b = r * sd_y/sd_x, intercept a = ybar - b*xbar."""
    out: dict[pd.Timestamp, float] = {}
    for ts in event_timestamps:
        days = valid_days(ts.date(), num_days, rules)
        x = _at_time_on_days(oat, ts.time(), days)
        y = _at_time_on_days(load, ts.time(), days)
        common = x.index.intersection(y.index)
        x, y = x.loc[common], y.loc[common]
        if len(common) < 2:
            out[ts] = np.nan
            continue
        x_bar, y_bar = x.mean(), y.mean()
        x_sd, y_sd = x.std(ddof=1), y.std(ddof=1)
        sxx = ((x - x_bar) ** 2).sum()
        syy = ((y - y_bar) ** 2).sum()
        sxy = ((x - x_bar) * (y - y_bar)).sum()
        r = sxy / np.sqrt(sxx * syy) if sxx * syy > 0 else 0.0
        b = r * y_sd / x_sd if x_sd > 0 else 0.0
        a = y_bar - b * x_bar
        x_event = oat.get(ts, np.nan)
        out[ts] = a + b * x_event
    return pd.Series(out, name="baseline_kw")


# ── high X-of-Y (legacy x_over_y_baseline) ─────────────────────────────────
def x_of_y_baseline(
    load: pd.Series,
    event_timestamps: pd.DatetimeIndex,
    x: int,
    y: int,
    dr_start: time,
    dr_end: time,
    rules: ExclusionRules,
) -> pd.Series:
    """Average the top-x of the prior y valid days, ranked by summed load over the
    DR window (legacy predicate: time > dr_start AND time <= dr_end)."""
    if x > y:
        raise ValueError(f"X ({x}) cannot be greater than Y ({y})")

    out: dict[pd.Timestamp, float] = {}
    tod = load.index.time
    day = pd.DatetimeIndex(load.index).normalize()
    in_window = (tod > dr_start) & (tod <= dr_end)

    # cache the top-x day selection per event date (same pool for all timestamps)
    top_cache: dict[date, list[date]] = {}

    def top_days(event_date: date) -> list[date]:
        if event_date not in top_cache:
            pool = valid_days(event_date, y, rules)
            sums = []
            for d in pool:
                mask = in_window & (day == pd.Timestamp(d))
                vals = load[mask]
                if len(vals):
                    sums.append((vals.sum(), d))
            sums.sort(key=lambda t: t[0], reverse=True)
            top_cache[event_date] = [d for _, d in sums[:x]]
        return top_cache[event_date]

    for ts in event_timestamps:
        days = top_days(ts.date())
        vals = _at_time_on_days(load, ts.time(), days)
        out[ts] = vals.mean() if len(vals) else np.nan
    return pd.Series(out, name="baseline_kw")


# ── adjustment + caps (legacy baselines.adj_*, caps, baseline_adjustment) ──
def adjustment_ratio(
    actual: pd.Series,
    baseline: pd.Series,
    adj_start: time,
    adj_end: time,
    event_date: date,
    lower_cap: float | None = None,
    upper_cap: float | None = None,
) -> float:
    """Multiplicative morning/day-of adjustment: mean(actual)/mean(baseline) over
    the pre-event adjustment window on the event day, clamped to the caps
    (legacy lower/upper_cap_percentage, e.g. 0.8/1.2)."""
    tod_a = actual.index.time
    day_a = pd.DatetimeIndex(actual.index).normalize()
    win_a = actual[(tod_a >= adj_start) & (tod_a <= adj_end) & (day_a == pd.Timestamp(event_date))]
    tod_b = baseline.index.time
    day_b = pd.DatetimeIndex(baseline.index).normalize()
    win_b = baseline[(tod_b >= adj_start) & (tod_b <= adj_end) & (day_b == pd.Timestamp(event_date))]
    if not len(win_a) or not len(win_b) or win_b.mean() == 0:
        return 1.0
    ratio = float(win_a.mean() / win_b.mean())
    if lower_cap is not None:
        ratio = max(ratio, lower_cap)
    if upper_cap is not None:
        ratio = min(ratio, upper_cap)
    return ratio


def apply_adjustment(baseline: pd.Series, ratio: float) -> pd.Series:
    return baseline * ratio
