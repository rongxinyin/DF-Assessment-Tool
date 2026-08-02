"""DF potential estimator.

Two layers:
  * pure math — `PiecewiseEquation` evaluates the OAT-segmented linear model
    (y = alpha*OAT + beta), independently unit-testable;
  * async data access — fetch equations / measures / sim_result aggregates from
    `potential_equation` and `sim_result`.

Model source: reference/df-estimation/*-Equations.csv (see docs/DF_STRATEGIES.md,
docs/DATA_MODEL.md §5). GTA strategy -> HVAC-A1.
"""

from __future__ import annotations

from dataclasses import dataclass

import asyncpg


@dataclass(frozen=True)
class PiecewiseEquation:
    """OAT-segmented linear DR-potential model. Segments are (alpha, beta)."""

    seg1: tuple[float, float]      # OAT <= oat_break_low
    seg2: tuple[float, float]      # oat_break_low < OAT <= oat_break_high
    seg3: tuple[float, float]      # OAT > oat_break_high
    oat_break_low: float = 75.0
    oat_break_high: float = 95.0

    def evaluate(self, oat_f: float) -> float:
        if oat_f <= self.oat_break_low:
            alpha, beta = self.seg1
        elif oat_f <= self.oat_break_high:
            alpha, beta = self.seg2
        else:
            alpha, beta = self.seg3
        return alpha * oat_f + beta


def _equation_from_row(row: asyncpg.Record) -> PiecewiseEquation:
    return PiecewiseEquation(
        seg1=(float(row["seg1_alpha"]), float(row["seg1_beta"])),
        seg2=(float(row["seg2_alpha"]), float(row["seg2_beta"])),
        seg3=(float(row["seg3_alpha"]), float(row["seg3_beta"])),
        oat_break_low=float(row["oat_break_low"]),
        oat_break_high=float(row["oat_break_high"]),
    )


# ── data access ───────────────────────────────────────────────────────────
async def list_measures(conn: asyncpg.Connection, building_type: str) -> list[dict]:
    """Distinct GTA measures (with precool/reset and available hours) for a type."""
    rows = await conn.fetch(
        """
        SELECT pe.measure_id, pe.precool_deg, pe.reset_deg,
               array_agg(DISTINCT pe.event_hour ORDER BY pe.event_hour) AS event_hours
        FROM potential_equation pe
        JOIN building_types bt ON bt.bldg_type_id = pe.bldg_type_id
        WHERE bt.description = $1
        GROUP BY pe.measure_id, pe.precool_deg, pe.reset_deg
        ORDER BY pe.precool_deg, pe.reset_deg, pe.measure_id
        """,
        building_type,
    )
    return [dict(r) for r in rows]


async def fetch_equation(
    conn: asyncpg.Connection,
    building_type: str,
    measure_id: str,
    event_hour: int,
    output_unit: str,
    precool_deg: float | None = None,
    reset_deg: float | None = None,
) -> asyncpg.Record | None:
    return await conn.fetchrow(
        """
        SELECT pe.*
        FROM potential_equation pe
        JOIN building_types bt ON bt.bldg_type_id = pe.bldg_type_id
        WHERE bt.description = $1 AND pe.measure_id = $2
          AND pe.event_hour = $3 AND pe.output_unit = $4
          AND ($5::numeric IS NULL OR pe.precool_deg = $5)
          AND ($6::numeric IS NULL OR pe.reset_deg = $6)
        LIMIT 1
        """,
        building_type, measure_id, event_hour, output_unit, precool_deg, reset_deg,
    )


async def estimate(
    conn: asyncpg.Connection,
    building_type: str,
    measure_id: str,
    event_hour: int,
    oat_f: float,
    output_unit: str = "wft2",
    precool_deg: float | None = None,
    reset_deg: float | None = None,
) -> dict | None:
    row = await fetch_equation(
        conn, building_type, measure_id, event_hour, output_unit, precool_deg, reset_deg
    )
    if row is None:
        return None
    eq = _equation_from_row(row)
    return {
        "building_type": building_type,
        "measure_id": measure_id,
        "precool_deg": float(row["precool_deg"]),
        "reset_deg": float(row["reset_deg"]),
        "event_hour": event_hour,
        "output_unit": output_unit,
        "oat_f": oat_f,
        "value": eq.evaluate(oat_f),
    }


