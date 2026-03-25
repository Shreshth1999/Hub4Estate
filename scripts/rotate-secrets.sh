#!/usr/bin/env bash
# Hub4Estate Secret Rotation Helper
# Generates new cryptographic secrets for .env
# Run: bash scripts/rotate-secrets.sh
# NOTE: After rotation, all active sessions will be invalidated. Deploy immediately.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}Hub4Estate Secret Rotation${NC}"
echo -e "${YELLOW}WARNING: Rotating secrets will invalidate all active user sessions.${NC}"
echo -e "${YELLOW}Plan for a brief maintenance window or rolling restart.${NC}"
echo ""

# ── CHECK OPENSSL ─────────────────────────────────────────────────────────────
if ! command -v openssl &>/dev/null; then
  echo -e "${RED}openssl is required but not found.${NC}"
  exit 1
fi

gen_secret() {
  openssl rand -base64 48 | tr -d '\n/+=' | cut -c1-64
}

gen_hex() {
  openssl rand -hex 32
}

# ── GENERATE NEW SECRETS ──────────────────────────────────────────────────────
NEW_JWT=$(gen_secret)
NEW_SESSION=$(gen_secret)
NEW_REFRESH=$(gen_hex)

echo -e "${GREEN}Generated secrets (copy these to your .env):${NC}"
echo ""
echo "JWT_SECRET=$NEW_JWT"
echo "SESSION_SECRET=$NEW_SESSION"
echo "REFRESH_TOKEN_SECRET=$NEW_REFRESH"
echo ""

# ── OFFER TO UPDATE .env ──────────────────────────────────────────────────────
ENV_FILE="backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}$ENV_FILE not found — print-only mode (copy values above manually).${NC}"
  exit 0
fi

echo -e "${YELLOW}Do you want to automatically update $ENV_FILE? [y/N]${NC}"
read -r CONFIRM

if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
  # Backup first
  BACKUP="${ENV_FILE}.backup.$(date '+%Y%m%d_%H%M%S')"
  cp "$ENV_FILE" "$BACKUP"
  echo -e "Backup saved: $BACKUP"

  # Replace JWT_SECRET
  if grep -q "^JWT_SECRET=" "$ENV_FILE"; then
    sed -i.tmp "s|^JWT_SECRET=.*|JWT_SECRET=$NEW_JWT|" "$ENV_FILE"
    echo -e "${GREEN}✓${NC} JWT_SECRET updated"
  else
    echo "JWT_SECRET=$NEW_JWT" >> "$ENV_FILE"
    echo -e "${GREEN}✓${NC} JWT_SECRET added"
  fi

  # Replace SESSION_SECRET
  if grep -q "^SESSION_SECRET=" "$ENV_FILE"; then
    sed -i.tmp "s|^SESSION_SECRET=.*|SESSION_SECRET=$NEW_SESSION|" "$ENV_FILE"
    echo -e "${GREEN}✓${NC} SESSION_SECRET updated"
  else
    echo "SESSION_SECRET=$NEW_SESSION" >> "$ENV_FILE"
    echo -e "${GREEN}✓${NC} SESSION_SECRET added"
  fi

  # Cleanup tmp files created by sed -i on macOS
  rm -f "${ENV_FILE}.tmp"

  echo ""
  echo -e "${BOLD}Next steps:${NC}"
  echo "  1. Restart the backend: pm2 restart hub4estate-api (or equivalent)"
  echo "  2. All refresh tokens are now invalid — users will be prompted to log in again"
  echo "  3. Run: bash scripts/check-env.sh to verify"
  echo ""
  echo -e "${GREEN}Secret rotation complete.${NC}"
else
  echo "No changes made. Copy the values above into your .env manually."
fi
