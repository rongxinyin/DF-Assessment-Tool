"""DF Toolkit API (FastAPI).

Wires the asyncpg pool lifecycle, CORS, and routers. Run from backend/:
    uvicorn app.main:app --reload
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import db
from routers import benchmarking, performance, potential, reference


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()


app = FastAPI(title="DF Toolkit API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(potential.router, prefix="/api")
app.include_router(performance.router, prefix="/api")
app.include_router(benchmarking.router, prefix="/api")
app.include_router(reference.router, prefix="/api")


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}
