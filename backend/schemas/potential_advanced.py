"""Request/response models for the advanced (engineering) HVAC DF estimator.

Mirrors analytics.hvac_advanced (LBNL ADR Tool 'Option-2 VAV GTA, SP Reset').
Defaults match the workbook's worked example so the endpoint is usable as-is.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class VavGtaSpResetRequest(BaseModel):
    ahu_max_cfm: float = Field(140000.0, gt=0, description="AHU max airflow (CFM)")
    total_static_pressure_inwc: float = Field(4.25, gt=0, description="Total SF static pressure (in WC)")
    reset_static_pressure_inwc: float = Field(4.0, gt=0, description="Reset static pressure (in WC)")
    fan_efficiency: float = Field(0.55, gt=0, le=1)
    motor_efficiency: float = Field(0.917, gt=0, le=1)
    coil_leaving_temp_f: float = Field(53.5, description="Cooling coil leaving air temp (°F)")
    normal_space_temp_f: float = Field(72.0, description="Normal space temp setpoint (°F)")
    reset_space_temp_f: float = Field(76.0, description="Reset space temp setpoint (°F)")
    pct_reduction_per_deg: float = Field(0.025, ge=0, description="Chiller load reduction per °F reset")
    ac_capacity_tons: float = Field(359.1666667, gt=0)
    ac_efficiency_kw_per_ton: float = Field(1.230148009, gt=0)
    ac_load_factor: float = Field(0.75, gt=0, le=1, description="CSSB load factor")
    return_air_frac: float = Field(0.75, ge=0, le=1, description="1 - outside-air fraction")
    conditioned_area_ft2: float | None = Field(140000.0, description="For enthalpy coast (optional)")
    ceiling_height_ft: float | None = Field(8.0, description="For enthalpy coast (optional)")
    density_enthalpy_normal: float | None = Field(0.0743 * 26.39, description="lbm/ft³·Btu/lbm @ normal setpoint")
    density_enthalpy_reset: float | None = Field(0.0736 * 28.7, description="lbm/ft³·Btu/lbm @ reset setpoint")


class VavGtaSpResetResponse(BaseModel):
    reduced_cfm: float
    cfm_reduction_frac: float
    baseline_airflow_kw: float
    dr_airflow_kw: float
    airflow_reduction_kw: float
    sp_reduction_kw: float
    cfm_sp_reduction_kw: float
    chiller_offset_tons: float
    interactive_fan_kw: float
    baseline_chiller_kw: float
    dr_chiller_kw: float
    chiller_reduction_kw: float
    total_direct_kw: float
    coast_energy_kwh: float | None = None
