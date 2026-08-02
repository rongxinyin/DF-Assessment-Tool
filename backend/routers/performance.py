"""Field-performance endpoints: create a DR analysis, run the reused DR v4
baseline engine over interval data, and read back per-timestamp results.

Flow (docs/API_SPEC.md): POST /analyses -> POST /analyses/{id}/run ->
GET /analyses/{id}/results. Role gating arrives with the auth router.
"""

from __future__ import annotations

from datetime import datetime, timedelta

import asyncpg
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query

from analytics.baseline import (
    ExclusionRules,
    adjustment_ratio,
    apply_adjustment,
    oat_regression_baseline,
    x_of_y_baseline,
)
from analytics.metrics import shed_metrics
from app.db import get_db
from schemas.benchmarking import EventPage, EventRow, EventSummary
from schemas.performance import (
    ADJUSTMENT_IDS,
    AnalysisCreate,
    AnalysisOut,
    BASELINE_TYPE_IDS,
    ResultPoint,
    RunSummary,
)

router = APIRouter(prefix="/performance", tags=["performance"])

LOOKBACK_DAYS = 60  # interval-data buffer before the earliest DR date


@router.post("/analyses", response_model=AnalysisOut)
async def create_analysis(
    body: AnalysisCreate, conn: asyncpg.Connection = Depends(get_db)
) -> AnalysisOut:
    site = await conn.fetchrow("SELECT site_id FROM sites WHERE site_id = $1", body.site_id)
    if site is None:
        raise HTTPException(404, f"site {body.site_id} not found")

    async with conn.transaction():
        analysis_id: int = await conn.fetchval(
            """INSERT INTO dr_analysis
               (analysis_name, analysis_description, site_id, program_id, start_time, end_time)
               VALUES ($1,$2,$3,$4,$5,$6) RETURNING analysis_id""",
            body.analysis_name, body.analysis_description, body.site_id,
            body.program_id, body.start_time, body.end_time,
        )
        await conn.executemany(
            "INSERT INTO dr_analysis_dates (analysis_id, dr_date) VALUES ($1,$2)",
            [(analysis_id, d) for d in body.dr_dates],
        )
        ex = body.exclusions
        await conn.execute(
            """INSERT INTO dr_exclusions
               (analysis_id, ex_weekends, ex_weekdays, ex_holidays, ex_dr_days)
               VALUES ($1,$2,$3,$4,$5)""",
            analysis_id, ex.ex_weekends, ex.ex_weekdays, ex.ex_holidays, ex.ex_dr_days,
        )
        if ex.excluded_dates:
            await conn.executemany(
                "INSERT INTO dr_date_exclusions (analysis_id, dr_date) VALUES ($1,$2)",
                [(analysis_id, d) for d in ex.excluded_dates],
            )
        if body.station_id is not None:
            await conn.execute(
                "INSERT INTO dr_analysis_noaa_links (station_id, analysis_id) VALUES ($1,$2)",
                body.station_id, analysis_id,
            )
        baseline_ids: list[int] = []
        for spec in body.baselines:
            baseline_ids.append(await conn.fetchval(
                """INSERT INTO baselines
                   (analysis_id, baseline_type_id, param1, param2, adj_start_time,
                    adj_end_time, lower_cap_percentage, upper_cap_percentage,
                    baseline_adjustment_id)
                   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING baseline_id""",
                analysis_id, BASELINE_TYPE_IDS[spec.type], spec.param1, spec.param2,
                spec.adj_start, spec.adj_end, spec.lower_cap, spec.upper_cap,
                ADJUSTMENT_IDS.get(spec.adjustment),
            ))

    return AnalysisOut(
        analysis_id=analysis_id, analysis_name=body.analysis_name, site_id=body.site_id,
        start_time=body.start_time, end_time=body.end_time,
        dr_dates=body.dr_dates, baseline_ids=baseline_ids,
    )


async def _load_series(conn: asyncpg.Connection, analysis: asyncpg.Record) -> tuple[pd.Series, pd.Series | None]:
    """Interval load (and weather, if a station is linked) as pandas Series."""
    dr_dates = [r["dr_date"] for r in await conn.fetch(
        "SELECT dr_date FROM dr_analysis_dates WHERE analysis_id = $1", analysis["analysis_id"])]
    t0 = datetime.combine(min(dr_dates), datetime.min.time()) - timedelta(days=LOOKBACK_DAYS)
    t1 = datetime.combine(max(dr_dates), datetime.max.time())

    rows = await conn.fetch(
        "SELECT ts, kw FROM interval_load WHERE site_id = $1 AND ts BETWEEN $2 AND $3 ORDER BY ts",
        analysis["site_id"], t0, t1,
    )
    if not rows:
        raise HTTPException(422, "no interval load data for this site/date range")
    load = pd.Series([r["kw"] for r in rows],
                     index=pd.DatetimeIndex([r["ts"].replace(tzinfo=None) for r in rows]))

    station = await conn.fetchval(
        "SELECT station_id FROM dr_analysis_noaa_links WHERE analysis_id = $1",
        analysis["analysis_id"])
    oat = None
    if station is not None:
        wrows = await conn.fetch(
            "SELECT ts, oat_f FROM interval_weather WHERE station_id = $1 AND ts BETWEEN $2 AND $3 ORDER BY ts",
            station, t0, t1,
        )
        if wrows:
            oat = pd.Series([r["oat_f"] for r in wrows],
                            index=pd.DatetimeIndex([r["ts"].replace(tzinfo=None) for r in wrows]))
    return load, oat


