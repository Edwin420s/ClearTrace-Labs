# ==============================================================================
# ClearTrace Labs — Unified Full-Stack Production Dockerfile
# SingularityNET & MeTTa Multi-Agent Truth Engine + React 19 Frontend
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build React 19 Frontend via Vite
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
ARG VITE_API_BASE=""
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Python / FastAPI + SPA Unified Runtime
# ------------------------------------------------------------------------------
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend, reasoning engines, and scripts
COPY backend/ ./backend/
COPY engine/ ./engine/
COPY metta/ ./metta/
COPY omega/ ./omega/
COPY scripts/ ./scripts/
COPY tests/ ./tests/
COPY pytest.ini .
COPY cleartrace.db* ./

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set environment
ENV PYTHONPATH=/app
ENV PORT=8000

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start FastAPI serving both API and compiled React SPA
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
