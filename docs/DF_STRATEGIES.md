# DF Strategy Taxonomy — canonical name / id / category

Authoritative, synchronized list of demand-flexibility control strategies used across the
toolkit (potential estimator, field analyses, site tagging, benchmarking). Source of
truth: `reference/DF Strategy Table.xlsx` — sheet **`Sheet12`** (Strategy Ids) enriched by
**`Collaboration-Full-DR-Measures`** (GEB load-flexibility) and **`Topic 8-ListofDR-V3`**
(grid services). This replaces the thin legacy `dr_strategies` (5 end-use rows). ETL loads
this table into `df_strategy` / `strategy_category` / `df_strategy_level` (see
`DATA_MODEL.md §1b`).

## Category dimensions

- **End-use category** (drives the id prefix): `Building Envelope` (BE),
  `HVAC Systems` (HVAC-A air side, HVAC-C CAV), `HVAC Plant` (HVAC-P), `Lighting` (LTG),
  `Water Heater – Electric` (WH), `Water Heater – Heat Pump` (HPWH), `MELs / Plug` (MEL).
- **GEB load-flexibility** (the DF "category", multi-valued): `Efficiency`, `Shed`,
  `Shift` — extensible to `Modulate`, `Generate` for future strategies.
- **Grid service** (multi-valued): `Peak Capacity Management`, `Spinning and Non-spinning
  Reserve`, `Frequency Regulation`.
- **Response level**: `Low(1)` / `Medium(2)` / `High(3)`, each a setting value + unit
  (also encodes event duration for some strategies).

## Canonical strategies

| id (`strategy_code`) | Strategy name | End-use category | Sub-category | GEB flex | Low / Med / High |
|---|---|---|---|---|---|
| BE-A1 | Passive thermal mass storage (pre-cool, early HVAC start) | Building Envelope | Ext/Int wall & thermal mass | Efficiency; Shift; Shed | 2h / 4h / 6h |
| BE-A2 | Active thermal mass storage (pre-cool, PCM) | Building Envelope | Ext/Int wall & thermal mass | Efficiency; Shift; Shed | 2ºF / 4ºF / 6ºF |
| BE-A3 | Night flushing / economizer (pre-cool) | Building Envelope | Ext/Int wall & thermal mass | Efficiency | N/A |
| BE-B1 | Blind control (reduce cooling load) | Building Envelope | Smart Windows | Efficiency; Shed | N/A |
| BE-B2 | Electrochromic window thermal control | Building Envelope | Smart Windows | Efficiency; Shed | N/A |
| HVAC-A1 | Global temperature adjustment — cooling (raise zone setpoint) | HVAC Systems | VAV | Shift; Shed | 2ºF / 4ºF / 6ºF |
| HVAC-A2 | Global temperature adjustment — heating (lower zone setpoint) | HVAC Systems | VAV | Shift; Shed | 2ºF / 3ºF / 4ºF |
| HVAC-A3 | Duct static pressure decrease (1.5"→1.0") | HVAC Systems | VAV | Shed | 1.4" / 1.2" / 1.0" |
| HVAC-A4 | Supply air temperature increase (55→65 ºF) | HVAC Systems | VAV | Efficiency; Shed | 2ºF / 6ºF / 10ºF |
| HVAC-A5 | Limit AHU cooling valve position (→70%) | HVAC Systems | VAV | Shed | 0.9 / 0.8 / 0.7 |
| HVAC-A6 | Limit VFD fan/pump speed (→70%) | HVAC Systems | VAV | Shed | 0.9 / 0.8 / 0.7 |
| HVAC-C1 | Supply air temperature increase (55→65 ºF) | HVAC Systems | CAV | Efficiency; Shed | N/A |
| HVAC-C2 | Lock cooling valve position at AHU | HVAC Systems | CAV | Shed | 0.9 / 0.8 / 0.7 |
| HVAC-P1 | Chilled water temperature reset (+5 ºF) | HVAC Plant | Water/Air-Cooled Chiller | Efficiency; Shed | 2ºF / 4ºF / 6ºF |
| HVAC-P2 | Chiller demand limit (50–90%) | HVAC Plant | Water/Air-Cooled Chiller | Shed | 0.9 / 0.7 / 0.5 |
| HVAC-P3 | Cycle RTU compressors (30/50/100%) | HVAC Plant | Packaged RTU | Shed | 0.3 / 0.5 / 1.0 |
| HVAC-P4 | Shut off 1/3–1/2 of multiple chillers | HVAC Plant | Partial TES system | Shift; Shed | N/A / 1/3 / 1/2 |
| LTG-A1 | Dimming control (continuous/step 20–60%) | Lighting | Interior Lighting | Efficiency; Shed | 0.2 / 0.4 / 0.6 |
| LTG-A2 | Switch on/off (interior) | Lighting | Interior Lighting | Efficiency; Shed | on/off |
| LTG-A3 | Switch on/off (task lighting) | Lighting | Task lighting | Efficiency; Shed | on/off |
| WH-A1 | Setpoint decrease (electric WH) | Water Heater – Electric | Electric | Shift; Shed | 5ºF / 10ºF / 15ºF |
| WH-A2 | Setpoint decrease, extended (electric WH) | Water Heater – Electric | Electric | Shift; Shed | 5ºF / 10ºF / 15ºF |
| WH-A3 | Switch on/off (electric WH) | Water Heater – Electric | Electric | Shed | on/off |
| HPWH-A1 | Setpoint decrease (heat-pump WH) | Water Heater – Heat Pump | Heat pump | Shift; Shed | 5ºF / 10ºF / 15ºF |
| HPWH-A2 | Reduce deadband to 1 ºF (heat-pump WH) | Water Heater – Heat Pump | Heat pump | Shed | 1ºF |
| HPWH-A3 | Limit heat-pump duty cycling (0–100%) | Water Heater – Heat Pump | Heat pump | Shed | 0.3 / 0.2 / 0.1 |
| MEL-A1 | Standby / non-critical plug-load reduction | MELs / Plug | Non-critical process loads | Shed | on/off |

## Crosswalk from legacy & other sources

**Legacy `dr_strategies`** (end-use only) → new end-use category:
| Legacy id | Legacy description | Maps to end-use category |
|---|---|---|
| 1 | HVAC | HVAC Systems + HVAC Plant (HVAC-*) |
| 2 | Lighting | Lighting (LTG-*) |
| 3 | Plug | MELs / Plug (MEL-*) |
| 4 | Industrial Process | *(out of commercial scope; retain code)* |
| 5 | Agricultural Pumping | *(out of commercial scope; retain code)* |

Legacy integer ids are preserved as `strategy_category.legacy_id` for back-reference;
existing `dr_strategy_links` / `sites.strategy_id` are re-pointed to `df_strategy` during ETL.

**Simulation / field vocabulary** (`data_used_paper`, sim CSVs):
| Source term | Canonical strategy |
|---|---|
| GTA / "Global Temperature Adjustment" | **HVAC-A1** (cooling) |
| Pre-cooling (passive thermal mass) | **BE-A1** |
| Set-point reset | **HVAC-A1** (reset magnitude = response level) |
| LBNL ADR Tool "Duty Cycle" (RTU, 15/20/30 min off/hr, compressor-only or whole unit) | **HVAC-P3** |
| `site-summary-update.csv` `dr_strategy_implemented_*`, `measure_code` | matched to `strategy_code` by ETL lookup |

Notes: `10/10_CBL`, `OAT_MA_CBL`, etc. are **baseline methods**, not DF strategies — see
`DATA_MODEL.md §4` / `LEGACY_DB_REVIEW.md`, not this table.
