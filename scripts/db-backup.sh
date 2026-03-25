#!/usr/bin/env bash
# Hub4Estate Database Backup Script
# Run: bash scripts/db-backup.sh
# Requires: pg_dump, gzip, DATABASE_URL in backend/.env

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── CONFIG ────────────────────────────────────────────────────────────────────
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="${BACKUP_DIR}/hub4estate_${TIMESTAMP}.sql.gz"

# ── LOAD DATABASE URL ─────────────────────────────────────────────────────────
ENV_FILE="backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  err "backend/.env not found. Set DATABASE_URL environment variable manually."
fi

export $(grep "^DATABASE_URL=" "$ENV_FILE" | xargs)

if [ -z "${DATABASE_URL:-}" ]; then
  err "DATABASE_URL not set in backend/.env"
fi

# ── PARSE DATABASE_URL ────────────────────────────────────────────────────────
# Format: postgresql://user:password@host:port/dbname
DB_USER=$(echo "$DATABASE_URL" | sed -E 's|postgresql://([^:]+):.*|\1|')
DB_PASS=$(echo "$DATABASE_URL" | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+)[:/].*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's|.*/([^?]+).*|\1|')

[ -z "$DB_NAME" ] && err "Could not parse database name from DATABASE_URL"

# ── RUN BACKUP ────────────────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

log "Starting backup of database: $DB_NAME"
log "Host: $DB_HOST:${DB_PORT:-5432}"

PGPASSWORD="$DB_PASS" pg_dump \
  -h "$DB_HOST" \
  -p "${DB_PORT:-5432}" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=plain \
  --no-password \
  --verbose 2>/dev/null \
  | gzip > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
log "Backup complete: $BACKUP_FILE ($SIZE)"

# ── VERIFY BACKUP ─────────────────────────────────────────────────────────────
if gzip -t "$BACKUP_FILE" 2>/dev/null; then
  log "Backup integrity verified (gzip OK)"
else
  err "Backup file is corrupted! Manual intervention required."
fi

# ── CLEANUP OLD BACKUPS ───────────────────────────────────────────────────────
log "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "hub4estate_*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
REMAINING=$(find "$BACKUP_DIR" -name "hub4estate_*.sql.gz" | wc -l | tr -d ' ')
log "Retained backups: $REMAINING"

# ── OPTIONAL: UPLOAD TO S3 ────────────────────────────────────────────────────
if [ -n "${S3_BACKUP_BUCKET:-}" ] && command -v aws &>/dev/null; then
  log "Uploading to S3: s3://${S3_BACKUP_BUCKET}/db-backups/"
  aws s3 cp "$BACKUP_FILE" "s3://${S3_BACKUP_BUCKET}/db-backups/$(basename "$BACKUP_FILE")" \
    --storage-class STANDARD_IA
  log "S3 upload complete"
else
  warn "S3_BACKUP_BUCKET not set or aws CLI not found — local backup only"
fi

log "Backup job finished successfully"
echo ""
echo -e "${BOLD}Restore command:${NC}"
echo "  gunzip -c $BACKUP_FILE | PGPASSWORD='<pass>' psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
