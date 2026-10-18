# ClearTrace Labs — Production Deployment Guide

This guide details how to deploy ClearTrace Labs locally via Docker or across standard cloud hosting providers (Render, Railway, Fly.io, Vercel).

---

## 1. Local Deployment with Docker Compose (Recommended)

Run both the FastAPI MeTTa backend and the React Nginx frontend in an isolated environment with a single command:

```bash
# Build and start services in the background
docker-compose up --build -d

# Check service status and health checks
docker-compose ps

# Tail logs
docker-compose logs -f
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **FastAPI MeTTa Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

To stop services:
```bash
docker-compose down
```

---

## 2. Cloud Deployment Options

### Option A: Render (Full-Stack Blueprint)
ClearTrace Labs includes [`render.yaml`](./render.yaml).

1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Blueprint Instance** pointing to `render.yaml`.
3. Render will provision:
   - `cleartrace-backend`: Python 3.11 web service with automatic `/health` checks.
   - `cleartrace-frontend`: Static site serving the built Vite SPA.

### Option B: Railway
ClearTrace Labs includes [`railway.json`](./railway.json).

1. Install the Railway CLI or use the web dashboard.
2. Link your repository:
   ```bash
   railway up
   ```
3. Set the public domain for the backend and set `VITE_API_BASE` in the frontend environment.

### Option C: Fly.io (Low-Latency Nairobi Region)
ClearTrace Labs includes [`fly.toml`](./fly.toml).

```bash
fly launch --config fly.toml
fly deploy
```

### Option D: Vercel (Frontend Edge)
ClearTrace Labs includes [`vercel.json`](./vercel.json).

```bash
cd frontend
vercel deploy --prod
```

---

## 3. Environment Variables Reference

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `8000` | Backend listening port |
| `PYTHONPATH` | `.` | Python module lookup path |
| `DB_PATH` | `cleartrace.db` | Path to SQLite database file |
| `VITE_API_BASE` | `http://localhost:8000` | Backend API origin for the React frontend |

---

## 4. Production Smoke Test

Verify the deployed cluster with:
```bash
# 1. Check API Health
curl -s http://localhost:8000/health | jq .

# 2. Seed and verify preset case
curl -X POST http://localhost:8000/api/cases/from-preset/peace | jq .

# 3. Verify cryptographic replay certificate
python3 scripts/verify_replay_cert.py
```
