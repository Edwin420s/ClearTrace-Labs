# ClearTrace Labs — Production Deployment Guide

[![SingularityNET & MeTTa](https://img.shields.io/badge/Engine-SingularityNET%20MeTTa-7b2cbf.svg)](https://singularitynet.io)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61dafb.svg?logo=react)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ed.svg?logo=docker)](https://www.docker.com)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

ClearTrace Labs is designed with a **flexible dual-runtime architecture**:
1. **Unified Single-Port Service (Recommended for Cloud)**: FastAPI serves the REST API, OpenAPI docs, and the compiled React 19 SPA directly on a single port (`$PORT` or `8000`). This eliminates CORS issues and runs comfortably on Render's or Railway's **100% Free Tier**.
2. **Multi-Service Microservices**: Run the Python MeTTa engine and Vite React SPA as separate containers (via Docker Compose) or separate hosts (Vercel edge + Render backend).

---

## 1. Quick Deploy to Render (Recommended — 100% Free Tier)

Deploying to [Render](https://render.com) takes less than 3 minutes.

### Method A: Automated Blueprint Deployment (1-Click)
1. Fork or push this repository to your GitHub account (`https://github.com/Edwin420s/ClearTrace-Labs`).
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Connect your `ClearTrace-Labs` repository.
5. Render automatically reads [`render.yaml`](./render.yaml) and provisions:
   - **Service Name**: `cleartrace-labs`
   - **Environment**: Docker (multi-stage build compiling React and Python)
   - **Plan**: Free
   - **Health Check Path**: `/health`
6. Click **Apply**. Within ~2 minutes, your deployment is live at `https://cleartrace-labs.onrender.com`.

### Method B: Manual Web Service Deployment
1. Go to [Render Dashboard](https://dashboard.render.com) $\rightarrow$ Click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository `Edwin420s/ClearTrace-Labs`.
3. Configure the following fields:
   - **Name**: `cleartrace-labs`
   - **Region**: Choose the closest region (e.g. Frankfurt, Oregon, Singapore).
   - **Branch**: `main`
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: **Free**
4. Under **Advanced**:
   - **Health Check Path**: `/health`
   - **Environment Variables**:
     - `PORT` = `8000`
     - `PYTHONPATH` = `/app`
5. Click **Create Web Service**.

> [!TIP]
> Once deployed, copy your Render URL (e.g. `https://cleartrace-labs.onrender.com`) and paste it into the **Live demo (optional)** field on your Hackathon submission portal.

---

## 2. Quick Deploy to Railway

[Railway](https://railway.app) provides instant Dockerfile-based deployments with generous trial credits.

### Method A: Deploy via Railway CLI
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login to your Railway account
railway login

# 3. Link and deploy ClearTrace Labs
railway init
railway up
```

### Method B: Deploy via Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app/new).
2. Click **Deploy from GitHub repo** and select `Edwin420s/ClearTrace-Labs`.
3. Railway detects [`railway.json`](./railway.json) and builds using the root `Dockerfile`.
4. In Settings $\rightarrow$ **Networking**, click **Generate Domain** to get your public HTTPS URL (e.g. `https://cleartrace-labs-production.up.railway.app`).

---

## 3. Quick Deploy to Fly.io (Low-Latency Global Edge)

ClearTrace Labs includes [`fly.toml`](./fly.toml) pre-configured with internal port mapping and health probes.

```bash
# 1. Install Flyctl
curl -L https://fly.io/install.sh | sh

# 2. Authenticate
fly auth login

# 3. Launch and deploy
fly launch --config fly.toml --no-deploy
fly deploy
```

---

## 4. Frontend Edge Deployment on Vercel (Optional)

If you prefer hosting the React SPA on Vercel's global CDN while pointing API calls to your Render/Railway backend:

1. Connect your repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `.` (repo root) or `frontend`.
3. Set Environment Variable:
   - `VITE_API_BASE`: `https://cleartrace-labs.onrender.com` (your deployed backend URL)
4. [`vercel.json`](./vercel.json) automatically proxies `/api/*` and `/health` routes and rewrites SPA routing.

---

## 5. Local Deployment

### Option A: Local Unified Single-Port Container
Build and run the entire unified full stack (FastAPI + React SPA) on a single port:

```bash
# Build unified image
docker build -t cleartrace-labs:latest .

# Run container on port 8000
docker run -d --name cleartrace -p 8000:8000 cleartrace-labs:latest

# Open in browser
# http://localhost:8000
```

### Option B: Local Docker Compose (Multi-Container)
Run backend on `:8000` and React Nginx frontend on `:3000`:

```bash
# Build and start services in background
docker-compose up --build -d

# Verify container status
docker-compose ps

# Tail logs
docker-compose logs -f
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **FastAPI MeTTa Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

To stop services:
```bash
docker-compose down
```

---

## 6. Environment Variables Reference

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `8000` | HTTP listening port for FastAPI / Uvicorn |
| `PYTHONPATH` | `/app` | Python module lookup path |
| `DB_PATH` | `cleartrace.db` | SQLite database file location |
| `VITE_API_BASE` | `""` (empty for same-origin) | API base origin for frontend (`""` binds to origin in unified single-port mode) |
| `LOG_LEVEL` | `info` | Uvicorn logging verbosity (`info`, `debug`, `warning`) |

---

## 7. Production Verification & Smoke Test

After deployment, verify your live instance using these commands:

```bash
TARGET_URL="https://your-service.onrender.com"

# 1. Verify Health Endpoint (GET and HEAD supported)
curl -i ${TARGET_URL}/health

# 2. Verify OpenAPI Documentation
curl -I ${TARGET_URL}/docs

# 3. Verify Preset Scenarios
curl -s ${TARGET_URL}/api/presets | jq .

# 4. Trigger Benchmark Reconciliation (Historical Peace Oral History Case)
curl -s -X POST ${TARGET_URL}/api/cases/from-preset/peace | jq .

# 5. Verify Cryptographic Integrity Proof
python3 scripts/validate_proof.py
```

All endpoints will return `200 OK` with complete JSON schemas and SHA-256 integrity proofs.
