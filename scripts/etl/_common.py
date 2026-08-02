"""Shared ETL helpers: DB connection, dimension get-or-create, strategy lookup.

Reads DB settings from env vars (DB_HOST/PORT/NAME/USER/PASSWORD) or DATABASE_URL,
matching backend/app/config.py and docker-compose.yml defaults.
"""

from __future__ import annotations

import os
from pathlib import Path

import psycopg2

REPO_ROOT = Path(__file__).resolve().parents[2]
REFERENCE_DIR = REPO_ROOT / "reference"

# Commercial building-type → group. All commercial sector for Phase 1a.
BUILDING_TYPE_GROUP = {
    "SmallOffice": "Office",
    "MediumOffice": "Office",
    "LargeOffice": "Office",
    "LargeHotel": "Hotel",
    "RetailStandalone": "Retail",
    "SecondarySchool": "School",
}

# Simulation strategy is Global Temperature Adjustment (cooling).
GTA_STRATEGY_CODE = "HVAC-A1"
# RTU duty cycling maps to 'Cycle on/off RTU compressors'.
RTU_CYCLE_STRATEGY_CODE = "HVAC-P3"


def _load_dotenv() -> None:
    env = REPO_ROOT / "backend" / ".env"
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())


def get_conn():
    _load_dotenv()
    url = os.getenv("DATABASE_URL")
    if url:
        # accept sqlalchemy-style prefix
        url = url.replace("postgresql+psycopg2://", "postgresql://")
        return psycopg2.connect(url)
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "df_toolkit"),
        user=os.getenv("DB_USER", "df"),
        password=os.getenv("DB_PASSWORD", "df"),
    )


# ── dimension get-or-create (idempotent) ──────────────────────────────────
def get_or_create_climate_zone(cur, description: str) -> int:
    cur.execute(
        "SELECT climate_zone_id FROM climate_zone WHERE climate_zone_description = %s",
        (description,),
    )
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        "INSERT INTO climate_zone (climate_zone_description) VALUES (%s) "
        "RETURNING climate_zone_id",
        (description,),
    )
    return cur.fetchone()[0]


def get_or_create_vintage(cur, code: str) -> str:
    cur.execute("INSERT INTO vintage (code) VALUES (%s) ON CONFLICT (code) DO NOTHING", (code,))
    return code


def _get_or_create_group(cur, name: str, sector: str = "commercial") -> int:
    cur.execute(
        "SELECT bldg_type_group_id FROM building_type_group "
        "WHERE bldg_type_group_description = %s",
        (name,),
    )
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        "INSERT INTO building_type_group (bldg_type_group_description, sector) "
        "VALUES (%s, %s) RETURNING bldg_type_group_id",
        (name, sector),
    )
    return cur.fetchone()[0]


def get_or_create_building_type(cur, description: str) -> int:
    cur.execute("SELECT bldg_type_id FROM building_types WHERE description = %s", (description,))
    row = cur.fetchone()
    if row:
        return row[0]
    group = BUILDING_TYPE_GROUP.get(description, "Other")
    group_id = _get_or_create_group(cur, group)
    cur.execute(
        "INSERT INTO building_types (description, bldg_type_group_id) VALUES (%s, %s) "
        "RETURNING bldg_type_id",
        (description, group_id),
    )
    return cur.fetchone()[0]


def strategy_id_by_code(cur, code: str) -> int | None:
    cur.execute("SELECT strategy_id FROM df_strategy WHERE strategy_code = %s", (code,))
    row = cur.fetchone()
    return row[0] if row else None


def num(x):
    """Parse a CSV cell to float, or None if blank/non-numeric."""
    if x is None:
        return None
    x = str(x).strip()
    if x == "" or x.lower() in ("na", "n/a", "nan"):
        return None
    try:
        return float(x)
    except ValueError:
        return None
