.PHONY: test seed verify benchmark backend frontend build docker-build docker-up docker-down clean help

help:
	@echo "ClearTrace Labs — Developer Makefile Commands:"
	@echo "  make verify      : Run full verification suite (seed + replay proof + pytest)"
	@echo "  make test        : Run automated pytest acceptance suite"
	@echo "  make benchmark   : Run symbolic reasoning & Merkle tree benchmark"
	@echo "  make seed        : Seed database with synthetic demonstration cases"
	@echo "  make backend     : Start FastAPI backend server on http://localhost:8000"
	@echo "  make frontend    : Start React Vite dev server on http://localhost:5173"
	@echo "  make build       : Build React frontend for production"
	@echo "  make docker-build: Build Docker containers for backend and frontend"
	@echo "  make docker-up   : Run services in Docker Compose"
	@echo "  make docker-down : Stop Docker Compose services"
	@echo "  make clean       : Remove cached test files and SQLite database"

verify:
	./scripts/run_all_verifications.sh

test:
	pytest -v tests/

benchmark:
	python3 scripts/benchmark_engine.py

seed:
	python3 scripts/seed_presets.py

backend:
	python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

clean:
	rm -f cleartrace.db
	rm -rf .pytest_cache tests/__pycache__ backend/__pycache__ frontend/dist
