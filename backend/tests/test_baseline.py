"""Unit tests for the ported DR v4 baseline engine (synthetic data, no DB).

The synthetic month: hourly data, weekdays only significant; load is an exact
linear function of OAT so the regression must recover it perfectly.
"""

from datetime import date, time

import numpy as np
import pandas as pd
import pytest

from analytics.baseline import (
    ExclusionRules,
    adjustment_ratio,
    apply_adjustment,
    oat_regression_baseline,
    valid_days,
    x_of_y_baseline,
)
from analytics.metrics import shed_metrics

RULES = ExclusionRules(exclude_weekends=True)


# ── valid_days (calc_valid_dates) ──────────────────────────────────────────
def test_valid_days_skips_weekends():
    # 2024-06-17 is a Monday; previous valid weekdays: 14(Fri) 13(Thu) 12(Wed)
    days = valid_days(date(2024, 6, 17), 3, RULES)
    assert days == [date(2024, 6, 14), date(2024, 6, 13), date(2024, 6, 12)]


def test_valid_days_skips_excluded_dates():
    rules = ExclusionRules(excluded_dates=frozenset({date(2024, 6, 14)}))
    days = valid_days(date(2024, 6, 17), 3, rules)
    assert date(2024, 6, 14) not in days
    assert days[0] == date(2024, 6, 13)


# ── synthetic series ───────────────────────────────────────────────────────
def make_series(slope=2.0, intercept=5.0, start="2024-06-01", days=20):
    """Hourly OAT ramp per day; load = slope*OAT + intercept exactly."""
    idx = pd.date_range(start, periods=days * 24, freq="h")
    hours = idx.hour.to_numpy()
    day_offset = (idx.dayofyear - idx.dayofyear.min()).to_numpy()
    oat = pd.Series(60.0 + hours + 0.1 * day_offset, index=idx)  # varies by hour & day
    load = slope * oat + intercept
    return load, oat


def test_oat_regression_recovers_linear_relation():
    load, oat = make_series(slope=2.0, intercept=5.0)
    # event: Friday 2024-06-14, hours 14:00-17:00
    event_ts = pd.date_range("2024-06-14 14:00", "2024-06-14 17:00", freq="h")
    baseline = oat_regression_baseline(load, oat, event_ts, num_days=5, rules=RULES)
    expected = 2.0 * oat.loc[event_ts] + 5.0
    assert np.allclose(baseline.values, expected.values)


def test_oat_regression_flat_load_gives_mean():
    load, oat = make_series(slope=0.0, intercept=42.0)  # load constant 42
    event_ts = pd.DatetimeIndex([pd.Timestamp("2024-06-14 15:00")])
    baseline = oat_regression_baseline(load, oat, event_ts, num_days=5, rules=RULES)
    assert baseline.iloc[0] == pytest.approx(42.0)


# ── x-of-y ─────────────────────────────────────────────────────────────────
def test_x_of_y_selects_highest_days():
    # 10 weekdays 2024-06-03..2024-06-14; day k has constant load = k (kW).
    idx = pd.date_range("2024-06-01", periods=20 * 24, freq="h")
    day_level = pd.Series(idx.day.astype(float), index=idx)  # load = day-of-month
    event_ts = pd.DatetimeIndex([pd.Timestamp("2024-06-17 15:00")])  # Monday
    baseline = x_of_y_baseline(
        day_level, event_ts, x=3, y=10,
        dr_start=time(14, 0), dr_end=time(18, 0), rules=RULES,
    )
    # top 3 of the prior 10 weekdays by window sum = Jun 14, 13, 12 → mean 13
    assert baseline.iloc[0] == pytest.approx((14 + 13 + 12) / 3)


def test_x_of_y_rejects_x_greater_than_y():
    idx = pd.date_range("2024-06-01", periods=24, freq="h")
    s = pd.Series(1.0, index=idx)
    with pytest.raises(ValueError):
        x_of_y_baseline(s, pd.DatetimeIndex([idx[0]]), x=11, y=10,
                        dr_start=time(14), dr_end=time(18), rules=RULES)


# ── adjustment ─────────────────────────────────────────────────────────────
def test_adjustment_ratio_and_caps():
    idx = pd.date_range("2024-06-14 08:00", "2024-06-14 12:00", freq="h")
    actual = pd.Series(110.0, index=idx)
    baseline = pd.Series(100.0, index=idx)
    r = adjustment_ratio(actual, baseline, time(8), time(12), date(2024, 6, 14))
    assert r == pytest.approx(1.10)
    # cap at 1.05
    r_capped = adjustment_ratio(actual, baseline, time(8), time(12), date(2024, 6, 14),
                                lower_cap=0.95, upper_cap=1.05)
    assert r_capped == pytest.approx(1.05)
    adj = apply_adjustment(baseline, r_capped)
    assert adj.iloc[0] == pytest.approx(105.0)


# ── metrics ────────────────────────────────────────────────────────────────
def test_shed_metrics():
    idx = pd.date_range("2024-06-14 14:00", periods=4, freq="h")
    actual = pd.Series([80.0, 85.0, 90.0, 85.0], index=idx)
    baseline = pd.Series([100.0, 105.0, 110.0, 105.0], index=idx)
    m = shed_metrics(actual, baseline, area_ft2=100_000)
    assert m["n_points"] == 4
    assert m["shed_avg_kw"] == pytest.approx(20.0)
    assert m["shed_max_kw"] == pytest.approx(20.0)
    assert m["shed_pct_of_baseline"] == pytest.approx(20 / 105 * 100)
    assert m["shed_avg_wft2"] == pytest.approx(0.2)          # 20 kW over 100k ft²
    assert m["peak_demand_intensity_wft2"] == pytest.approx(0.9)
