import time
import logging
from collections import defaultdict
from typing import Tuple, Dict, List
from fastapi import Request, HTTPException, status
from app.core.config import settings

logger = logging.getLogger("studyos.security")

# In-memory sliding window store for zero-dependency local fallback
_in_memory_store: Dict[str, List[float]] = defaultdict(list)

# Redis client connection cache
_redis_client = None
_redis_checked = False


def _get_redis():
    global _redis_client, _redis_checked
    if _redis_checked:
        return _redis_client

    _redis_checked = True
    if not settings.REDIS_ENABLED:
        return None

    try:
        import redis
        client = redis.Redis.from_url(
            settings.REDIS_URL,
            socket_timeout=1.0,
            socket_connect_timeout=1.0,
            decode_responses=True
        )
        client.ping()
        _redis_client = client
        logger.info("Redis connected successfully for rate limiting & caching.")
    except Exception as exc:
        logger.warning("Redis not reachable (%s). Falling back to in-memory rate limiter.", exc)
        _redis_client = None

    return _redis_client


def check_rate_limit(
    request: Request,
    max_requests: int = None,
    window_seconds: int = 60
) -> Tuple[bool, int, int]:
    """
    Evaluate rate limit for the incoming request IP.
    Returns: (is_allowed, remaining_requests, reset_seconds)
    """
    limit = max_requests or settings.RATE_LIMIT_PER_MINUTE
    client_ip = request.client.host if request.client else "127.0.0.1"
    path = request.url.path
    key = f"ratelimit:{client_ip}:{path}"
    now = time.time()

    r = _get_redis()
    if r is not None:
        try:
            current_count = r.incr(key)
            if current_count == 1:
                r.expire(key, window_seconds)
            ttl = r.ttl(key)
            reset_in = ttl if ttl > 0 else window_seconds

            if current_count > limit:
                return False, 0, reset_in
            return True, max(0, limit - current_count), reset_in
        except Exception:
            pass  # Fallback to in-memory on any Redis runtime issue

    # Local in-memory sliding window fallback
    timestamps = _in_memory_store[key]
    # Prune timestamps older than window_seconds
    _in_memory_store[key] = [t for t in timestamps if now - t < window_seconds]
    current_count = len(_in_memory_store[key])

    if current_count >= limit:
        oldest = _in_memory_store[key][0]
        reset_in = max(1, int(window_seconds - (now - oldest)))
        return False, 0, reset_in

    _in_memory_store[key].append(now)
    return True, limit - (current_count + 1), window_seconds


async def rate_limit_dependency(request: Request):
    """
    FastAPI dependency to enforce rate limits on sensitive endpoints.
    """
    # Skip rate limiting for health and readiness probes
    if request.url.path in ["/health", "/ready", "/docs", "/openapi.json"]:
        return

    is_allowed, remaining, reset_in = check_rate_limit(request)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Rate limit exceeded. Please retry in {reset_in} seconds.",
            headers={"Retry-After": str(reset_in), "X-RateLimit-Remaining": "0"}
        )
