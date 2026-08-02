"""Shed metrics from actual vs baseline over a DR event window.

Definitions follow the field/benchmarking datasets (docs/DATA_MODEL.md §6):
shed = baseline − actual; intensities normalized by floor area (W/ft²).
"""

from __future__ import annotations

import pandas as pd


def shed_metrics(
    actual: pd.Series,
    baseline: pd.Series,
    area_ft2: float | None = None,
) -> dict:
    """Event-window shed summary. Both series must cover the same timestamps."""
    common = actual.index.intersection(baseline.index)
    a, b = actual.loc[common].dropna(), baseline.loc[common].dropna()
    common = a.index.intersection(b.index)
    a, b = a.loc[common], b.loc[common]
    if not len(common):
        return {"n_points": 0}

    shed = b - a
    out = {
        "n_points": int(len(common)),
        "baseline_avg_kw": float(b.mean()),
        "actual_avg_kw": float(a.mean()),
        "shed_avg_kw": float(shed.mean()),
        "shed_max_kw": float(shed.max()),
        "shed_pct_of_baseline": float(shed.mean() / b.mean() * 100) if b.mean() else None,
    }
    if area_ft2:
        # kW -> W/ft²
        out["shed_avg_wft2"] = out["shed_avg_kw"] * 1000.0 / area_ft2
        out["peak_demand_intensity_wft2"] = float(a.max()) * 1000.0 / area_ft2
    return out
