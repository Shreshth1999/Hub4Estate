#!/usr/bin/env bash
# Hub4Estate Security Audit Script
# Run: bash scripts/security-audit.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
WARN=0
FAIL=0

pass() { echo -e "${GREEN}[PASS]${NC} $1"; ((PASS++)); }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; ((WARN++)); }
fail() { echo -e "${RED}[FAIL]${NC} $1"; ((FAIL++)); }
section() { echo -e "\n${BOLD}${CYAN}=== $1 ===${NC}"; }

echo -e "${BOLD}Hub4Estate Security Audit${NC}"
echo "Timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "---"

# ── ENV FILE CHECKS ──────────────────────────────────────────────────────────
section "Environment Variables"

ENV_FILE="backend/.env"
if [ -f "$ENV_FILE" ]; then
  pass ".env file exists"

  # Check for required keys
  for KEY in DATABASE_URL JWT_SECRET SESSION_SECRET; do
    if grep -q "^${KEY}=" "$ENV_FILE" 2>/dev/null; then
      VAL=$(grep "^${KEY}=" "$ENV_FILE" | cut -d'=' -f2-)
      if [ -z "$VAL" ] || [ "$VAL" = '""' ] || [ "$VAL" = "''" ]; then
        fail "$KEY is set but empty"
      else
        CHARS=${#VAL}
        if [ "$CHARS" -lt 32 ]; then
          warn "$KEY is short ($CHARS chars) — use at least 32 random chars"
        else
          pass "$KEY is set ($CHARS chars)"
        fi
      fi
    else
      fail "$KEY is missing from .env"
    fi
  done

  # Check JWT_SECRET is not default/example
  if grep -q "^JWT_SECRET=your_jwt_secret\|^JWT_SECRET=secret\|^JWT_SECRET=changeme" "$ENV_FILE" 2>/dev/null; then
    fail "JWT_SECRET is using a default/example value — CHANGE IMMEDIATELY"
  fi

  # Check .env is gitignored
  if git check-ignore -q "$ENV_FILE" 2>/dev/null; then
    pass ".env is gitignored"
  else
    fail ".env is NOT gitignored — sensitive data may be committed"
  fi
else
  fail ".env file not found at backend/.env"
fi

# ── DEPENDENCY VULNERABILITIES ────────────────────────────────────────────────
section "Dependency Vulnerabilities"

if command -v npm &>/dev/null; then
  echo "Running npm audit (backend)..."
  cd backend
  AUDIT=$(npm audit --json 2>/dev/null || true)
  CRITICAL=$(echo "$AUDIT" | grep -o '"critical":[0-9]*' | grep -o '[0-9]*' | head -1)
  HIGH=$(echo "$AUDIT" | grep -o '"high":[0-9]*' | grep -o '[0-9]*' | head -1)
  MODERATE=$(echo "$AUDIT" | grep -o '"moderate":[0-9]*' | grep -o '[0-9]*' | head -1)
  cd ..

  [ "${CRITICAL:-0}" -gt 0 ] && fail "Backend: ${CRITICAL} critical vulnerabilities" || pass "Backend: 0 critical vulnerabilities"
  [ "${HIGH:-0}" -gt 0 ] && warn "Backend: ${HIGH} high severity vulnerabilities" || pass "Backend: 0 high vulnerabilities"
  [ "${MODERATE:-0}" -gt 0 ] && warn "Backend: ${MODERATE} moderate vulnerabilities"

  echo "Running npm audit (frontend)..."
  cd frontend
  AUDIT_FE=$(npm audit --json 2>/dev/null || true)
  CRITICAL_FE=$(echo "$AUDIT_FE" | grep -o '"critical":[0-9]*' | grep -o '[0-9]*' | head -1)
  HIGH_FE=$(echo "$AUDIT_FE" | grep -o '"high":[0-9]*' | grep -o '[0-9]*' | head -1)
  cd ..

  [ "${CRITICAL_FE:-0}" -gt 0 ] && fail "Frontend: ${CRITICAL_FE} critical vulnerabilities" || pass "Frontend: 0 critical vulnerabilities"
  [ "${HIGH_FE:-0}" -gt 0 ] && warn "Frontend: ${HIGH_FE} high severity vulnerabilities" || pass "Frontend: 0 high vulnerabilities"
else
  warn "npm not found — skipping dependency audit"
fi

# ── SECRET SCANNING ───────────────────────────────────────────────────────────
section "Secret Scanning"

SECRET_PATTERNS=(
  'sk-[a-zA-Z0-9]{32,}'
  'AKIA[0-9A-Z]{16}'
  'ghp_[a-zA-Z0-9]{36}'
  'AIza[0-9A-Za-z\-_]{35}'
  'postgres://.*:.*@'
  'mysql://.*:.*@'
  'mongodb\+srv://.*:.*@'
)

FOUND_SECRETS=0
for PATTERN in "${SECRET_PATTERNS[@]}"; do
  MATCHES=$(grep -rn --include="*.ts" --include="*.js" --include="*.tsx" \
    --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
    -E "$PATTERN" . 2>/dev/null | grep -v ".env.example" | grep -v "# " || true)
  if [ -n "$MATCHES" ]; then
    fail "Possible secret found matching pattern: $PATTERN"
    echo "$MATCHES" | head -3
    ((FOUND_SECRETS++))
  fi
done

[ "$FOUND_SECRETS" -eq 0 ] && pass "No hardcoded secrets detected in source files"

# ── FILE PERMISSIONS ──────────────────────────────────────────────────────────
section "File Permissions"

for SENSITIVE in backend/.env backend/prisma/schema.prisma; do
  if [ -f "$SENSITIVE" ]; then
    PERMS=$(stat -f "%A" "$SENSITIVE" 2>/dev/null || stat -c "%a" "$SENSITIVE" 2>/dev/null)
    if [ "$PERMS" = "600" ] || [ "$PERMS" = "640" ]; then
      pass "$SENSITIVE permissions: $PERMS"
    else
      warn "$SENSITIVE permissions: $PERMS (recommend 600)"
    fi
  fi
done

# ── SECURITY HEADERS CHECK ────────────────────────────────────────────────────
section "Security Middleware"

SECURITY_FILE="backend/src/middleware/security.ts"
if [ -f "$SECURITY_FILE" ]; then
  pass "security.ts middleware exists"
  grep -q "detectAttacks" "$SECURITY_FILE" && pass "Attack detection present" || fail "detectAttacks missing"
  grep -q "sanitizeInputs" "$SECURITY_FILE" && pass "Input sanitization present" || fail "sanitizeInputs missing"
  grep -q "blockMaliciousAgents" "$SECURITY_FILE" && pass "Bot blocking present" || fail "blockMaliciousAgents missing"
  grep -q "Content-Security-Policy" "$SECURITY_FILE" && pass "CSP header present" || warn "CSP header not found"
else
  fail "security.ts middleware not found"
fi

RATE_FILE="backend/src/middleware/rateLimiter.ts"
if [ -f "$RATE_FILE" ]; then
  pass "rateLimiter.ts exists"
  grep -q "otpLimiter" "$RATE_FILE" && pass "OTP rate limiter present" || fail "otpLimiter missing"
  grep -q "loginLimiter" "$RATE_FILE" && pass "Login rate limiter present" || fail "loginLimiter missing"
else
  fail "rateLimiter.ts not found"
fi

# ── PRISMA / DATABASE ─────────────────────────────────────────────────────────
section "Database Security"

SCHEMA="backend/prisma/schema.prisma"
if [ -f "$SCHEMA" ]; then
  pass "Prisma schema found"
  grep -q "RefreshToken" "$SCHEMA" && pass "RefreshToken model present" || fail "RefreshToken model missing"
  grep -q "PasswordResetToken" "$SCHEMA" && pass "PasswordResetToken model present" || warn "PasswordResetToken model missing"
else
  fail "Prisma schema not found"
fi

# ── GITIGNORE ─────────────────────────────────────────────────────────────────
section "Gitignore"

GITIGNORE=".gitignore"
if [ -f "$GITIGNORE" ]; then
  for IGNORE_ITEM in ".env" "node_modules" "dist" "*.key" "*.pem" "google-play-service-account.json"; do
    if grep -q "$IGNORE_ITEM" "$GITIGNORE"; then
      pass ".gitignore covers: $IGNORE_ITEM"
    else
      warn ".gitignore missing: $IGNORE_ITEM"
    fi
  done
else
  fail ".gitignore not found"
fi

# ── SUMMARY ───────────────────────────────────────────────────────────────────
section "Summary"
TOTAL=$((PASS + WARN + FAIL))
echo -e "${GREEN}PASS${NC}: $PASS / $TOTAL"
echo -e "${YELLOW}WARN${NC}: $WARN / $TOTAL"
echo -e "${RED}FAIL${NC}: $FAIL / $TOTAL"

if [ "$FAIL" -gt 0 ]; then
  echo -e "\n${RED}${BOLD}ACTION REQUIRED: $FAIL critical issues must be fixed before production.${NC}"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo -e "\n${YELLOW}${BOLD}Review $WARN warnings before deployment.${NC}"
  exit 0
else
  echo -e "\n${GREEN}${BOLD}All checks passed.${NC}"
  exit 0
fi
