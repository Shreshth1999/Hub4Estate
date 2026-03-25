#!/usr/bin/env bash
# Hub4Estate Server Health Check
# Run: bash scripts/health-check.sh [base_url]
# Default URL: http://localhost:3001

set -euo pipefail

BASE_URL="${1:-http://localhost:3001}"
API_URL="${BASE_URL}/api"
TIMEOUT=10

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

OK=0
FAILED=0

ok() { echo -e "${GREEN}[OK]${NC}    $1"; ((OK++)); }
fail() { echo -e "${RED}[FAIL]${NC}  $1"; ((FAILED++)); }
warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; }
section() { echo -e "\n${BOLD}${CYAN}── $1 ──${NC}"; }

echo -e "${BOLD}Hub4Estate Health Check${NC}"
echo "Target: $BASE_URL"
echo "Time:   $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

# ── HTTP CONNECTIVITY ─────────────────────────────────────────────────────────
section "Connectivity"

check_endpoint() {
  local METHOD="$1"
  local PATH="$2"
  local EXPECTED="$3"
  local LABEL="$4"
  local DATA="${5:-}"

  if [ -n "$DATA" ]; then
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
      -X "$METHOD" \
      -H "Content-Type: application/json" \
      -d "$DATA" \
      --max-time "$TIMEOUT" \
      "${API_URL}${PATH}" 2>/dev/null || echo "000")
  else
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
      -X "$METHOD" \
      --max-time "$TIMEOUT" \
      "${API_URL}${PATH}" 2>/dev/null || echo "000")
  fi

  if [ "$RESPONSE" = "$EXPECTED" ]; then
    ok "$LABEL → HTTP $RESPONSE"
  elif [ "$RESPONSE" = "000" ]; then
    fail "$LABEL → Connection refused / timeout"
  else
    fail "$LABEL → Expected HTTP $EXPECTED, got $RESPONSE"
  fi
}

check_endpoint "GET" "/health" "200" "Health endpoint"
check_endpoint "GET" "/brands" "200" "Brands list"
check_endpoint "GET" "/products/categories" "200" "Product categories"

# Auth endpoints — expect validation errors (400), not 404/500
check_endpoint "POST" "/auth/send-otp" "400" "Auth: send-otp (validation)"
check_endpoint "POST" "/auth/dealer/login" "400" "Auth: dealer login (validation)"
check_endpoint "POST" "/auth/refresh-token" "400" "Auth: refresh token (validation)"
check_endpoint "POST" "/auth/forgot-password" "400" "Auth: forgot password (validation)"

# Protected endpoints — expect 401 (not 500 or 404)
check_endpoint "GET" "/inquiry/my-inquiries" "401" "Inquiry: auth guard works"
check_endpoint "GET" "/dealer-inquiry/available" "401" "Dealer inquiry: auth guard works"
check_endpoint "GET" "/notifications" "401" "Notifications: auth guard works"
check_endpoint "GET" "/admin/overview" "401" "Admin: auth guard works"

# 404 for non-existent routes
check_endpoint "GET" "/nonexistent-route-xyz" "404" "404 handler active"

# ── RESPONSE HEADERS ──────────────────────────────────────────────────────────
section "Security Headers"

HEADERS=$(curl -s -I --max-time "$TIMEOUT" "${API_URL}/health" 2>/dev/null || echo "")

check_header() {
  local HEADER="$1"
  local LABEL="$2"
  if echo "$HEADERS" | grep -qi "$HEADER"; then
    ok "$LABEL header present"
  else
    fail "$LABEL header missing"
  fi
}

check_header "x-content-type-options" "X-Content-Type-Options"
check_header "x-frame-options" "X-Frame-Options"
check_header "x-request-id" "X-Request-ID (tracing)"
check_header "content-security-policy\|x-content-security-policy" "Content-Security-Policy"

# ── RATE LIMITING ─────────────────────────────────────────────────────────────
section "Rate Limiting"

echo "Testing OTP rate limit (sending 6 rapid requests)..."
RATE_BLOCKED=false
for i in {1..6}; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"phone":"9999999999","type":"user"}' \
    --max-time 5 \
    "${API_URL}/auth/send-otp" 2>/dev/null || echo "000")
  if [ "$CODE" = "429" ]; then
    RATE_BLOCKED=true
    break
  fi
done

$RATE_BLOCKED && ok "OTP rate limiter triggered (429 received)" || warn "OTP rate limiter did not trigger in 6 requests — check config"

# ── PROCESS CHECK ─────────────────────────────────────────────────────────────
section "Process Status"

if pgrep -f "node.*backend" &>/dev/null || pgrep -f "ts-node\|tsx" &>/dev/null; then
  ok "Backend Node.js process is running"
else
  warn "No backend process detected (may be remote)"
fi

if command -v pg_isready &>/dev/null; then
  DB_HOST=$(grep "^DATABASE_URL" backend/.env 2>/dev/null | sed 's/.*@\([^:\/]*\).*/\1/' || echo "localhost")
  if pg_isready -h "$DB_HOST" -q 2>/dev/null; then
    ok "PostgreSQL is accepting connections"
  else
    fail "PostgreSQL is NOT accepting connections at $DB_HOST"
  fi
else
  warn "pg_isready not found — skipping DB check"
fi

# ── SUMMARY ───────────────────────────────────────────────────────────────────
section "Summary"
echo -e "${GREEN}OK${NC}:     $OK"
echo -e "${RED}FAILED${NC}: $FAILED"

if [ "$FAILED" -gt 0 ]; then
  echo -e "\n${RED}${BOLD}$FAILED checks failed. Investigate before serving production traffic.${NC}"
  exit 1
else
  echo -e "\n${GREEN}${BOLD}All health checks passed.${NC}"
  exit 0
fi
