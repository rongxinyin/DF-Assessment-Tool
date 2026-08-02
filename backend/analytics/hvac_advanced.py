"""Advanced HVAC demand-flexibility estimator (engineering / physics based).

Ports the "Option-2 VAV GTA, SP Reset (AHU)" tab of the LBNL ADR Tool
(reference/df-estimation-tool/LBNL ADR Tool Beta.MA.V1.0.xlsx). Unlike the
regression estimator in potential.py (which needs only building type + OAT), this
takes detailed AHU/chiller inputs and computes shed from first principles for two
strategies: VAV Global Temperature Adjustment (GTA) and Static Pressure (SP) reset.

Fan air power:  kW = CFM x SP(inWC) x 0.746 / (6356 x FanEff x MotorEff)
Pure functions, no DB — unit-tested against the workbook in tests/test_hvac_advanced.py.
"""

from __future__ import annotations

from dataclasses import dataclass

FAN_AIRPOWER_CONST = 0.746   # kW per HP
FAN_DIVISOR = 6356.0         # CFM·inWC per air-HP
BTU_PER_KWH = 3413.0
BTU_PER_TON_HR = 12000.0


@dataclass
class VavGtaSpResetInputs:
    """Field inputs (defaults mirror the workbook's worked example)."""

    ahu_max_cfm: float = 140000.0
    total_static_pressure_inwc: float = 4.25
    reset_static_pressure_inwc: float = 4.0
    fan_efficiency: float = 0.55
    motor_efficiency: float = 0.917
    coil_leaving_temp_f: float = 53.5
    normal_space_temp_f: float = 72.0
    reset_space_temp_f: float = 76.0
    pct_reduction_per_deg: float = 0.025      # chiller load reduction per °F reset
    ac_capacity_tons: float = 359.1666667
    ac_efficiency_kw_per_ton: float = 1.230148009
    ac_load_factor: float = 0.75              # CSSB
    return_air_frac: float = 0.75             # 1 - outside-air fraction
    # optional enthalpy-coast inputs
    conditioned_area_ft2: float | None = 140000.0
    ceiling_height_ft: float | None = 8.0
    density_enthalpy_normal: float | None = 0.0743 * 26.39   # lbm/ft³ · Btu/lbm @72F,50%RH
    density_enthalpy_reset: float | None = 0.0736 * 28.7     # @76F,50%RH


@dataclass
class VavGtaSpResetResult:
    reduced_cfm: float
    cfm_reduction_frac: float
    baseline_airflow_kw: float
    dr_airflow_kw: float
    airflow_reduction_kw: float          # GTA (CFM) only
    sp_reduction_kw: float               # incremental SP effect
    cfm_sp_reduction_kw: float           # combined CFM + SP
    chiller_offset_tons: float
    interactive_fan_kw: float            # chiller saving from reduced fan heat
    baseline_chiller_kw: float
    dr_chiller_kw: float
    chiller_reduction_kw: float          # direct GTA chiller saving
    total_direct_kw: float               # CFM+SP + interactive + chiller
    coast_energy_kwh: float | None       # one-time thermal-mass coast (optional)


def fan_air_power_kw(cfm: float, sp_inwc: float, fan_eff: float, motor_eff: float) -> float:
    return cfm * sp_inwc * FAN_AIRPOWER_CONST / (FAN_DIVISOR * fan_eff * motor_eff)


def estimate_vav_gta_sp_reset(inp: VavGtaSpResetInputs) -> VavGtaSpResetResult:
    fe, me = inp.fan_efficiency, inp.motor_efficiency

    # 1. CFM reduction from space-temp reset (larger ΔT -> less airflow needed)
    dt_normal = inp.normal_space_temp_f - inp.coil_leaving_temp_f
    dt_reset = inp.reset_space_temp_f - inp.coil_leaving_temp_f
    if dt_reset <= 0 or dt_normal <= 0:
        raise ValueError("space temps must exceed coil leaving temp")
    cfm_ratio = dt_normal / dt_reset
    reduced_cfm = inp.ahu_max_cfm * cfm_ratio
    cfm_reduction_frac = 1.0 - cfm_ratio

    # 2. Fan power at baseline / after CFM reduction / after CFM+SP reduction
    baseline_airflow_kw = fan_air_power_kw(inp.ahu_max_cfm, inp.total_static_pressure_inwc, fe, me)
    dr_airflow_kw = fan_air_power_kw(reduced_cfm, inp.total_static_pressure_inwc, fe, me)
    dr_cfm_sp_kw = fan_air_power_kw(reduced_cfm, inp.reset_static_pressure_inwc, fe, me)

    airflow_reduction_kw = baseline_airflow_kw - dr_airflow_kw
    sp_reduction_kw = dr_airflow_kw - dr_cfm_sp_kw
    cfm_sp_reduction_kw = baseline_airflow_kw - dr_cfm_sp_kw

    # 3. Interactive: less fan heat -> less chiller load
    chiller_offset_tons = cfm_sp_reduction_kw * BTU_PER_KWH * inp.return_air_frac / BTU_PER_TON_HR
    interactive_fan_kw = chiller_offset_tons * inp.ac_efficiency_kw_per_ton

    # 4. Direct chiller reduction from GTA (per-degree load drop)
    deg_reset = inp.reset_space_temp_f - inp.normal_space_temp_f
    baseline_chiller_kw = (
        inp.ac_capacity_tons * inp.ac_efficiency_kw_per_ton * inp.ac_load_factor
    )
    dr_chiller_kw = baseline_chiller_kw * (1.0 - inp.pct_reduction_per_deg * deg_reset)
    chiller_reduction_kw = baseline_chiller_kw - dr_chiller_kw

    total_direct_kw = cfm_sp_reduction_kw + interactive_fan_kw + chiller_reduction_kw

    # 5. Optional enthalpy coast (thermal-mass one-time energy)
    coast_energy_kwh = None
    if (
        inp.conditioned_area_ft2 and inp.ceiling_height_ft
        and inp.density_enthalpy_normal and inp.density_enthalpy_reset
    ):
        volume = inp.conditioned_area_ft2 * inp.ceiling_height_ft
        btu_diff = volume * (inp.density_enthalpy_reset - inp.density_enthalpy_normal)
        coast_energy_kwh = btu_diff / BTU_PER_KWH

    return VavGtaSpResetResult(
        reduced_cfm=reduced_cfm,
        cfm_reduction_frac=cfm_reduction_frac,
        baseline_airflow_kw=baseline_airflow_kw,
        dr_airflow_kw=dr_airflow_kw,
        airflow_reduction_kw=airflow_reduction_kw,
        sp_reduction_kw=sp_reduction_kw,
        cfm_sp_reduction_kw=cfm_sp_reduction_kw,
        chiller_offset_tons=chiller_offset_tons,
        interactive_fan_kw=interactive_fan_kw,
        baseline_chiller_kw=baseline_chiller_kw,
        dr_chiller_kw=dr_chiller_kw,
        chiller_reduction_kw=chiller_reduction_kw,
        total_direct_kw=total_direct_kw,
        coast_energy_kwh=coast_energy_kwh,
    )
