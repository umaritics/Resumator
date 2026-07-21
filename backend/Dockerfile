# Cloud-agnostic container image for FastAPI.
# Works on Hugging Face Spaces, Render, Azure Container Apps, local Docker, etc.
# Bind address is always 0.0.0.0; listen port comes from $PORT (default 8000).

FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Platforms set PORT at runtime (Render, HF Spaces, Azure Container Apps).
# EXPOSE is documentation only — the process listens on $PORT.
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
