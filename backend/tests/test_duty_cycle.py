"""Unit tests for the RTU duty-cycling estimator (pure math, no DB).

Coefficients from the LBNL ADR Tool V2.1 'LoadShed Database' CZ03CycleOnOff table,
row SmallOfficeCZ03CycleYes1 (compressor-only, event hour 1).
Workbook semantics: DR% = piecewise(OAT); fraction = DR%/100 * minutes_off/60;
DR kW = fraction * meter kW.
"""

import pytest

from analytics.potential import PiecewiseEquation, scale_duty_cycle

EQ = PiecewiseEquation(
    seg1=(0.756971470098918, -34.8898750863928),    # OAT <= 75
    seg2=(0.508209217356369, -16.5582690830052),    # 75 < OAT <= 95
    seg3=(0.0, 0.0),                                # OAT > 95 (unpopulated for CZ03)
)


def test_full_cycle_pct_at_85F():
    expected = 0.508209217356369 * 85 - 16.5582690830052   # ≈ 26.64 %
    assert EQ.evaluate(85) == pytest.approx(expected)
    assert EQ.evaluate(85) == pytest.approx(26.639, abs=1e-3)


def test_scaling_by_minutes_off():
    # 30 min off/hr = half the full-hour potential
    r = scale_duty_cycle(EQ.evaluate(85), minutes_off_per_hour=30)
    assert r["dr_fraction"] == pytest.approx(26.639 / 100 / 2, abs=1e-4)
    assert r["dr_kw"] is None  # no meter kW given


def test_dr_kw_with_meter_power():
    r = scale_duty_cycle(EQ.evaluate(85), minutes_off_per_hour=20, meter_kw=240.0)
    # 26.639% * 20/60 * 240 kW ≈ 21.31 kW
    assert r["dr_kw"] == pytest.approx(26.639 / 100 * 20 / 60 * 240, abs=1e-2)


def test_low_oat_segment():
    expected = 0.756971470098918 * 70 - 34.8898750863928   # ≈ 18.10 %
    assert EQ.evaluate(70) == pytest.approx(expected)


def test_full_hour_is_identity_scaling():
    r = scale_duty_cycle(EQ.evaluate(85), minutes_off_per_hour=60)
    assert r["dr_fraction"] == pytest.approx(EQ.evaluate(85) / 100)
