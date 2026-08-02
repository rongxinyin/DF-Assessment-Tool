"""Phase 1a ETL — DF potential summary metrics.

Loads reference/data_used_paper/simulation-results.csv -> sim_result.
(The estimation model lives in potential_equation; see load_estimation_equations.py.
Raw Simulated-*Office-*-GTA.csv shed curves are intentionally not loaded.)

Dimensions (building_types, vintage, climate_zone) are get-or-created.

Usage:
  python -m scripts.etl.load_potential            # load into DB
  python -m scripts.etl.load_potential --dry-run  # parse + report, no DB
"""

from __future__ import annotations

import argparse
import csv

from ._common import (
    REFERENCE_DIR,
    get_conn,
    get_or_create_building_type,
    get_or_create_climate_zone,
    get_or_create_vintage,
    num,
)

PAPER_DIR = REFERENCE_DIR / "data_used_paper"

# simulation-results.csv column name -> sim_result field (numeric unless in TEXT_FIELDS).
SIM_RESULT_COLMAP = {
    "GTA level increase (F)": "gta_level_f",
    "Highest GTA Level": "highest_gta_scenario",  # text
    "GTA only DDI (W/sf)": "ddi_gta_only_wft2",
    "Adj GTA with Pre-cooling DDI (W/sf)": "ddi_precool_adj_wft2",
    "delta DDI (W/sf)": "delta_ddi_wft2",
    "DDI increase (%)": "ddi_increase_pct",
    "kW shed per 10,000 sf [GTA-only] (kW)": "kw_shed_per_10k_sf",
    "kW shed increase per 10,000 sf (kW)": "kw_shed_increase_per_10k",
    "% of shed improvement in baseline demand (%)": "pct_shed_of_baseline",
    "DII (take)": "dii",
    "Pre-cooling kWh change (%)": "precool_kwh_change_pct",
    "Net kWh increase (%)": "net_kwh_increase_pct",
    "OpTmax GTA (F)": "optmax_gta_f",
}
TEXT_FIELDS = {"highest_gta_scenario"}


def parse_sim_results() -> list[dict]:
    """Parse simulation-results.csv into per-row dicts (dimensions as raw strings)."""
    path = PAPER_DIR / "simulation-results.csv"
    with path.open(newline="") as f:
        reader = csv.reader(f)
        header = next(reader)
        idx = {}
        for name in ["Building Type", "Vintage", "Climate", *SIM_RESULT_COLMAP]:
            if name in header:
                idx[name] = header.index(name)  # first occurrence (handles dup headers)
        rows = []
        for raw in reader:
            if not raw or not raw[idx["Building Type"]].strip():
                continue
            rec = {
                "building_type": raw[idx["Building Type"]].strip(),
                "vintage": raw[idx["Vintage"]].strip(),
                "climate": raw[idx["Climate"]].strip(),
            }
            for name, field in SIM_RESULT_COLMAP.items():
                if name not in idx:
                    continue
                val = raw[idx[name]]
                rec[field] = val.strip() if field in TEXT_FIELDS else num(val)
            rows.append(rec)
    return rows


def load(dry_run: bool = False) -> None:
    sim_results = parse_sim_results()

    print(f"parsed sim_result rows: {len(sim_results)}")
    print("  building types:", sorted({r['building_type'] for r in sim_results}))
    print("  vintages:      ", sorted({r['vintage'] for r in sim_results}))
    print("  climates:      ", sorted({r['climate'] for r in sim_results}))
    if sim_results:
        print("  sample:", {k: sim_results[0][k] for k in
              ('building_type', 'vintage', 'climate', 'highest_gta_scenario',
               'ddi_gta_only_wft2', 'kw_shed_per_10k_sf', 'dii')})

    if dry_run:
        print("dry-run: no database writes.")
        return

    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute("DELETE FROM sim_result")  # derived table: full reload
            dim_cache: dict = {}

            def dims(rec):
                key = (rec["building_type"], rec["vintage"], rec["climate"])
                if key not in dim_cache:
                    bt = get_or_create_building_type(cur, rec["building_type"])
                    get_or_create_vintage(cur, rec["vintage"])
                    cz = get_or_create_climate_zone(cur, rec["climate"])
                    dim_cache[key] = (bt, rec["vintage"], cz)
                return dim_cache[key]

            for r in sim_results:
                bt, vintage, cz = dims(r)
                cur.execute(
                    """INSERT INTO sim_result
                       (bldg_type_id, vintage_code, climate_zone_id,
                        gta_level_f, highest_gta_scenario, ddi_gta_only_wft2,
                        ddi_precool_adj_wft2, delta_ddi_wft2, ddi_increase_pct,
                        kw_shed_per_10k_sf, kw_shed_increase_per_10k, pct_shed_of_baseline,
                        dii, precool_kwh_change_pct, net_kwh_increase_pct, optmax_gta_f)
                       VALUES (%(bt)s,%(vintage)s,%(cz)s,
                        %(gta_level_f)s,%(highest_gta_scenario)s,%(ddi_gta_only_wft2)s,
                        %(ddi_precool_adj_wft2)s,%(delta_ddi_wft2)s,%(ddi_increase_pct)s,
                        %(kw_shed_per_10k_sf)s,%(kw_shed_increase_per_10k)s,%(pct_shed_of_baseline)s,
                        %(dii)s,%(precool_kwh_change_pct)s,%(net_kwh_increase_pct)s,%(optmax_gta_f)s)""",
                    {**{"bt": bt, "vintage": vintage, "cz": cz},
                     **{k: r.get(k) for k in SIM_RESULT_COLMAP.values()}},
                )
        print(f"loaded {len(sim_results)} sim_result rows.")
    finally:
        conn.close()


def main() -> None:
    ap = argparse.ArgumentParser(description="Load DF potential simulation summary.")
    ap.add_argument("--dry-run", action="store_true", help="parse and report, no DB writes")
    load(dry_run=ap.parse_args().dry_run)


if __name__ == "__main__":
    main()
