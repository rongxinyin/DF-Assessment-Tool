"""seed reference vocab + DF strategy taxonomy

Seeds the small lookup tables (baseline_types, baseline_adjustment, user_status)
and the full DF strategy taxonomy from seeds/df_strategies.py
(docs/DF_STRATEGIES.md). Idempotent-ish: reruns after downgrade.

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-15
"""
import sqlalchemy as sa
from alembic import op

from seeds.df_strategies import CATEGORIES, STRATEGIES, pg_text_array

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    # baseline methods (matches legacy DR v4 vocabulary)
    bind.execute(
        sa.text("INSERT INTO baseline_types (baseline_type_id, description) VALUES "
                "(1, 'X/Y baseline'), (2, 'X day OAT regression')")
    )
    bind.execute(
        sa.text("INSERT INTO baseline_adjustment "
                "(baseline_adjustment_id, baseline_adjustment_description) VALUES "
                "(1, 'Morning Adjustment'), (2, 'Day-of Adjustment')")
    )
    bind.execute(
        sa.text("INSERT INTO user_status (status_id, status_description, password_reset) VALUES "
                "(1, 'Active', false), (2, 'Disabled', false), (3, 'Password Reset', true)")
    )

    # strategy categories
    for cat_id, code, name, sector, legacy_id in CATEGORIES:
        bind.execute(
            sa.text("INSERT INTO strategy_category "
                    "(category_id, code, name, sector, legacy_id) "
                    "VALUES (:id, :code, :name, :sector, :legacy)"),
            {"id": cat_id, "code": code, "name": name, "sector": sector, "legacy": legacy_id},
        )

    # strategies + response levels
    from seeds.df_strategies import CATEGORY_ID_BY_CODE

    for s in STRATEGIES:
        bind.execute(
            sa.text(
                "INSERT INTO df_strategy "
                "(strategy_id, strategy_code, name, category_id, sub_category, "
                " response_speed, flex_categories, grid_services) "
                "VALUES (:id, :code, :name, :cat, :sub, :speed, "
                "        CAST(:flex AS text[]), CAST(:grid AS text[]))"
            ),
            {
                "id": s["id"], "code": s["code"], "name": s["name"],
                "cat": CATEGORY_ID_BY_CODE[s["category"]], "sub": s["sub_category"],
                "speed": s.get("speed"),
                "flex": pg_text_array(s["flex"]), "grid": pg_text_array(s["grid"]),
            },
        )
        for level, value, unit in s["levels"]:
            bind.execute(
                sa.text("INSERT INTO df_strategy_level "
                        "(strategy_id, level, setting_value, unit) "
                        "VALUES (:id, :level, :value, :unit)"),
                {"id": s["id"], "level": level, "value": value, "unit": unit},
            )


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(sa.text("DELETE FROM df_strategy_level"))
    bind.execute(sa.text("DELETE FROM df_strategy"))
    bind.execute(sa.text("DELETE FROM strategy_category"))
    bind.execute(sa.text("DELETE FROM user_status"))
    bind.execute(sa.text("DELETE FROM baseline_adjustment"))
    bind.execute(sa.text("DELETE FROM baseline_types"))
