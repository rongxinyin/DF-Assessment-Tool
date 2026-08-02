# DF Toolkit — Backend (Phase 0)

FastAPI + PostgreSQL/TimescaleDB backend. Phase 0 delivers the **database schema
migration** and the **reference/strategy seed**. See `../docs/` for the design.

## Layout
```
backend/
├── app/config.py         DB settings (env / .env)
├── migrations/           Alembic (env.py, versions/)
│   └── versions/
│       ├── 0001_initial_schema.py            synchronized schema (docs/DATA_MODEL.md)
│       └── 0002_seed_reference_and_strategies.py
├── seeds/df_strategies.py  canonical 27-strategy taxonomy (docs/DF_STRATEGIES.md)
├── alembic.ini
└── requirements.txt
```

## Run

```bash
# 1. Start TimescaleDB (from repo root)
docker compose up -d db

# 2. Python env
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # defaults match docker-compose

# 3. Apply migrations (schema + seed)
alembic upgrade head

# rollback:  alembic downgrade base
```

## Verify the seed
```bash
psql postgresql://df:df@localhost:5432/df_toolkit -c \
  "SELECT c.code AS category, count(*) FROM df_strategy s
     JOIN strategy_category c ON c.category_id = s.category_id
     GROUP BY c.code ORDER BY c.code;"
# expect 27 strategies across BE/HVAC/HVAC-P/LTG/WH/HPWH/MEL
```

## Notes
- Migrations are hand-written raw SQL for fidelity to the legacy DR v4 dump and to
  handle TimescaleDB hypertables / arrays / views (no ORM autogenerate).
- `baseline_types` / `baseline_adjustment` reuse the legacy DR v4 vocabulary; the
  `oat_regression` / `x_over_y_baseline` algorithms are ported in Phase 1b
  (`backend/analytics/`).
- `benchmark_cohort` is a plain view in Phase 0; promote to a materialized view in
  Phase 1c.
