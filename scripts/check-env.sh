#!/usr/bin/env bash
# Hub4Estate Environment Variable Validator
# Run: bash scripts/check-env.sh [--strict]
# --strict: exit 1 on any warning (use in CI/CD)

set -euo pipefail

STRICT="${1:-}"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
WARN=0
FAIL=0

pass() { echo -e "  ${GREEN}✓${NC} $1"; ((PASS++)); }
warn() { echo -e "  ${YELLOW}!${NC} $1"; ((WARN++)); }
fail() { echo -e "  ${RED}✗${NC} $1"; ((FAIL++)); }
section() { echo -e "\n${BOLD}${CYAN}$1${NC}"; }

ENV_FILE="backend/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}ERROR: $ENV_FILE not found.${NC}"
  echo "Copy backend/.env.example to backend/.env and fill in values."
  exit 1
fi

echo -e "${BOLD}Hub4Estate Environment Check${NC}"
echo "File: $ENV_FILE"

# Load env silently
set -a
source "$ENV_FILE" 2>/dev/null || true
set +a

check_required() {
  local KEY="$1"
  local MIN_LEN="${2:-1}"
  local VAL="${!KEY:-}"

  if [ -z "$VAL" ]; then
    fail "$KEY — MISSING (required)"
    return
  fi

  if [ "${#VAL}" -lt "$MIN_LEN" ]; then
    fail "$KEY — too short (${#VAL} chars, need $MIN_LEN)"
    return
  fi

  pass "$KEY — set (${#VAL} chars)"
}

check_optional() {
  local KEY="$1"
  local VAL="${!KEY:-}"
  if [ -z "$VAL" ]; then
    warn "$KEY — not set (optional but recommended)"
  else
    pass "$KEY — set"
  fi
}

check_not_default() {
  local KEY="$1"
  local DEFAULT_PATTERN="$2"
  local VAL="${!KEY:-}"
  if echo "$VAL" | grep -qiE "$DEFAULT_PATTERN"; then
    fail "$KEY — looks like a placeholder/default value (CHANGE THIS)"
  fi
}

check_url() {
  local KEY="$1"
  local VAL="${!KEY:-}"
  if [ -z "$VAL" ]; then
    fail "$KEY — MISSING"
    return
  fi
  if echo "$VAL" | grep -qE "^(postgresql|postgres|mysql|mongodb)\://"; then
    pass "$KEY — valid DB URL format"
  elif echo "$VAL" | grep -qE "^https?://"; then
    pass "$KEY — valid URL format"
  else
    warn "$KEY — unexpected format: ${VAL:0:30}..."
  fi
}

# ── DATABASE ──────────────────────────────────────────────────────────────────
section "Database"
check_url "DATABASE_URL"
check_not_default "DATABASE_URL" "your_password|localhost/mydb|changeme"

# ── AUTH & SECRETS ────────────────────────────────────────────────────────────
section "Secrets & JWT"
check_required "JWT_SECRET" 32
check_required "SESSION_SECRET" 32
check_not_default "JWT_SECRET" "your_jwt_secret|secret|changeme|jwt_secret_here"
check_not_default "SESSION_SECRET" "your_session_secret|secret|changeme"

# ── GOOGLE OAUTH ──────────────────────────────────────────────────────────────
section "Google OAuth"
check_required "GOOGLE_CLIENT_ID" 10
check_required "GOOGLE_CLIENT_SECRET" 10
check_not_default "GOOGLE_CLIENT_ID" "your_google|GOOGLE_CLIENT_ID"

# ── EMAIL / SMTP ──────────────────────────────────────────────────────────────
section "Email (SMTP)"
check_required "SMTP_HOST" 3
check_required "SMTP_PORT" 2
check_required "SMTP_USER" 5
check_required "SMTP_PASS" 6
check_optional "EMAIL_FROM"

# ── CORS & URLS ───────────────────────────────────────────────────────────────
section "URLs & CORS"
check_required "FRONTEND_URL" 10
check_optional "BACKEND_URL"
check_optional "ALLOWED_ORIGINS"

# Check production URL is HTTPS
FRONTEND_URL="${FRONTEND_URL:-}"
NODE_ENV="${NODE_ENV:-development}"
if [ "$NODE_ENV" = "production" ] && [ -n "$FRONTEND_URL" ]; then
  if echo "$FRONTEND_URL" | grep -q "^http://"; then
    fail "FRONTEND_URL uses http:// in production — must use https://"
  else
    pass "FRONTEND_URL uses HTTPS in production"
  fi
fi

# ── OPTIONAL SERVICES ─────────────────────────────────────────────────────────
section "Optional Services"
check_optional "OPENAI_API_KEY"
check_optional "GOOGLE_CLOUD_PROJECT"
check_optional "GOOGLE_CLOUD_CREDENTIALS"
check_optional "S3_BACKUP_BUCKET"
check_optional "TWILIO_ACCOUNT_SID"
check_optional "TWILIO_AUTH_TOKEN"

# ── NODE_ENV ──────────────────────────────────────────────────────────────────
section "Runtime"
NODE_ENV_VAL="${NODE_ENV:-}"
if [ -z "$NODE_ENV_VAL" ]; then
  warn "NODE_ENV not set — defaults to 'development'"
elif [ "$NODE_ENV_VAL" = "production" ]; then
  pass "NODE_ENV=production"
elif [ "$NODE_ENV_VAL" = "development" ]; then
  warn "NODE_ENV=development — do not deploy with this value"
else
  pass "NODE_ENV=$NODE_ENV_VAL"
fi

PORT_VAL="${PORT:-}"
if [ -n "$PORT_VAL" ]; then
  pass "PORT=$PORT_VAL"
else
  warn "PORT not set — will default to 3001"
fi

# ── SUMMARY ───────────────────────────────────────────────────────────────────
echo ""
echo "────────────────────────────────"
echo -e "${GREEN}PASS${NC}: $PASS"
echo -e "${YELLOW}WARN${NC}: $WARN"
echo -e "${RED}FAIL${NC}: $FAIL"
echo "────────────────────────────────"

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}${BOLD}$FAIL required variables are missing or invalid. Fix before deployment.${NC}"
  exit 1
elif [ "$STRICT" = "--strict" ] && [ "$WARN" -gt 0 ]; then
  echo -e "${YELLOW}${BOLD}$WARN warnings in strict mode — resolve before deploy.${NC}"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo -e "${YELLOW}${BOLD}$WARN warnings — review before production.${NC}"
  exit 0
else
  echo -e "${GREEN}${BOLD}All environment variables are correctly configured.${NC}"
  exit 0
fi
