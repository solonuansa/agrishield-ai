# ============================================================
# AgriShield AI — Makefile
# Jalankan `make help` untuk melihat semua perintah
# ============================================================

.PHONY: help dev down build logs migrate migrate-down shell-db shell-api test-backend test-frontend lint-backend lint-frontend prod-up prod-down prod-logs prod-migrate

# Default target
help:
	@echo ""
	@echo "AgriShield AI — Perintah Development"
	@echo "======================================"
	@echo "  make dev              Jalankan semua service (development)"
	@echo "  make down             Hentikan semua service"
	@echo "  make build            Rebuild semua Docker image"
	@echo "  make logs             Lihat log semua service"
	@echo "  make logs s=api       Lihat log service tertentu (s=api|worker|ml-service|frontend|db)"
	@echo ""
	@echo "  make migrate          Jalankan migrasi database (alembic upgrade head)"
	@echo "  make migrate-down     Rollback migrasi satu step"
	@echo "  make migrate-new m=deskripsi  Buat migrasi baru"
	@echo ""
	@echo "  make shell-db         Masuk ke psql PostgreSQL"
	@echo "  make shell-api        Masuk ke shell container API"
	@echo ""
	@echo "  make test-backend     Jalankan unit test backend"
	@echo "  make test-frontend    Jalankan unit test frontend"
	@echo "  make lint-backend     Jalankan linter backend (ruff)"
	@echo "  make lint-frontend    Jalankan linter frontend (eslint)"
	@echo ""

# ---- Service lifecycle ----

dev:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
ifdef s
	docker compose logs -f $(s)
else
	docker compose logs -f
endif

# ---- Database ----

migrate:
	docker compose exec api alembic upgrade head

migrate-down:
	docker compose exec api alembic downgrade -1

migrate-new:
ifndef m
	$(error Tentukan pesan migrasi: make migrate-new m="deskripsi perubahan")
endif
	docker compose exec api alembic revision --autogenerate -m "$(m)"

shell-db:
	docker compose exec db psql -U postgres -d agrishield

shell-api:
	docker compose exec api bash

# ---- Testing ----

test-backend:
	docker compose exec api pytest tests/ -v

test-backend-cov:
	docker compose exec api pytest tests/ --cov=app --cov-report=html

test-frontend:
	docker compose exec frontend npm run test

# ---- Linting ----

lint-backend:
	docker compose exec api ruff check app/

lint-frontend:
	docker compose exec frontend npm run lint

# ---- Production ----

prod-up:
	docker compose -f docker-compose.prod.yml up -d

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
ifdef s
	docker compose -f docker-compose.prod.yml logs -f $(s)
else
	docker compose -f docker-compose.prod.yml logs -f
endif

prod-migrate:
	docker compose -f docker-compose.prod.yml run --rm api alembic upgrade head

# ---- Backup ----

backup-db:
	./scripts/backup-db.sh

restore-db:
ifndef f
	$(error Tentukan file backup: make restore-db f=./backups/agrishield_db_20260329_020000.sql.gz)
endif
	gunzip -c $(f) | docker compose exec -T db psql -U postgres -d agrishield

backup-db-prod:
	./scripts/backup-db.sh ./backups/prod
