"""Reference dimensions for filter dropdowns (docs/API_SPEC.md — /reference)."""

from __future__ import annotations

import asyncpg
from fastapi import APIRouter, Depends

from app.db import get_db

router = APIRouter(prefix="/reference", tags=["reference"])


@router.get("/building-types")
async def building_types(conn: asyncpg.Connection = Depends(get_db)) -> list[dict]:
    rows = await conn.fetch(
        """SELECT bt.bldg_type_id, bt.description, g.bldg_type_group_description AS "group"
           FROM building_types bt
           LEFT JOIN building_type_group g ON g.bldg_type_group_id = bt.bldg_type_group_id
           ORDER BY bt.description""")
    return [dict(r) for r in rows]


@router.get("/climate-zones")
async def climate_zones(conn: asyncpg.Connection = Depends(get_db)) -> list[dict]:
    rows = await conn.fetch(
        "SELECT climate_zone_id, climate_zone_description FROM climate_zone "
        "ORDER BY climate_zone_description")
    return [dict(r) for r in rows]


@router.get("/vintages")
async def vintages(conn: asyncpg.Connection = Depends(get_db)) -> list[dict]:
    rows = await conn.fetch("SELECT code FROM vintage ORDER BY code")
    return [dict(r) for r in rows]


@router.get("/data-sources")
async def data_sources(conn: asyncpg.Connection = Depends(get_db)) -> list[dict]:
    rows = await conn.fetch(
        "SELECT DISTINCT data_source FROM dr_event_performance "
        "WHERE data_source IS NOT NULL ORDER BY data_source")
    return [dict(r) for r in rows]
