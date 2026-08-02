"""Validate the advanced HVAC estimator against the LBNL ADR Tool workbook
('Option-2 VAV GTA, SP Reset (AHU)' worked example). Tolerances are loose (~1%)
to absorb the workbook's rounded fan constant (0.747 vs standard 0.746 kW/HP).
"""

import pytest

from analytics.hvac_advanced import VavGtaSpResetInputs, estimate_vav_gta_sp_reset

R = estimate_vav_gta_sp_reset(VavGtaSpResetInputs())


def test_cfm_reduction_fraction():
    # 1 - (72-53.5)/(76-53.5) = 0.17778
    assert R.cfm_reduction_frac == pytest.approx(0.177778, rel=1e-4)


def test_baseline_and_dr_airflow():
    assert R.baseline_airflow_kw == pytest.approx(138.65, rel=1e-2)
    assert R.dr_airflow_kw == pytest.approx(114.00, rel=1e-2)
    assert R.airflow_reduction_kw == pytest.approx(24.65, rel=1e-2)


def test_sp_and_combined_reduction():
    assert R.sp_reduction_kw == pytest.approx(6.706, rel=2e-2)
    assert R.cfm_sp_reduction_kw == pytest.approx(31.355, rel=1e-2)


def test_interactive_chiller_offset():
    assert R.chiller_offset_tons == pytest.approx(6.688, rel=2e-2)
    assert R.interactive_fan_kw == pytest.approx(8.228, rel=2e-2)


def test_direct_chiller_reduction():
    assert R.baseline_chiller_kw == pytest.approx(331.37, rel=1e-3)
    assert R.dr_chiller_kw == pytest.approx(298.23, rel=1e-3)
    assert R.chiller_reduction_kw == pytest.approx(33.137, rel=1e-3)


def test_total_direct_reduction():
    assert R.total_direct_kw == pytest.approx(72.72, rel=1e-2)


def test_enthalpy_coast_energy():
    # volume 1,120,000 ft³ × Δ(density·enthalpy) / 3413 ≈ 49.7 kWh
    assert R.coast_energy_kwh == pytest.approx(169728.0 / 3413.0, rel=2e-2)