@router.post("/analyses/{analysis_id}/run", response_model=list[RunSummary])
async def run_analysis(
    analysis_id: int, conn: asyncpg.Connection = Depends(get_db)
) -> list[RunSummary]:
    analysis = await conn.fetchrow(
        "SELECT * FROM dr_analysis WHERE analysis_id = $1", analysis_id)
    if analysis is None:
        raise HTTPException(404, "analysis not found")
    baselines = await conn.fetch("SELECT * FROM baselines WHERE analysis_id = $1", analysis_id)
    if not baselines:
        raise HTTPException(422, "analysis has no baselines configured")

    dr_dates = [r["dr_date"] for r in await conn.fetch(
        "SELECT dr_date FROM dr_analysis_dates WHERE analysis_id = $1 ORDER BY dr_date", analysis_id)]
    exclusions = await conn.fetchrow(
        "SELECT * FROM dr_exclusions WHERE analysis_id = $1", analysis_id)
    manual_excluded = {r["dr_date"] for r in await conn.fetch(
        "SELECT dr_date FROM dr_date_exclusions WHERE analysis_id = $1", analysis_id)}
    holidays = {r["holiday_date"] for r in await conn.fetch("SELECT holiday_date FROM holidays")}
    area = await conn.fetchval(
        "SELECT building_size_ft2 FROM sites WHERE site_id = $1", analysis["site_id"])

    excluded = set(manual_excluded)
    if exclusions is None or exclusions["ex_dr_days"]:
        excluded |= set(dr_dates)
    if exclusions is None or exclusions["ex_holidays"]:
        excluded |= holidays
    rules = ExclusionRules(
        exclude_weekends=exclusions["ex_weekends"] if exclusions else True,
        exclude_weekdays=exclusions["ex_weekdays"] if exclusions else False,
        excluded_dates=frozenset(excluded),
    )

    load, oat = await _load_series(conn, analysis)
    start_t, end_t = analysis["start_time"], analysis["end_time"]

    summaries: list[RunSummary] = []
    async with conn.transaction():
        result_id: int = await conn.fetchval(
            "INSERT INTO analysis_results (analysis_id, analysis_update_time) "
            "VALUES ($1, now()) RETURNING analysis_result_id", analysis_id)

        for b in baselines:
            await conn.execute("DELETE FROM analysis_results_data WHERE baseline_id = $1",
                               b["baseline_id"])
            for dr_date in dr_dates:
                tod = load.index.time
                day = pd.DatetimeIndex(load.index).normalize()
                mask = (day == pd.Timestamp(dr_date)) & (tod >= start_t) & (tod < end_t)
                event_ts = load.index[mask]
                if not len(event_ts):
                    continue

                if b["baseline_type_id"] == 2:  # OAT regression
                    if oat is None:
                        raise HTTPException(422, "OAT regression needs a linked weather station")
                    baseline = oat_regression_baseline(load, oat, event_ts, b["param1"], rules)
                else:  # X-of-Y
                    baseline = x_of_y_baseline(load, event_ts, b["param1"], b["param2"],
                                               start_t, end_t, rules)

                ratio = None
                if b["baseline_adjustment_id"] and b["adj_start_time"] and b["adj_end_time"]:
                    # predict over the adjustment window with the same method
                    adj_mask = (day == pd.Timestamp(dr_date)) & \
                               (tod >= b["adj_start_time"]) & (tod <= b["adj_end_time"])
                    adj_ts = load.index[adj_mask]
                    if len(adj_ts):
                        if b["baseline_type_id"] == 2:
                            adj_base = oat_regression_baseline(load, oat, adj_ts, b["param1"], rules)
                        else:
                            adj_base = x_of_y_baseline(load, adj_ts, b["param1"], b["param2"],
                                                       start_t, end_t, rules)
                        ratio = adjustment_ratio(
                            load.loc[adj_ts], adj_base,
                            b["adj_start_time"], b["adj_end_time"], dr_date,
                            b["lower_cap_percentage"], b["upper_cap_percentage"])
                        baseline = apply_adjustment(baseline, ratio)

                actual = load.loc[event_ts]
                temp = oat.reindex(event_ts) if oat is not None else pd.Series(index=event_ts, dtype=float)
                await conn.executemany(
                    """INSERT INTO analysis_results_data
                       (analysis_result_id, baseline_id, dr_date, time_stamp,
                        load_value, baseline_value, temperature)
                       VALUES ($1,$2,$3,$4,$5,$6,$7)""",
                    [(result_id, b["baseline_id"], dr_date, ts.to_pydatetime(),
                      float(actual.loc[ts]),
                      None if pd.isna(baseline.loc[ts]) else float(baseline.loc[ts]),
                      None if pd.isna(temp.loc[ts]) else float(temp.loc[ts]))
                     for ts in event_ts],
                )
                m = shed_metrics(actual, baseline, area_ft2=area)
                summaries.append(RunSummary(
                    baseline_id=b["baseline_id"], dr_date=dr_date,
                    adjustment_ratio=ratio, **m))
    return summaries


