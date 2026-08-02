"""asyncpg connection pool over the DF Toolkit database.

Created on FastAPI startup, closed on shutdown. `get_db` is a request-scoped
dependency yielding a pooled connection.
"""

from __future__ import annotations

from typing import AsyncIterator, Optional

import asyncpg

from .config import get_settings


class Database:
    def __init__(self) -> None:
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self) -> None:
        if self.pool is None:
            self.pool = await asyncpg.create_pool(
                dsn=get_settings().asyncpg_dsn, min_size=1, max_size=10
            )

    async def disconnect(self) -> None:
        if self.pool is not None:
            await self.pool.close()
            self.pool = None


db = Database()


async def get_db() -> AsyncIterator[asyncpg.Connection]:
    assert db.pool is not None, "DB pool not initialized"
    async with db.pool.acquire() as conn:
        yield conn
