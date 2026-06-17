"""Provider-specific exceptions surfaced by the router failover loop."""

from __future__ import annotations


class ProviderError(Exception):
    """Base class for recoverable provider failures."""


class ProviderRateLimitError(ProviderError):
    """HTTP 429 or provider-specific quota exhaustion — triggers cooldown + failover."""

    def __init__(self, message: str = "Rate limit exceeded") -> None:
        super().__init__(message)
        self.status_code = 429


class ProviderTimeoutError(ProviderError):
    """Request timed out — treated like rate limit for failover purposes."""


class AllProvidersExhaustedError(ProviderError):
    """Every candidate is cooling down, over quota, or returned a hard failure."""
