"""Supabase JWT verification dependencies for FastAPI routes.

Production path validates RS256 tokens against Supabase JWKS. Test/CI path accepts
HS256 tokens signed with SUPABASE_JWT_SECRET so pytest never calls the network.

External state: Supabase Auth JWKS endpoint (cached in-process via PyJWKClient).
"""

from __future__ import annotations

import time
from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.config import Settings, get_settings

bearer_scheme = HTTPBearer(auto_error=False)
_jwk_client: PyJWKClient | None = None


def create_test_access_token(user_id: str) -> str:
    """Mint HS256 JWT for pytest — never use in production deployments."""
    settings = get_settings()
    if not settings.supabase_jwt_secret:
        raise RuntimeError("SUPABASE_JWT_SECRET required for test token minting")
    now = int(time.time())
    payload = {
        "sub": user_id,
        "aud": "authenticated",
        "iat": now,
        "exp": now + 3600,
    }
    return jwt.encode(payload, settings.supabase_jwt_secret, algorithm="HS256")


def _get_jwk_client(settings: Settings) -> PyJWKClient:
    global _jwk_client
    if _jwk_client is None:
        _jwk_client = PyJWKClient(settings.jwks_url)
    return _jwk_client


def verify_supabase_jwt(token: str, settings: Settings) -> str:
    """Decode Supabase access token and return the auth user UUID string.

    Raises HTTPException(401) on missing/invalid/expired tokens.
    """
    try:
        if settings.supabase_jwt_secret:
            header = jwt.get_unverified_header(token)
            if header.get("alg") == "HS256":
                payload = jwt.decode(
                    token,
                    settings.supabase_jwt_secret,
                    algorithms=["HS256"],
                    audience="authenticated",
                )
                user_id = payload.get("sub")
                if not user_id:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid token payload",
                    )
                return str(user_id)

        jwk_client = _get_jwk_client(settings)
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
        return str(user_id)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


async def optional_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> str | None:
    """Return authenticated user id when Bearer token present and valid; else None."""
    if credentials is None:
        return None
    return verify_supabase_jwt(credentials.credentials, settings)


async def require_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> str:
    """Require valid Supabase JWT — used by saved-resume and dashboard routes."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    user_id = verify_supabase_jwt(credentials.credentials, settings)
    UUID(user_id)  # validate format
    return user_id
