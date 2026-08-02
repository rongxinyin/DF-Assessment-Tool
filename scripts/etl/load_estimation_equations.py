"""Phase 1a ETL — DF potential estimation equations.

Loads the piecewise-linear GTA regression parameters from the df-estimation-tool
(reference/df-estimation/*-Equations.csv) into potential_equation. Each CSV row is a
(measure, precool, reset, event_hour) with 3 OAT segments (alpha/beta 1..3), in one of
two output units:
    *-PCT-Equations.csv   -> output_unit 'pct'  (DR potential %)
    *-Wft2-Equations.csv  -> output_unit 'wft2' (shed W/ft2)

The simulation strategy is Global Temperature Adjustment (cooling) -> HVAC-A1.

Usage:
  python -m scripts.etl.load_estimation_equations            # load into DB
  python -m scripts.etl.load_estimation_equations --dry-run  # parse + report, no DB
"""

from __future__ import annotations

import argparse
import csv
import sys

from ._common import (
    GTA_STRATEGY_CODE,
    REFERENCE_DIR,
    get_conn,
    get_or_create_building_type,
    num,
    strategy_id_by_code,
)

EQ_DIR = REFERENCE_DIR / "df-estimation"

# (filename, building_type, output_unit). Note upstream spelling 'Ofice'.
EQUATION_FILES = [
    ("SmallOffice-Wft2-Equations.csv", "SmallOffice", "wft2"),
    ("SmallOfice-PCT-Equations.csv", "SmallOffice", "pct"),
    ("MediumOfice-Wft2-Equations.csv", "MediumOffice", "wft2"),
    ("MediumOfice-PCT-Equations.csv", "MediumOffice", "pct"),
]


def parse_equations() -> list[dict]:
    rows = []
    for filename, bldg_type, unit in EQUATION_FILES:
        path = EQ_DIR / filename
        if not path.exists():
            sys.exit(f"missing equation file: {path}")
        with path.open(newline="") as f:
            for r in csv.DictReader(f):
                rows.append({
                    "building_type": bldg_type,
                    "output_unit": unit,
                    "measure_id": (r.get("measureId") or "").strip(),
                    "precool_deg": num(r.get("precool")),
                    "reset_deg": num(r.get("reset")),
                    "event_hour": int(num(r.get("event_hour")) or 0),
                    "seg1_alpha": num(r.get("alpha_1")), "seg1_beta": num(r.get("beta_1")),
                    "seg2_alpha": num(r.get("alpha_2")), "seg2_beta": num(r.get("beta_2")),
                    "seg3_alpha": num(r.get("alpha_3")), "seg3_beta": num(r.get("beta_3")),
                })
    return rows


def load(dry_run: bool = False) -> None:
    eqs = parse_equations()
    units = sorted({e["output_unit"] for e in eqs})
    types = sorted({e["building_type"] for e in eqs})
    measures = sorted({e["measure_id"] for e in eqs})
    print(f"parsed potential_equation rows: {len(eqs)}")
    print(f"  building types: {types}")
    print(f"  output units:   {units}")
    print(f"  measures ({len(measures)}): {measures[:3]} ...")
    print(f"  event hours:    {sorted({e['event_hour'] for e in eqs})}")
    if eqs:
        s = eqs[0]
        print("  sample:", {k: s[k] for k in
              ('building_type', 'output_unit', 'measure_id', 'precool_deg',
               'reset_deg', 'event_hour', 'seg1_alpha', 'seg1_beta', 'seg2_alpha')})

    if dry_run:
        print("dry-run: no database writes.")
        return

    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            strategy_id = strategy_id_by_code(cur, GTA_STRATEGY_CODE)
            if strategy_id is None:
                sys.exit(f"strategy {GTA_STRATEGY_CODE} not seeded — run alembic upgrade head")

            cur.execute("DELETE FROM potential_equation")  # derived table: full reload
            bt_cache: dict = {}
            for e in eqs:
                bt = bt_cache.get(e["building_type"])
                if bt is None:
                    bt = get_or_create_building_type(cur, e["building_type"])
                    bt_cache[e["building_type"]] = bt
                cur.execute(
                    """INSERT INTO potential_equation
                       (bldg_type_id, strategy_id, measure_id, precool_deg, reset_deg,
                        event_hour, output_unit,
                        seg1_alpha, seg1_beta, seg2_alpha, seg2_beta, seg3_alpha, seg3_beta)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (bt, strategy_id, e["measure_id"], e["precool_deg"], e["reset_deg"],
                     e["event_hour"], e["output_unit"],
                     e["seg1_alpha"], e["seg1_beta"], e["seg2_alpha"], e["seg2_beta"],
                     e["seg3_alpha"], e["seg3_beta"]),
                )
        print(f"loaded {len(eqs)} potential_equation rows.")
    finally:
        conn.close()


def main() -> None:
    ap = argparse.ArgumentParser(description="Load DF potential estimation equations.")
    ap.add_argument("--dry-run", action="store_true", help="parse and report, no DB writes")
    load(dry_run=ap.parse_args().dry_run)


if __name__ == "__main__":
    main()
