# Multi-stage production container for Student Management Portal API
FROM python:3.12-slim

# Labels & metadata
LABEL maintainer="Neerav Kumar Sharma <neeravkumar310806@gmail.com>"
LABEL version="1.0.0"
LABEL description="PBL Assignment: Production-Grade Containerized FastAPI Backend"

WORKDIR /app

# Install curl for container healthcheck probe
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Create non-root system user for container security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Docker healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
