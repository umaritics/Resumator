"""Redis-backed async job records for POST /generate polling."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from uuid import uuid4

from app.services.redis import get_redis_client

JOB_KEY_PREFIX = "job:"
JOB_TTL_SECONDS = 3600


@dataclass
class JobRecord:
    """Deserialized job payload stored at ``job:{uuid}`` in Redis."""

    job_id: str
    status: str
    stage: str | None = None
    progress_message: str | None = None
    user_id: str | None = None
    result: dict[str, Any] | None = None
    error: str | None = None


class JobStore:
    """CRUD for generation job status — hot path for TanStack Query polling."""

    def __init__(self, redis: Any | None = None) -> None:
        self._redis = redis or get_redis_client()

    def create(self, user_id: str | None = None) -> str:
        job_id = str(uuid4())
        record = {
            "job_id": job_id,
            "status": "pending",
            "stage": "queued",
            "progress_message": "Job queued…",
            "user_id": user_id,
            "result": None,
            "error": None,
        }
        self._write(job_id, record)
        return job_id

    def get(self, job_id: str) -> JobRecord | None:
        raw = self._redis.get(self._key(job_id))
        if raw is None:
            return None
        data = json.loads(raw)
        return JobRecord(
            job_id=data["job_id"],
            status=data["status"],
            stage=data.get("stage"),
            progress_message=data.get("progress_message"),
            user_id=data.get("user_id"),
            result=data.get("result"),
            error=data.get("error"),
        )

    def update_progress(
        self,
        job_id: str,
        *,
        status: str,
        stage: str,
        progress_message: str,
    ) -> None:
        record = self._load_raw(job_id)
        if record is None:
            return
        record.update(
            {
                "status": status,
                "stage": stage,
                "progress_message": progress_message,
            }
        )
        self._write(job_id, record)

    def mark_done(self, job_id: str, result: dict[str, Any]) -> None:
        record = self._load_raw(job_id)
        if record is None:
            return
        record.update(
            {
                "status": "done",
                "stage": "complete",
                "progress_message": "Generation complete",
                "result": result,
                "error": None,
            }
        )
        self._write(job_id, record)

    def mark_failed(self, job_id: str, error: str) -> None:
        record = self._load_raw(job_id)
        if record is None:
            return
        record.update(
            {
                "status": "failed",
                "stage": "failed",
                "progress_message": "Generation failed",
                "error": error,
            }
        )
        self._write(job_id, record)

    def _key(self, job_id: str) -> str:
        return f"{JOB_KEY_PREFIX}{job_id}"

    def _load_raw(self, job_id: str) -> dict[str, Any] | None:
        raw = self._redis.get(self._key(job_id))
        if raw is None:
            return None
        return json.loads(raw)

    def _write(self, job_id: str, record: dict[str, Any]) -> None:
        self._redis.set(self._key(job_id), json.dumps(record), ex=JOB_TTL_SECONDS)
