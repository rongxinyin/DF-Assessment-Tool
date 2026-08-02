"""Phase 1b ETL — Tier B post-processed DR event performance.

Loads into dr_event_performance (docs/DATA_MODEL.md §6):
  reference/retail-bldg-data/batch3_field_metrics_baseline_regression.csv
  reference/retail-bldg-data/batch4_field_metrics_baseline_regression.csv
  reference/data_used_paper/site-dr-data-update.csv

Sites are matched by site_code (retail T-codes) or site_name (paper); paper sites
absent from site-summary get a minimal stub row so their events still land.
Run AFTER load_sites.

Baseline-code taxonomy (DATA_MODEL §6): 'X/Y…' -> type 1 with x/y; 'OAT…' -> type 2;
'_MA' -> Morning Adjustment; anything else keeps the raw code with type NULL.

Usage:
  python -m scripts.etl.load_event_performance [--dry-run]
"""

from __future__ import annotations

import argparse
import csv
import re
from datetime import datetime

from ._common import REFERENCE_DIR, get_conn, num

RETAIL_DIR = REFERENCE_DIR / "retail-bldg-data"
PAPER_DIR = REFERENCE_DIR / "data_used_paper"

XY_RE = re.compile(r"^(\d+)/(\d+)")

INSERT_SQL = """
INSERT INTO dr_event_performance
  (site_id, data_source, event_seq, event_date, shed_start, shed_end, program,
   baseline_code, baseline_type_id, baseline_x, baseline_y, baseline_adjustment_id,
   peak_oat_f, event_avg_oat_f, max_oat_f, kw_max, kw_avg, kw_min,
   peak_demand_intensity_wft2, shed_avg_wft2, wft2_max, wft2_avg, wft2_min,
   wbp_pct_max, wbp_pct_avg, wbp_pct_min, source_citation)
VALUES (%(site_id)s, %(data_source)s, %(event_seq)s, %(event_date)s, %(shed_start)s,
        %(shed_end)s, %(program)s, %(baseline_code)s, %(baseline_type_id)s,
        %(baseline_x)s, %(baseline_y)s, %(baseline_adjustment_id)s,
        %(peak_oat_f)s, %(event_avg_oat_f)s, %(max_oat_f)s, %(kw_max)s, %(kw_avg)s,
        %(kw_min)s, %(peak_demand_intensity_wft2)s, %(shed_avg_wft2)s, %(wft2_max)s,
        %(wft2_avg)s, %(wft2_min)s, %(wbp_pct_max)s, %(wbp_pct_avg)s, %(wbp_pct_min)s,
        %(source_citation)s)
ON CONFLICT DO NOTHING
"""

EMPTY = {
    "event_seq": None, "program": None, "baseline_x": None, "baseline_y": None,
    "baseline_type_id": None, "baseline_adjustment_id": None,
    "peak_oat_f": None, "event_avg_oat_f": None, "max_oat_f": None,
    "kw_max": None, "kw_avg": None, "kw_min": None,
    "peak_demand_intensity_wft2": None, "shed_avg_wft2": None,
    "wft2_max": None, "wft2_avg": None, "wft2_min": None,
    "wbp_pct_max": None, "wbp_pct_avg": None, "wbp_pct_min": None,
    "source_citation": None,
}


def parse_baseline_code(code: str | None) -> dict:
    """Map a raw baseline code onto the legacy engine vocabulary."""
    out = {"baseline_code": (code or "").strip() or None,
           "baseline_type_id": None, "baseline_x": None, "baseline_y": None,
           "baseline_adjustment_id": None}
    c = out["baseline_code"]
    if not c:
        return out
    m = XY_RE.match(c)
    if m:
        out["baseline_type_id"] = 1                      # X/Y baseline
        out["baseline_x"], out["baseline_y"] = int(m.group(1)), int(m.group(2))
    elif "OAT" in c.upper() or c.lower() == "regression":
        out["baseline_type_id"] = 2                      # OAT regression
    if "_MA" in c.upper():
        out["baseline_adjustment_id"] = 1                # Morning Adjustment
    return out


