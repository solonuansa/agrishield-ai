#!/bin/bash
# ============================================================
# AgriShield AI — Database Backup Script
# 
# Penggunaan:
#   ./scripts/backup-db.sh                    # Backup ke ./backups/
#   ./scripts/backup-db.sh /path/to/backup    # Backup ke path kustom
#
# Jadwalkan dengan cron (setiap hari jam 02:00):
#   0 2 * * * /opt/agrishield/scripts/backup-db.sh
# ============================================================

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/agrishield_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Mulai backup database..."

# Ambil kredensial dari .env jika ada
ENV_FILE="$(dirname "$0")/../.env"
if [ -f "${ENV_FILE}" ]; then
    set -a
    source "${ENV_FILE}"
    set +a
fi

# Gunakan docker compose exec jika container sedang berjalan
if docker compose ps db 2>/dev/null | grep -q "Up"; then
    docker compose exec -T db pg_dump -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-agrishield}" | gzip > "${BACKUP_FILE}"
else
    # Atau backup langsung jika ada akses ke database
    PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${DB_HOST:-localhost}" -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-agrishield}" | gzip > "${BACKUP_FILE}"
fi

echo "[$(date)] Backup selesai: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Hapus backup lama
find "${BACKUP_DIR}" -name "agrishield_db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] Backup lebih dari ${RETENTION_DAYS} hari dihapus."

echo "[$(date)] Backup berhasil."