async def curve(
    conn: asyncpg.Connection,
    building_type: str,
    measure_id: str,
    event_hour: int,
    output_unit: str = "wft2",
    oat_min: float = 60.0,
    oat_max: float = 110.0,
    step: float = 2.0,
    precool_deg: float | None = None,
    reset_deg: float | None = None,
) -> list[dict] | None:
    row = await fetch_equation(
        conn, building_type, measure_id, event_hour, output_unit, precool_deg, reset_deg
    )
    if row is None:
        return None
    eq = _equation_from_row(row)
    points, oat = [], oat_min
    while oat <= oat_max + 1e-9:
        points.append({"oat_f": round(oat, 2), "value": eq.evaluate(oat)})
        oat += step
    return points


# ── RTU duty cycling (strategy HVAC-P3) ───────────────────────────────────
def scale_duty_cycle(
    dr_pct_full: float, minutes_off_per_hour: float, meter_kw: float | None = None
) -> dict:
    """Scale a full-hour cycling DR% by the chosen duty cycle (workbook semantics:
    DR fraction = DR%/100 * minutes_off/60; DR kW = fraction * meter kW)."""
    dr_fraction = dr_pct_full / 100.0 * minutes_off_per_hour / 60.0
    return {
        "dr_pct_full_cycle": dr_pct_full,
        "dr_fraction": dr_fraction,
        "dr_kw": dr_fraction * meter_kw if meter_kw is not None else None,
    }


async def estimate_duty_cycle(
    conn: asyncpg.Connection,
    building_type: str,
    climate_zone: str,
    event_hour: int,
    oat_f: float,
    minutes_off_per_hour: float,
    compressor_only: bool = True,
    meter_kw: float | None = None,
) -> dict | None:
    row = await conn.fetchrow(
        """
        SELECT pe.*
        FROM potential_equation pe
        JOIN building_types bt ON bt.bldg_type_id = pe.bldg_type_id
        JOIN climate_zone cz ON cz.climate_zone_id = pe.climate_zone_id
        JOIN df_strategy s ON s.strategy_id = pe.strategy_id
        WHERE s.strategy_code = 'HVAC-P3'
          AND bt.description = $1 AND cz.climate_zone_description = $2
          AND pe.compressor_only = $3 AND pe.event_hour = $4
        LIMIT 1
        """,
        building_type, climate_zone, compressor_only, event_hour,
    )
    if row is None:
        return None
    eq = _equation_from_row(row)
    result = scale_duty_cycle(eq.evaluate(oat_f), minutes_off_per_hour, meter_kw)
    return {
        "building_type": building_type,
        "climate_zone": climate_zone,
        "measure_id": row["measure_id"],
        "compressor_only": compressor_only,
        "event_hour": event_hour,
        "oat_f": oat_f,
        "minutes_off_per_hour": minutes_off_per_hour,
        **result,
    }


async def sim_matrix(
    conn: asyncpg.Connection,
    building_type: str,
    vintage: str | None = None,
    climate_zone: str | None = None,
) -> list[dict]:
    """Aggregate `sim_result` rows (DDI/DII/kW-shed/net-kWh) for a building type."""
    rows = await conn.fetch(
        """
        SELECT bt.description AS building_type, sr.vintage_code,
               cz.climate_zone_description AS climate_zone,
               sr.gta_level_f, sr.highest_gta_scenario,
               sr.ddi_gta_only_wft2, sr.ddi_precool_adj_wft2,
               sr.kw_shed_per_10k_sf, sr.pct_shed_of_baseline, sr.dii,
               sr.precool_kwh_change_pct, sr.net_kwh_increase_pct, sr.optmax_gta_f
        FROM sim_result sr
        JOIN building_types bt ON bt.bldg_type_id = sr.bldg_type_id
        LEFT JOIN climate_zone cz ON cz.climate_zone_id = sr.climate_zone_id
        WHERE bt.description = $1
          AND ($2::text IS NULL OR sr.vintage_code = $2)
          AND ($3::text IS NULL OR cz.climate_zone_description = $3)
        ORDER BY sr.vintage_code, cz.climate_zone_description
        """,
        building_type, vintage, climate_zone,
    )
    return [dict(r) for r in rows]