def _dt(s: str | None) -> datetime | None:
    if not s or not s.strip():
        return None
    s = s.strip()
    for fmt in ("%m/%d/%Y %H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%m/%d/%y %H:%M"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def _date(s: str | None):
    d = _dt(f"{s} 00:00") if s and "/" in (s or "") else None
    if d:
        return d.date()
    try:
        return datetime.strptime((s or "").strip(), "%Y-%m-%d").date()
    except ValueError:
        return None


def _read(path, encoding="utf-8-sig") -> list[dict]:
    with open(path, encoding=encoding, newline="") as f:
        return list(csv.DictReader(f))


def parse_retail_metrics() -> list[dict]:
    """batch3/batch4 field metrics: 'event_id' column holds the site T-code;
    baseline is the regression method by construction."""
    rows = []
    for fname, source in [("batch3_field_metrics_baseline_regression.csv", "batch3"),
                          ("batch4_field_metrics_baseline_regression.csv", "batch4")]:
        for i, r in enumerate(_read(RETAIL_DIR / fname)):
            site_code = (r.get("event_id") or "").strip()
            event_date = _date(r.get("event_date"))
            if not site_code or event_date is None:
                continue
            rows.append({**EMPTY,
                "site_key": ("code", site_code),
                "data_source": source,
                "event_seq": i,
                "event_date": event_date,
                "shed_start": _dt(r.get("shed_start_time")),
                "shed_end": _dt(r.get("shed_end_time")),
                **parse_baseline_code("regression"),
                "peak_oat_f": num(r.get("peak_oat")),
                "event_avg_oat_f": num(r.get("event_avg_oat")),
                "peak_demand_intensity_wft2": num(r.get("peak_demand_intensity_wft2")),
                "shed_avg_wft2": num(r.get("shed_avg_wft2")),
            })
    return rows


def parse_paper_events() -> list[dict]:
    """site-dr-data-update.csv: one row per site x event window x baseline method."""
    rows = []
    for i, r in enumerate(_read(PAPER_DIR / "site-dr-data-update.csv", encoding="latin-1")):
        site_name = (r.get("site_name") or "").strip()
        event_date = _date(r.get("DR-Event-Day"))
        if not site_name or event_date is None:
            continue
        start = _dt(f"{r.get('DR-Event-Day')} {r.get('DR-StartTime')}".strip())
        end = _dt(f"{r.get('DR-Event-Day')} {r.get('DR-EndTime')}".strip())
        rows.append({**EMPTY,
            "site_key": ("name", site_name),
            "data_source": "paper:site-dr-data",
            "event_seq": i,
            "event_date": event_date,
            "shed_start": start,
            "shed_end": end,
            "program": (r.get("DR-Program") or "").strip() or None,
            **parse_baseline_code(r.get("Baseline")),
            "max_oat_f": num(r.get("max_oat")),
            "kw_max": num(r.get("kW_Max")), "kw_avg": num(r.get("kW_Ave")),
            "kw_min": num(r.get("kW_Min")),
            "wbp_pct_max": num(r.get("WBP%_Max")), "wbp_pct_avg": num(r.get("WBP%_Avg")),
            "wbp_pct_min": num(r.get("WBP%_Min")),
            "wft2_max": num(r.get("W/ft2_Max")), "wft2_avg": num(r.get("W/ft2_Avg")),
            "wft2_min": num(r.get("W/ft2_Min")),
            "shed_avg_wft2": num(r.get("W/ft2_Avg")),
            "source_citation": (r.get("source") or "").strip() or None,
        })
    return rows


def load(dry_run: bool = False) -> None:
    events = parse_retail_metrics() + parse_paper_events()
    by_src: dict[str, int] = {}
    typed = 0
    for e in events:
        by_src[e["data_source"]] = by_src.get(e["data_source"], 0) + 1
        typed += e["baseline_type_id"] is not None
    print(f"parsed events: {len(events)}  by source: {by_src}")
    print(f"  with mapped baseline type: {typed} "
          f"({typed/len(events)*100:.0f}%); rest keep raw code only")
    codes = {}
    for e in events:
        codes[e["baseline_code"]] = codes.get(e["baseline_code"], 0) + 1
    print("  baseline codes:", dict(sorted(codes.items(), key=lambda kv: -kv[1])[:8]))

    if dry_run:
        print("dry-run: no database writes.")
        return

    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            # resolve sites; create stubs for paper sites missing from site-summary
            cur.execute("SELECT site_id, site_code, site_name FROM sites")
            by_code, by_name = {}, {}
            for sid, code, name in cur.fetchall():
                if code:
                    by_code[code] = sid
                if name:
                    by_name[name] = sid

            def site_id_for(key: tuple[str, str]) -> int | None:
                kind, val = key
                if kind == "code":
                    return by_code.get(val)
                sid = by_name.get(val)
                if sid is None:  # stub site so the event still lands
                    cur.execute(
                        "INSERT INTO sites (site_code, site_name, sector, data_source) "
                        "VALUES (%s,%s,'commercial','paper-stub') "
                        "ON CONFLICT (site_code) DO UPDATE SET site_name = EXCLUDED.site_name "
                        "RETURNING site_id",
                        (f"N:{val[:60]}", val),
                    )
                    sid = cur.fetchone()[0]
                    by_name[val] = sid
                return sid

            sources = sorted({e["data_source"] for e in events})
            cur.execute("DELETE FROM dr_event_performance WHERE data_source = ANY(%s)", (sources,))

            inserted = skipped = 0
            for e in events:
                sid = site_id_for(e.pop("site_key"))
                if sid is None:
                    skipped += 1
                    continue
                cur.execute(INSERT_SQL, {**e, "site_id": sid})
                inserted += cur.rowcount
        print(f"loaded {inserted} events ({skipped} skipped: unknown site).")
    finally:
        conn.close()


def main() -> None:
    ap = argparse.ArgumentParser(description="Load Tier B post-processed DR event performance.")
    ap.add_argument("--dry-run", action="store_true")
    load(dry_run=ap.parse_args().dry_run)


if __name__ == "__main__":
    main()
