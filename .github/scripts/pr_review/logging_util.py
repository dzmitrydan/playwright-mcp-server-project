"""Context-aware logging helpers for MCP tools."""

from __future__ import annotations

import functools
import inspect
import logging
import time
from typing import Any, Awaitable, Callable, TypeVar, cast

T = TypeVar("T")
_logger = logging.getLogger("pr-review")


def setup(name: str) -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    global _logger
    _logger = logging.getLogger(name)


class McpLogger:
    def __init__(self, ctx: Any) -> None:
        self.ctx = ctx

    async def info(self, message: str) -> None:
        _logger.info(message)
        if self.ctx is not None:
            await self.ctx.info(message)

    async def error(self, message: str) -> None:
        _logger.error(message)
        if self.ctx is not None:
            await self.ctx.error(message)

    async def span(self, name: str, operation: Callable[[], Awaitable[T]]) -> T:
        await self.info(f"→ {name}")
        try:
            result = await operation()
            if isinstance(result, dict) and result.get("error"):
                await self.error(f"✗ {name}: {result['error']}")
            else:
                await self.info(f"✓ {name}")
            return result
        except Exception as exc:
            await self.error(f"✗ {name}: {exc}")
            raise

    async def fspan(self, name: str, operation: Callable[[], Awaitable[T]]) -> T:
        return await self.span(name, operation)

    def timed(self, func: Callable[..., Awaitable[T]]) -> Callable[..., Awaitable[T]]:
        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            ctx = args[0] if args else kwargs.get("ctx")
            logger = McpLogger(ctx)
            signature = inspect.signature(func)
            bound = signature.bind_partial(*args, **kwargs)
            argument_names = ", ".join(k for k in bound.arguments if k != "ctx")
            name = f"{func.__name__}({argument_names})"
            start = time.perf_counter()
            await logger.info(f"→ {name}")
            try:
                result = await func(*args, **kwargs)
                elapsed = (time.perf_counter() - start) * 1000
                if isinstance(result, dict) and result.get("error"):
                    await logger.error(f"✗ {name}: {result['error']} ({elapsed:.1f}ms)")
                else:
                    await logger.info(f"✓ {name} ({elapsed:.1f}ms)")
                return result
            except Exception as exc:
                await logger.error(f"✗ {name}: {exc}")
                return {"error": str(exc)}  # type: ignore[return-value]
        return wrapper


def timed(func: Callable[..., Awaitable[T]]) -> Callable[..., Awaitable[T]]:
    """Decorate an async MCP tool with Context-aware lifecycle logging."""
    return McpLogger(None).timed(func)
