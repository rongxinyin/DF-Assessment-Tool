"""
Canonical DF strategy taxonomy — single source of truth for seeding.

Mirrors docs/DF_STRATEGIES.md (derived from reference/DF Strategy Table.xlsx).
Used by migration 0002 to seed strategy_category / df_strategy / df_strategy_level.
Keep this file and docs/DF_STRATEGIES.md in sync.

Level values are stored as strings (they mix units); `unit` names the dimension:
  degF | inWC | fraction | hours | None (for on/off or N/A).
"""

from __future__ import annotations

# (category_id, code, name, sector, legacy_id)
# legacy_id back-references the legacy dr_strategies.strategy_id it subsumes.
CATEGORIES: list[tuple[int, str, str, str, int | None]] = [
    (1, "BE", "Building Envelope", "both", None),
    (2, "HVAC", "HVAC Systems", "both", 1),
    (3, "HVAC-P", "HVAC Plant", "both", 1),
    (4, "LTG", "Lighting", "both", 2),
    (5, "WH", "Water Heater - Electric", "both", None),
    (6, "HPWH", "Water Heater - Heat Pump", "both", None),
    (7, "MEL", "MELs / Plug", "both", 3),
    # Retained for legacy link continuity; out of commercial scope.
    (8, "IND", "Industrial Process", "industrial", 4),
    (9, "AG", "Agricultural Pumping", "agricultural", 5),
]

CATEGORY_ID_BY_CODE = {c[1]: c[0] for c in CATEGORIES}

