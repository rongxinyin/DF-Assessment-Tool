"""Unit tests for the pure DF potential estimator (no DB needed).

Coefficients taken from reference/df-estimation/SmallOffice-Wft2-Equations.csv,
measure GTA-10-14-0-14-18-2-LTG-0, precool 0 / reset 2, event_hour 1.
"""

from analytics.potential import PiecewiseEquation

EQ = PiecewiseEquation(
    seg1=(0.010569396894295202, -0.4842187027411838),   # OAT <= 75
    seg2=(0.001405083918027155, 0.1891127789173186),    # 75 < OAT <= 95
    seg3=(0.001405083918027155, 0.1891127789173186),    # OAT > 95 (== seg2 here)
)


def test_low_segment():
    assert EQ.evaluate(70) == 0.010569396894295202 * 70 - 0.4842187027411838


def test_break_low_uses_seg1():
    # exactly at 75 uses seg1 (<=)
    assert EQ.evaluate(75) == 0.010569396894295202 * 75 - 0.4842187027411838


def test_mid_segment():
    assert EQ.evaluate(85) == 0.001405083918027155 * 85 + 0.1891127789173186


def test_break_high_boundary():
    # exactly at 95 uses seg2 (<=); just above uses seg3
    assert EQ.evaluate(95) == 0.001405083918027155 * 95 + 0.1891127789173186
    assert EQ.evaluate(100) == 0.001405083918027155 * 100 + 0.1891127789173186


def test_segments_are_discontinuous_at_break():
    # segments are fitted independently, so the model can jump down at OAT=75.
    below = EQ.evaluate(75)                       # seg1
    above = EQ.evaluate(75 + 1e-6)                # seg2
    assert below != above
