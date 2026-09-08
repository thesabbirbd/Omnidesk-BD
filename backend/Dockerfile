# ==============================================================================
# StudyOS Backend Production Dockerfile (v1.3.1)
# Optimized Multi-Layer Image with Non-Root Execution
# ==============================================================================

FROM python:3.12-slim AS base

# System configuration
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8000

WORKDIR /app

# Install system runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Builder stage for compiling dependencies
FROM base AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-warn-script-location -r requirements.txt

# Final Production Stage
FROM base AS runner

# Create non-root system user for security
RUN groupadd -g 10001 studyos && \
    useradd -u 10001 -g studyos -s /bin/bash -m studyos

# Copy installed python packages from builder
COPY --from=builder /root/.local /home/studyos/.local
ENV PATH=/home/studyos/.local/bin:$PATH

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R studyos:studyos /app

# Copy application source code
COPY --chown=studyos:studyos . /app

USER studyos

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
