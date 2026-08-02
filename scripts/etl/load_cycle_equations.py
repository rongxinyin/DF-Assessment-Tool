"""Phase 1a ETL — RTU duty-cycling estimation equations (basic regression path).

Extracts the CZ*CycleOnOff tables from the LBNL ADR Tool V2.1 workbook
('LoadShed Database' sheet, named ranges CZ03/CZ04/CZ12/CZ13 CycleOnOff) into
potential_equation, strategy HVAC-P3 (Cycle on/off RTU compressors).

Equation semantics (from the workbook's 'Cycle Calculation' tab):
    DR%(full-hour cycling) = slope*OAT + intercept        (piecewise, breaks 75/95 F)
    DR fraction            = DR% / 100 * minutes_off / 60
    DR kW                  = DR fraction * meter kW
The stored equations are the full-hour DR% regressions (output_unit 'pct');
minutes_off scaling happens at evaluation time (analytics.potential).

Usage:
  python -m scripts.etl.load_cycle_equations            # load into DB
  python -m scripts.etl.load_cycle_equations --dry-run  # parse + report, no DB
"""

from __future__ import annotations

import argparse
import re
import sys

from ._common import (
    REFERENCE_DIR,
    RTU_CYCLE_STRATEGY_CODE,
    get_conn,
    get_or_create_building_type,
    get_or_create_climate_zone,
    num,
    strategy_id_by_code,
)

WORKBOOK = REFERENCE_DIR / "df-estimation-tool" / "LBNL ADR Tool Beta V2.1 (1) (1).xlsx"
SHEET = "LoadShed Database"

# named-range extents: CZ code -> (min_col, max_col), rows 107..136 (1-based)
CYCLE_RANGES = {
    "CZ03": (1, 10),    # A:J
    "CZ04": (11, 20),   # K:T
    "CZ12": (21, 30),   # U:AD
    "CZ13": (31, 40),   # AE:AN
}
MIN_ROW, MAX_ROW = 107, 136

# hour digit at the end is present in most (not all) case ids; hour is read from col 4
CASE_RE = re.compile(r"^(?P<btype>[A-Za-z]+?)CZ\d+Cycle(?P<comp>Yes|No)\d*$")


def parse_cycle_equations() -> list[dict]:
    import openpyxl  # local import: only needed for this loader

    if not WORKBOOK.exists():
        sys.exit(f"missing workbook: {WORKBOOK}")
    wb = openpyxl.load_workbook(WORKBOOK, data_only=True)
    ws = wb[SHEET]

    rows = []
    for cz, (c1, c2) in CYCLE_RANGES.items():
        for raw in ws.iter_rows(min_row=MIN_ROW, max_row=MAX_ROW,
                                min_col=c1, max_col=c2, values_only=True):
            case_id = str(raw[0]).strip() if raw[0] is not None else ""
            m = CASE_RE.match(case_id)
            if not m:  # section headers / 'Case ID' rows
                continue
            rows.append({
                "climate_zone": cz,
                "building_type": m.group("btype"),
                "measure_id": case_id,
                "compressor_only": m.group("comp") == "Yes",
                "event_hour": int(raw[3]),
                "seg1_alpha": num(raw[4]), "seg1_beta": num(raw[5]),
                "seg2_alpha": num(raw[6]), "seg2_beta": num(raw[7]),
                "seg3_alpha": num(raw[8]), "seg3_beta": num(raw[9]),
            })
    return rows


def load(dry_run: bool = False) -> None:
    eqs = parse_cycle_equations()
    print(f"parsed duty-cycle equation rows: {len(eqs)}")
    print("  climate zones: ", sorted({e['climate_zone'] for e in eqs}))
    print("  building types:", sorted({e['building_type'] for e in eqs}))
    print("  compressor_only:", sorted({e['compressor_only'] for e in eqs}))
    print("  event hours:   ", sorted({e['event_hour'] for e in eqs}))
    if eqs:
        s = eqs[0]
        print("  sample:", {k: s[k] for k in
              ('climate_zone', 'measure_id', 'compressor_only', 'event_hour',
               'seg1_alpha', 'seg1_beta', 'seg2_alpha', 'seg2_beta')})

    if dry_run:
        print("dry-run: no database writes.")
        return

    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            strategy_id = strategy_id_by_code(cur, RTU_CYCLE_STRATEGY_CODE)
            if strategy_id is None:
                sys.exit(f"strategy {RTU_CYCLE_STRATEGY_CODE} not seeded — run alembic upgrade head")

            # full reload of this strategy's equations only (GTA rows untouched)
            cur.execute("DELETE FROM potential_equation WHERE strategy_id = %s", (strategy_id,))
            bt_cache: dict = {}
            cz_cache: dict = {}
            for e in eqs:
                bt = bt_cache.get(e["building_type"])
                if bt is None:
                    bt = get_or_create_building_type(cur, e["building_type"])
                    bt_cache[e["building_type"]] = bt
                cz = cz_cache.get(e["climate_zone"])
                if cz is None:
                    cz = get_or_create_climate_zone(cur, e["climate_zone"])
                    cz_cache[e["climate_zone"]] = cz
                cur.execute(
                    """INSERT INTO potential_equation
                       (bldg_type_id, strategy_id, climate_zone_id, measure_id,
                        compressor_only, event_hour, output_unit,
                        seg1_alpha, seg1_beta, seg2_alpha, seg2_beta, seg3_alpha, seg3_beta)
                       VALUES (%s,%s,%s,%s,%s,%s,'pct',%s,%s,%s,%s,%s,%s)""",
                    (bt, strategy_id, cz, e["measure_id"], e["compressor_only"],
                     e["event_hour"],
                     e["seg1_alpha"], e["seg1_beta"], e["seg2_alpha"], e["seg2_beta"],
                     e["seg3_alpha"], e["seg3_beta"]),
                )
        print(f"loaded {len(eqs)} duty-cycle potential_equation rows.")
    finally:
        conn.close()


def main() -> None:
    ap = argparse.ArgumentParser(description="Load RTU duty-cycling estimation equations.")
    ap.add_argument("--dry-run", action="store_true", help="parse and report, no DB writes")
    load(dry_run=ap.parse_args().dry_run)


if __name__ == "__main__":
    main()
