"""JWT verification edge cases — Supabase algorithm support."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from app.dependencies.auth import JWKS_ALGORITHMS, verify_supabase_jwt


class _SettingsStub:
    supabase_url = "https://example.supabase.co"
    supabase_jwt_secret = None
    jwks_url = "https://example.supabase.co/auth/v1/.well-known/jwks.json"


def test_verify_supabase_jwt_accepts_es256_and_rs256() -> None:
    """JWKS path must allow Supabase ECC (ES256) and legacy RSA (RS256) tokens."""
    settings = _SettingsStub()
    captured: dict[str, object] = {}

    def fake_decode(token, key, algorithms, audience):
        captured["algorithms"] = algorithms
        captured["audience"] = audience
        return {"sub": "00000000-0000-0000-0000-000000000001"}

    mock_signing_key = MagicMock()
    mock_signing_key.key = "public-key-material"

    with (
        patch("app.dependencies.auth._get_jwk_client") as mock_jwk_client,
        patch("app.dependencies.auth.jwt.decode", side_effect=fake_decode) as mock_decode,
    ):
        mock_jwk_client.return_value.get_signing_key_from_jwt.return_value = mock_signing_key

        user_id = verify_supabase_jwt("fake-token", settings)

    assert user_id == "00000000-0000-0000-0000-000000000001"
    assert captured["algorithms"] == list(JWKS_ALGORITHMS)
    assert captured["audience"] == "authenticated"
    mock_decode.assert_called_once()
