import logging
import json
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi import status
from app.core.security import decode_access_token

logger = logging.getLogger("studyos.auth_isolation")


class UserIsolationMiddleware(BaseHTTPMiddleware):
    """
    UserIsolationMiddleware enforces strict cross-user tenancy boundaries.
    
    1. Extracts authenticated JWT user identity into request.state.user_id.
    2. Blocks client attempts to inject conflicting X-User-ID or impersonation headers.
    3. Blocks attempts to pass user_id query parameters that differ from the authenticated subject.
    4. Logs audit alerts for any cross-tenant violation attempts.
    """

    async def dispatch(self, request: Request, call_next):
        # Default state
        request.state.user_id = None
        request.state.authenticated = False

        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            payload = decode_access_token(token)
            if payload and "sub" in payload:
                request.state.user_id = str(payload["sub"])
                request.state.authenticated = True

        # Tenancy boundary check: X-User-ID header mismatch
        client_claimed_user = request.headers.get("x-user-id")
        if client_claimed_user and request.state.authenticated:
            if client_claimed_user.strip() != request.state.user_id:
                logger.warning(
                    "SECURITY AUDIT: Cross-user impersonation detected! "
                    "AuthUser=%s ClaimedHeaderUser=%s Path=%s IP=%s",
                    request.state.user_id,
                    client_claimed_user,
                    request.url.path,
                    request.client.host if request.client else "unknown"
                )
                return Response(
                    content=json.dumps({
                        "detail": "Forbidden: Cross-user tenant impersonation attempt detected."
                    }),
                    status_code=status.HTTP_403_FORBIDDEN,
                    media_type="application/json"
                )

        # Tenancy boundary check: query parameter user_id mismatch for authenticated requests
        user_id_query = request.query_params.get("user_id")
        if user_id_query and request.state.authenticated:
            if user_id_query.strip() != request.state.user_id:
                logger.warning(
                    "SECURITY AUDIT: Cross-user query param mismatch! "
                    "AuthUser=%s QueryUser=%s Path=%s IP=%s",
                    request.state.user_id,
                    user_id_query,
                    request.url.path,
                    request.client.host if request.client else "unknown"
                )
                return Response(
                    content=json.dumps({
                        "detail": "Forbidden: Cannot access or manipulate another user's resources."
                    }),
                    status_code=status.HTTP_403_FORBIDDEN,
                    media_type="application/json"
                )

        response = await call_next(request)
        return response
