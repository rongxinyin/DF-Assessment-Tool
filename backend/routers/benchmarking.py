"""Benchmarking endpoints: cohort stats (benchmark_cohort view) and event
scatter points, over the Tier B curated dataset. See docs/API_SPEC.md."""

from __future__ import annotations

import asyncpg
from fastapi import APIRouter, Depends, Query

from app.db import get_db
from schemas.benchmarking import CohortRow, ScatterPoint

router = APIRouter(prefix="/benchmarking", tags=["benchmarking"])


@router.get("/cohorts", response_model=list[CohortRow])
async def cohorts(
    bldg_type: str | None = Query(None),
    climate_zone: str | None = Query(None),
    vintage: str | None = Query(None),
    min_n: int = Query(3, ge=1, description="hide cohorts smaller than this"),
    conn: asyncpg.Connection = Depends(get_db),
) -> list[CohortRow]:
    rows = await conn.fetch(
        """
        SELECT bt.description AS bldg_type, c.vintage_code,
               cz.climate_zone_description AS climate_zone, c.size_bucket,
               c.n::int AS n, c.shed_wft2_mean, c.shed_wft2_p25, c.shed_wft2_median,
               c.shed_wft2_p75, c.shed_wft2_p90, c.pdi_wft2_mean
        FROM benchmark_cohort c
        LEFT JOIN building_types bt ON bt.bldg_type_id = c.bldg_type_id
        LEFT JOIN climate_zone cz ON cz.climate_zone_id = c.climate_zone_id
        WHERE c.n >= $1
          AND ($2::text IS NULL OR bt.description = $2)
          AND ($3::text IS NULL OR cz.climate_zone_description = $3)
          AND ($4::text IS NULL OR c.vintage_code = $4)
        ORDER BY c.n DESC
        """,
        min_n, bldg_type, climate_zone, vintage,
    )
    return [CohortRow(**dict(r)) for r in rows]


@router.get("/scatter", response_model=list[ScatterPoint])
async def scatter(
    bldg_type: str | None = Query(None),
    climate_zone: str | None = Query(None),
    data_source: str | None = Query(None),
    limit: int = Query(3000, le=10000),
    conn: asyncpg.Connection = Depends(get_db),
) -> list[ScatterPoint]:
    rows = await conn.fetch(
        """
        SELECT s.site_code, bt.description AS bldg_type,
               cz.climate_zone_description AS climate_zone, p.data_source,
               coalesce(p.peak_oat_f, p.max_oat_f, p.event_avg_oat_f) AS oat_f,
               p.shed_avg_wft2
        FROM dr_event_performance p
        JOIN sites s ON s.site_id = p.site_id
        LEFT JOIN building_types bt ON bt.bldg_type_id = s.bldg_type_id
        LEFT JOIN climate_zone cz ON cz.climate_zone_id = s.climate_zone
        WHERE p.shed_avg_wft2 IS NOT NULL
          AND ($1::text IS NULL OR bt.description = $1)
          AND ($2::text IS NULL OR cz.climate_zone_description = $2)
          AND ($3::text IS NULL OR p.data_source = $3)
        ORDER BY p.event_date DESC
        LIMIT $4
        """,
        bldg_type, climate_zone, data_source, limit,
    )
    return [ScatterPoint(**dict(r)) for r in rows]
