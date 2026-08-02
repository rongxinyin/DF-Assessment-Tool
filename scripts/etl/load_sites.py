"""Phase 1b ETL — sites (retail batch3/batch4 metadata + paper site summaries).

Loads:
  reference/retail-bldg-data/sites_batch3_no_pv.csv          -> sites (data_source 'batch3')
  reference/retail-bldg-data/Batch4_sites_w_complete_data.csv-> sites (data_source 'batch4')
  reference/data_used_paper/site-summary-update.csv          -> sites (data_source 'paper')

Idempotent: upsert by site_code (retail T-codes; paper sites get 'P<id>' codes).
Vintage is derived from year_built (pre-1980 / 1980-2004 / post-2004).

Usage:
  python -m scripts.etl.load_sites [--dry-run]
"""

from __future__ import annotations

import argparse
import csv
from datetime import datetime

from ._common import (
    REFERENCE_DIR,
    get_conn,
    get_or_create_building_type,
    get_or_create_climate_zone,
    get_or_create_vintage,
    num,
)

RETAIL_DIR = REFERENCE_DIR / "retail-bldg-data"
PAPER_DIR = REFERENCE_DIR / "data_used_paper"

# psycopg2 named-placeholder upsert, keyed by site_code.
FIELDS = [
    "site_code", "site_name", "bldg_type_id", "climate_zone", "vintage_code",
    "year_built", "year_renovated", "zip", "city", "state",
    "building_size_ft2", "hvac_type", "baseline_model", "data_source",
]
UPSERT_SQL = (
    "INSERT INTO sites (sector, " + ", ".join(FIELDS) + ") VALUES ('commercial', "
    + ", ".join(f"%({f})s" for f in FIELDS) + ") ON CONFLICT (site_code) DO UPDATE SET "
    + ", ".join(f"{f} = EXCLUDED.{f}" for f in FIELDS if f != "site_code")
)


def vintage_from_year(year: int | None) -> str | None:
    if year is None:
        return None
    if year < 1980:
        return "pre-1980"
    if year <= 2004:
        return "1980-2004"
    return "post-2004"


def _year(datestr: str | None) -> int | None:
    """Year from 'M/D/YYYY'-style strings."""
    if not datestr or not datestr.strip():
        return None
    for fmt in ("%m/%d/%Y", "%m/%d/%y", "%Y-%m-%d"):
        try:
            return datetime.strptime(datestr.strip(), fmt).year
        except ValueError:
            continue
    return None


def _int(x) -> int | None:
    v = num(x)
    return int(v) if v is not None else None


def _read(path, encoding="utf-8-sig") -> list[dict]:
    with open(path, encoding=encoding, newline="") as f:
        return list(csv.DictReader(f))


def parse_retail() -> list[dict]:
    out = []
    b3 = _read(RETAIL_DIR / "sites_batch3_no_pv.csv")
    for r in b3:
        out.append({
            "site_code": r["site_id"].strip(),
            "site_name": r["site_id"].strip(),
            "building_type": "Retail",
            "climate": (r["doe_climate_zone"] or "").strip() or None,
            "year_built": _year(r.get("milestone_grand_open_date")),
            "year_renovated": _year(r.get("last_remodel_date")),
            "zip": _int(r.get("mail_postal_code")),
            "city": (r.get("mail_city") or "").strip() or None,
            "state": (r.get("mail_region") or "").strip() or None,
            "building_size_ft2": num(r.get("total_building_area")),
            "hvac_type": "RTU",
            "baseline_model": "regression",
            "data_source": "batch3",
        })
    b4 = _read(RETAIL_DIR / "Batch4_sites_w_complete_data.csv")
    for r in b4:
        out.append({
            "site_code": r["location_format_short_name"].strip(),
            "site_name": r["location_format_short_name"].strip(),
            "building_type": "Retail",
            "climate": (r.get("DOE Climate Zone") or "").strip() or None,
            "year_built": _year(r.get("milestone_grand_open_date")),
            "year_renovated": _year(r.get("last_remodel_date")),
            "zip": _int(r.get("mail_postal_code")),
            "city": (r.get("mail_city") or "").strip() or None,
            "state": (r.get("mail_region") or "").strip() or None,
            "building_size_ft2": num(r.get("total_building_area")),
            "hvac_type": "RTU",
            "baseline_model": "regression",
            "data_source": "batch4",
        })
    return out


def parse_paper() -> list[dict]:
    out = []
    for r in _read(PAPER_DIR / "site-summary-update.csv", encoding="latin-1"):
        cz = (r.get("ASHRAE_CZ") or "").strip()
        out.append({
            "site_code": f"P{r['site_id'].strip()}",
            "site_name": (r.get("site_name") or "").strip(),
            "building_type": (r.get("bldg_type") or "Office").strip() or "Office",
            "climate": cz if cz and not cz.startswith("#") else None,
            "year_built": _int(r.get("year_built")),
            "year_renovated": _int(r.get("year_renovated")),
            "zip": _int(r.get("zip_code")),
            "city": (r.get("city") or "").strip() or None,
            "state": (r.get("state") or "").strip() or None,
            "building_size_ft2": num(r.get("total_floor_area_ft2")),
            "hvac_type": (r.get("hvac_type") or "").strip() or None,
            "baseline_model": (r.get("baseline_model") or "").strip()[:200] or None,
            "data_source": "paper",
        })
    return out


def load(dry_run: bool = False) -> None:
    sites = parse_retail() + parse_paper()
    by_src: dict[str, int] = {}
    for s in sites:
        by_src[s["data_source"]] = by_src.get(s["data_source"], 0) + 1
    print(f"parsed sites: {len(sites)}  by source: {by_src}")
    print("  building types:", sorted({s['building_type'] for s in sites}))
    codes = [s["site_code"] for s in sites]
    dupes = {c for c in codes if codes.count(c) > 1}
    if dupes:
        print("  WARNING duplicate site codes:", sorted(dupes)[:10])
    print("  sample retail:", {k: sites[0][k] for k in
          ("site_code", "climate", "year_built", "building_size_ft2", "state")})
    paper0 = next(s for s in sites if s["data_source"] == "paper")
    print("  sample paper: ", {k: paper0[k] for k in
          ("site_code", "site_name", "building_type", "climate", "year_built")})

    if dry_run:
        print("dry-run: no database writes.")
        return

    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            for s in sites:
                params = dict(s)
                bt = params.pop("building_type")
                climate = params.pop("climate")
                params["bldg_type_id"] = get_or_create_building_type(cur, bt)
                params["climate_zone"] = get_or_create_climate_zone(cur, climate) if climate else None
                params["vintage_code"] = vintage_from_year(params["year_built"])
                if params["vintage_code"]:
                    get_or_create_vintage(cur, params["vintage_code"])
                cur.execute(UPSERT_SQL, params)
        print(f"upserted {len(sites)} sites.")
    finally:
        conn.close()


def main() -> None:
    ap = argparse.ArgumentParser(description="Load site metadata (batch3/batch4/paper).")
    ap.add_argument("--dry-run", action="store_true")
    load(dry_run=ap.parse_args().dry_run)


if __name__ == "__main__":
    main()