# Each strategy: dict with
#   id, code, name, category (code), sub_category, flex (list),
#   grid (list), speed, levels: list of (level, value, unit)
STRATEGIES: list[dict] = [
    {
        "id": 1, "code": "BE-A1", "category": "BE",
        "name": "Passive thermal mass storage (pre-cool, early HVAC start)",
        "sub_category": "Exterior/Interior Wall & Thermal Mass",
        "flex": ["Efficiency", "Shift", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "2", "hours"), ("medium", "4", "hours"), ("high", "6", "hours")],
    },
    {
        "id": 2, "code": "BE-A2", "category": "BE",
        "name": "Active thermal mass storage (pre-cool, phase-change material)",
        "sub_category": "Exterior/Interior Wall & Thermal Mass",
        "flex": ["Efficiency", "Shift", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "2", "degF"), ("medium", "4", "degF"), ("high", "6", "degF")],
    },
    {
        "id": 3, "code": "BE-A3", "category": "BE",
        "name": "Night flushing / economizer (pre-cool)",
        "sub_category": "Exterior/Interior Wall & Thermal Mass",
        "flex": ["Efficiency"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes", "levels": [],
    },
    {
        "id": 4, "code": "BE-B1", "category": "BE",
        "name": "Blind control (reduce cooling load)",
        "sub_category": "Smart Windows",
        "flex": ["Efficiency", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes", "levels": [],
    },
    {
        "id": 5, "code": "BE-B2", "category": "BE",
        "name": "Electrochromic window thermal control",
        "sub_category": "Smart Windows",
        "flex": ["Efficiency", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes", "levels": [],
    },
    {
        "id": 6, "code": "HVAC-A1", "category": "HVAC",
        "name": "Global temperature adjustment - cooling (raise zone setpoint)",
        "sub_category": "VAV",
        "flex": ["Shift", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "2", "degF"), ("medium", "4", "degF"), ("high", "6", "degF")],
    },
    {
        "id": 7, "code": "HVAC-A2", "category": "HVAC",
        "name": "Global temperature adjustment - heating (lower zone setpoint)",
        "sub_category": "VAV",
        "flex": ["Shift", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "2", "degF"), ("medium", "3", "degF"), ("high", "4", "degF")],
    },
    {
        "id": 8, "code": "HVAC-A3", "category": "HVAC",
        "name": "Duct static pressure decrease (1.5\" to 1.0\")",
        "sub_category": "VAV",
        "flex": ["Shed"],
        "grid": ["Peak Capacity Management", "Spinning and Non-spinning Reserve"],
        "speed": "~5 minutes",
        "levels": [("low", "1.4", "inWC"), ("medium", "1.2", "inWC"), ("high", "1.0", "inWC")],
    },
    {
        "id": 9, "code": "HVAC-A4", "category": "HVAC",
        "name": "Supply air temperature increase (55 to 65 degF)",
        "sub_category": "VAV",
        "flex": ["Efficiency", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~5 minutes",
        "levels": [("low", "2", "degF"), ("medium", "6", "degF"), ("high", "10", "degF")],
    },
    {
        "id": 10, "code": "HVAC-A5", "category": "HVAC",
        "name": "Limit AHU cooling valve position (to 70%)",
        "sub_category": "VAV",
        "flex": ["Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "0.9", "fraction"), ("medium", "0.8", "fraction"), ("high", "0.7", "fraction")],
    },
    {
        "id": 11, "code": "HVAC-A6", "category": "HVAC",
        "name": "Limit VFD fan/pump speed (to 70%)",
        "sub_category": "VAV",
        "flex": ["Shed"],
        "grid": ["Peak Capacity Management", "Spinning and Non-spinning Reserve"],
        "speed": "Seconds",
        "levels": [("low", "0.9", "fraction"), ("medium", "0.8", "fraction"), ("high", "0.7", "fraction")],
    },
    {
        "id": 12, "code": "HVAC-C1", "category": "HVAC",
        "name": "Supply air temperature increase (55 to 65 degF)",
        "sub_category": "CAV",
        "flex": ["Efficiency", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~5 minutes", "levels": [],
    },
    {
        "id": 13, "code": "HVAC-C2", "category": "HVAC",
        "name": "Lock cooling valve position at the AHU",
        "sub_category": "CAV",
        "flex": ["Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "0.9", "fraction"), ("medium", "0.8", "fraction"), ("high", "0.7", "fraction")],
    },
    {
        "id": 14, "code": "HVAC-P1", "category": "HVAC-P",
        "name": "Chilled water temperature reset (increase 5 degF)",
        "sub_category": "Water/Air-Cooled Chiller",
        "flex": ["Efficiency", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "2", "degF"), ("medium", "4", "degF"), ("high", "6", "degF")],
    },
    {
        "id": 15, "code": "HVAC-P2", "category": "HVAC-P",
        "name": "Chiller demand limit (50-90%)",
        "sub_category": "Water/Air-Cooled Chiller",
        "flex": ["Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "0.9", "fraction"), ("medium", "0.7", "fraction"), ("high", "0.5", "fraction")],
    },
    {
        "id": 16, "code": "HVAC-P3", "category": "HVAC-P",
        "name": "Cycle on/off RTU compressors (30/50/100%)",
        "sub_category": "Packaged RTU",
        "flex": ["Shed"],
        "grid": ["Peak Capacity Management", "Spinning and Non-spinning Reserve"],
        "speed": "~5 minutes",
        "levels": [("low", "0.3", "fraction"), ("medium", "0.5", "fraction"), ("high", "1.0", "fraction")],
    },
    {
        "id": 17, "code": "HVAC-P4", "category": "HVAC-P",
        "name": "Shut off 1/3 to 1/2 of multiple chillers",
        "sub_category": "Partial TES System",
        "flex": ["Shift", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("medium", "1/3", "fraction"), ("high", "1/2", "fraction")],
    },
    {
        "id": 18, "code": "LTG-A1", "category": "LTG",
        "name": "Dimming control (continuous/step 20-60%)",
        "sub_category": "Interior Lighting",
        "flex": ["Efficiency", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "Seconds",
        "levels": [("low", "0.2", "fraction"), ("medium", "0.4", "fraction"), ("high", "0.6", "fraction")],
    },
    {
        "id": 19, "code": "LTG-A2", "category": "LTG",
        "name": "Switch on/off (interior lighting)",
        "sub_category": "Interior Lighting",
        "flex": ["Efficiency", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "Seconds", "levels": [("high", "on/off", None)],
    },
    {
        "id": 20, "code": "LTG-A3", "category": "LTG",
        "name": "Switch on/off (task lighting)",
        "sub_category": "Task Lighting",
        "flex": ["Efficiency", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "Seconds", "levels": [("high", "on/off", None)],
    },
    {
        "id": 21, "code": "WH-A1", "category": "WH",
        "name": "Setpoint adjustment - decrease water temperature",
        "sub_category": "Electric",
        "flex": ["Shift", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "5", "degF"), ("medium", "10", "degF"), ("high", "15", "degF")],
    },
    {
        "id": 22, "code": "WH-A2", "category": "WH",
        "name": "Setpoint adjustment - decrease water temperature (extended)",
        "sub_category": "Electric",
        "flex": ["Shift", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "5", "degF"), ("medium", "10", "degF"), ("high", "15", "degF")],
    },
    {
        "id": 23, "code": "WH-A3", "category": "WH",
        "name": "Switch on/off (electric water heater)",
        "sub_category": "Electric",
        "flex": ["Shed"], "grid": ["Peak Capacity Management"],
        "speed": "Seconds", "levels": [("high", "on/off", None)],
    },
    {
        "id": 24, "code": "HPWH-A1", "category": "HPWH",
        "name": "Setpoint adjustment - decrease water temperature",
        "sub_category": "Heat Pump",
        "flex": ["Shift", "Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "5", "degF"), ("medium", "10", "degF"), ("high", "15", "degF")],
    },
    {
        "id": 25, "code": "HPWH-A2", "category": "HPWH",
        "name": "Reduce deadband for heat pump to 1 degF",
        "sub_category": "Heat Pump",
        "flex": ["Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes", "levels": [("high", "1", "degF")],
    },
    {
        "id": 26, "code": "HPWH-A3", "category": "HPWH",
        "name": "Limit heat-pump duty cycling (0-100%)",
        "sub_category": "Heat Pump",
        "flex": ["Shed"], "grid": ["Peak Capacity Management"],
        "speed": "~15 minutes",
        "levels": [("low", "0.3", "fraction"), ("medium", "0.2", "fraction"), ("high", "0.1", "fraction")],
    },
    {
        "id": 27, "code": "MEL-A1", "category": "MEL",
        "name": "Standby / non-critical plug-load reduction",
        "sub_category": "Non-critical Process Loads",
        "flex": ["Shed"], "grid": ["Peak Capacity Management"],
        "speed": "Seconds", "levels": [("high", "on/off", None)],
    },
]


def pg_text_array(items: list[str]) -> str:
    """Render a Python str list as a PostgreSQL text[] literal, e.g. {"Shed","Shift"}."""
    if not items:
        return "{}"
    escaped = [i.replace("\\", "\\\\").replace('"', '\\"') for i in items]
    return "{" + ",".join(f'"{e}"' for e in escaped) + "}"
