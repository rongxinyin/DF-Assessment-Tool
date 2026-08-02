"""DF potential assessment endpoints (public/guest).

See docs/API_SPEC.md — /potential. Evaluates the piecewise-linear estimation
equations (potential_equation) and serves sim_result aggregates.
"""

from __future__ import annotations

import asyncpg
from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException, Query

from analytics import potential as svc
from analytics.hvac_advanced import VavGtaSpResetInputs, estimate_vav_gta_sp_reset
from app.db import get_db
from schemas.potential import (
    CurvePoint,
    CurveResponse,
    DutyCycleEstimateResponse,
    EstimateResponse,
    Measure,
    OutputUnit,
    SimResultRow,
)
from schemas.potential_advanced import VavGtaSpResetRequest, VavGtaSpResetResponse

router = APIRouter(prefix="/potential", tags=["potential"])


@router.get("/measures", response_model=list[Measure])
async def measures(
    building_type: str = Query(..., description="e.g. SmallOffice"),
    conn: asyncpg.Connection = Depends(get_db),
) -> list[Measure]:
    rows = await svc.list_measures(conn, building_type)
    if not rows:
        raise HTTPException(404, f"no measures for building_type '{building_type}'")
    return [Measure(**r) for r in rows]


@router.get("/estimate", response_model=EstimateResponse)
async def estimate(
    building_type: str = Query(...),
    measure_id: str = Query(...),
    event_hour: int = Query(..., ge=1, le=4),
    oat_f: float = Query(..., description="outside air temperature, degF"),
    output_unit: OutputUnit = Query("wft2"),
    precool_deg: float | None = Query(None),
    reset_deg: float | None = Query(None),
    conn: asyncpg.Connection = Depends(get_db),
) -> EstimateResponse:
    result = await svc.estimate(
        conn, building_type, measure_id, event_hour, oat_f, output_unit,
        precool_deg, reset_deg,
    )
    if result is None:
        raise HTTPException(404, "no matching estimation equation")
    return EstimateResponse(**result)


@router.get("/curve", response_model=CurveResponse)
async def curve(
    building_type: str = Query(...),
    measure_id: str = Query(...),
    event_hour: int = Query(..., ge=1, le=4),
    output_unit: OutputUnit = Query("wft2"),
    oat_min: float = Query(60.0),
    oat_max: float = Query(110.0),
    step: float = Query(2.0, gt=0),
    precool_deg: float | None = Query(None),
    reset_deg: float | None = Query(None),
    conn: asyncpg.Connection = Depends(get_db),
) -> CurveResponse:
    points = await svc.curve(
        conn, building_type, measure_id, event_hour, output_unit,
        oat_min, oat_max, step, precool_deg, reset_deg,
    )
    if points is None:
        raise HTTPException(404, "no matching estimation equation")
    return CurveResponse(
        building_type=building_type, measure_id=measure_id, event_hour=event_hour,
        output_unit=output_unit, points=[CurvePoint(**p) for p in points],
    )


@router.get("/estimate/duty-cycle", response_model=DutyCycleEstimateResponse)
async def estimate_duty_cycle(
    building_type: str = Query(..., description="SmallOffice | MediumOffice | Retail"),
    climate_zone: str = Query(..., description="CEC zone: CZ03 | CZ04 | CZ12 | CZ13"),
    event_hour: int = Query(..., ge=1, le=4),
    oat_f: float = Query(..., description="outside air temperature, degF"),
    minutes_off_per_hour: float = Query(..., gt=0, le=60, description="duty cycle, e.g. 15/20/30"),
    compressor_only: bool = Query(True, description="cycle compressor only vs whole RTU"),
    meter_kw: float | None = Query(None, gt=0, description="whole-building meter kW for DR kW"),
    conn: asyncpg.Connection = Depends(get_db),
) -> DutyCycleEstimateResponse:
    """Basic (regression) RTU duty-cycling DF estimate — LBNL ADR Tool CycleOnOff model."""
    result = await svc.estimate_duty_cycle(
        conn, building_type, climate_zone, event_hour, oat_f,
        minutes_off_per_hour, compressor_only, meter_kw,
    )
    if result is None:
        raise HTTPException(404, "no matching duty-cycle equation")
    return DutyCycleEstimateResponse(**result)


@router.post("/estimate/advanced", response_model=VavGtaSpResetResponse)
async def estimate_advanced(req: VavGtaSpResetRequest) -> VavGtaSpResetResponse:
    """Engineering (physics) HVAC DF estimate for VAV GTA + SP reset.

    User supplies AHU/chiller field data (LBNL ADR Tool 'Option-2' inputs); no DB.
    """
    result = estimate_vav_gta_sp_reset(VavGtaSpResetInputs(**req.model_dump()))
    return VavGtaSpResetResponse(**asdict(result))


@router.get("/matrix", response_model=list[SimResultRow])
async def matrix(
    building_type: str = Query(...),
    vintage: str | None = Query(None),
    climate_zone: str | None = Query(None),
    conn: asyncpg.Connection = Depends(get_db),
) -> list[SimResultRow]:
    rows = await svc.sim_matrix(conn, building_type, vintage, climate_zone)
    return [SimResultRow(**r) for r in rows]