@router.get("/analyses/{analysis_id}/results", response_model=list[ResultPoint])
async def get_results(
    analysis_id: int, conn: asyncpg.Connection = Depends(get_db)
) -> list[ResultPoint]:
    rows = await conn.fetch(
        """SELECT d.baseline_id, d.dr_date, d.time_stamp, d.load_value,
                  d.baseline_value, d.temperature
           FROM analysis_results_data d
           JOIN baselines b ON b.baseline_id = d.baseline_id
           WHERE b.analysis_id = $1
           ORDER BY d.baseline_id, d.time_stamp""",
        analysis_id,
    )
    return [ResultPoint(**dict(r)) for r in rows]


_EVENT_FILTER = """
FROM dr_event_performance p
JOIN sites s ON s.site_id = p.site_id
LEFT JOIN building_types bt ON bt.bldg_type_id = s.bldg_type_id
LEFT JOIN climate_zone cz ON cz.climate_zone_id = s.climate_zone
LEFT JOIN baseline_types blt ON blt.baseline_type_id = p.baseline_type_id
WHERE ($1::text IS NULL OR bt.description = $1)
  AND ($2::text IS NULL OR cz.climate_zone_description = $2)
  AND ($3::text IS NULL OR p.data_source = $3)
  AND ($4::text IS NULL OR p.baseline_code = $4)
  AND ($5::text IS NULL OR s.site_code = $5)
"""


@router.get("/events", response_model=EventPage)
async def list_events(
    bldg_type: str | None = Query(None),
    climate_zone: str | None = Query(None),
    data_source: str | None = Query(None),
    baseline_code: str | None = Query(None),
    site_code: str | None = Query(None),
    limit: int = Query(50, le=500),
    offset: int = Query(0, ge=0),
    conn: asyncpg.Connection = Depends(get_db),
) -> EventPage:
    """Tier B curated post-processed DR events (docs/DATA_MODEL.md §6)."""
    args = [bldg_type, climate_zone, data_source, baseline_code, site_code]
    total = await conn.fetchval(f"SELECT count(*) {_EVENT_FILTER}", *args)
    rows = await conn.fetch(
        f"""SELECT p.id, s.site_code, s.site_name, bt.description AS bldg_type,
                   cz.climate_zone_description AS climate_zone, p.data_source,
                   p.event_date, p.shed_start, p.shed_end, p.program,
                   p.baseline_code, blt.description AS baseline_type,
                   p.peak_oat_f, p.event_avg_oat_f, p.max_oat_f, p.kw_avg,
                   p.peak_demand_intensity_wft2, p.shed_avg_wft2, p.wbp_pct_avg
            {_EVENT_FILTER}
            ORDER BY p.event_date DESC, p.id LIMIT $6 OFFSET $7""",
        *args, limit, offset,
    )
    return EventPage(items=[EventRow(**dict(r)) for r in rows], total=total)


@router.get("/events/summary", response_model=EventSummary)
async def events_summary(
    bldg_type: str | None = Query(None),
    climate_zone: str | None = Query(None),
    data_source: str | None = Query(None),
    baseline_code: str | None = Query(None),
    site_code: str | None = Query(None),
    conn: asyncpg.Connection = Depends(get_db),
) -> EventSummary:
    row = await conn.fetchrow(
        f"""SELECT count(*) AS n_events, count(DISTINCT p.site_id) AS n_sites,
                   avg(p.shed_avg_wft2) AS shed_avg_wft2_mean,
                   percentile_cont(0.5) WITHIN GROUP (ORDER BY p.shed_avg_wft2)
                       AS shed_avg_wft2_median,
                   avg(p.peak_demand_intensity_wft2) AS pdi_wft2_mean
            {_EVENT_FILTER}""",
        bldg_type, climate_zone, data_source, baseline_code, site_code,
    )
    return EventSummary(**dict(row))


@router.get("/analyses", response_model=list[AnalysisOut])
async def list_analyses(conn: asyncpg.Connection = Depends(get_db)) -> list[AnalysisOut]:
    rows = await conn.fetch(
        """SELECT a.analysis_id, a.analysis_name, a.site_id, a.start_time, a.end_time,
                  coalesce(array_agg(DISTINCT ad.dr_date) FILTER (WHERE ad.dr_date IS NOT NULL), '{}') AS dr_dates,
                  coalesce(array_agg(DISTINCT b.baseline_id) FILTER (WHERE b.baseline_id IS NOT NULL), '{}') AS baseline_ids
           FROM dr_analysis a
           LEFT JOIN dr_analysis_dates ad ON ad.analysis_id = a.analysis_id
           LEFT JOIN baselines b ON b.analysis_id = a.analysis_id
           GROUP BY a.analysis_id ORDER BY a.analysis_id DESC""")
    return [AnalysisOut(**dict(r)) for r in rows]
