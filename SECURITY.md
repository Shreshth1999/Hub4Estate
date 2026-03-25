# Hub4Estate Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Hub4Estate, please report it responsibly:

**Email**: shreshth.agarwal@hub4estate.com
**Subject**: `[SECURITY] <brief description>`

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

We will respond within 48 hours and aim to patch critical issues within 7 days.

**Do not** open public GitHub issues for security vulnerabilities.

---

## Security Architecture

### Authentication

| Layer | Mechanism |
|-------|-----------|
| Users | OTP via phone/email → JWT (7-day) + Refresh Token (30-day) |
| Dealers | Email + bcrypt password → JWT + Refresh Token |
| Admins | Email + bcrypt password → JWT + Refresh Token |
| Mobile | Expo SecureStore (encrypted) for JWT + refresh token |
| Web | httpOnly cookies (session) + localStorage (non-sensitive) |

- Refresh tokens are stored in the database and rotated on every use
- All devices log out simultaneously via `revokeAllUserTokens()`
- Tokens are cleaned up automatically every 6 hours

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Send OTP | 5 per 15 minutes per IP |
| Verify OTP / Login | 10 per 15 minutes per IP |
| Dealer / Admin login | 10 per 15 minutes (skipSuccessful) |
| Forgot password | 3 per hour per IP |
| Refresh token | 20 per hour per IP |
| Inquiry submit | 10 per hour per IP |
| Quote submit | 50 per hour per IP |
| AI endpoints | 30 per 15 minutes per IP |
| Upload / scan | 20 per 15 minutes per IP |

All limits use `standardHeaders: true` (RateLimit-* headers per RFC 7807).

### Input Security

- **Zod validation** on all request bodies (schema declared per route)
- **Attack detection** middleware scans for SQL injection, XSS, path traversal, null bytes, LDAP injection, template injection
- **Input sanitization** strips `<>` and null bytes from all body strings recursively
- **Parameter pollution prevention** strips duplicate query params (keeps last value)

### Security Headers

Set via Helmet.js + custom middleware on every response:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(self), microphone=()
Content-Security-Policy: default-src 'self'; ...
```

### Bot / Scanner Blocking

User-agents matching these patterns are blocked with 403:
`sqlmap`, `nikto`, `nessus`, `openvas`, `masscan`, `zgrab`, `dirbuster`, `gobuster`, `wfuzz`

### Database

- Prisma ORM with parameterized queries (no raw SQL in application code)
- All passwords hashed with bcrypt (12 rounds)
- Password reset tokens: `crypto.randomBytes(32)`, 1-hour expiry, single-use
- Refresh tokens: `crypto.randomBytes(64)`, 30-day expiry, rotated on use

### File Uploads

- Multer with MIME type whitelist (images only: jpeg, jpg, png, webp)
- Max file size: 10MB per file
- Files stored with UUID filenames (no user-controlled paths)
- Upload rate limited separately from general API

---

## Infrastructure Security

### Nginx (Production)

See [nginx/nginx.conf](nginx/nginx.conf) for full config:

- TLS 1.2 / 1.3 only, no TLS 1.0/1.1
- HSTS with `preload` directive
- OCSP stapling enabled
- Per-route rate limiting at nginx layer (defense in depth)
- Blocks `.env`, `.git`, `.sql`, config files by extension
- Blocks common CMS attack paths (wp-admin, phpMyAdmin, xmlrpc)
- `server_tokens off` — hides nginx version

### Environment Variables

- Never committed to git (`.env` is gitignored)
- Validated at startup via Zod schema (`backend/src/config/env.ts`)
- Production secrets: minimum 32 characters, generated with `openssl rand -base64 48`
- Rotate with: `bash scripts/rotate-secrets.sh`

---

## CLI Security Tools

| Script | Purpose |
|--------|---------|
| `bash scripts/security-audit.sh` | Full security audit (secrets, deps, headers, middleware) |
| `bash scripts/health-check.sh` | Live server health + security headers check |
| `bash scripts/check-env.sh` | Validate all environment variables |
| `bash scripts/check-env.sh --strict` | Strict mode (exit 1 on warnings, use in CI) |
| `bash scripts/db-backup.sh` | Encrypted database backup with retention |
| `bash scripts/rotate-secrets.sh` | Generate and apply new JWT/session secrets |

---

## Incident Response

### If credentials are compromised

1. Run `bash scripts/rotate-secrets.sh` immediately
2. Restart the backend process
3. All sessions are invalidated — users must log in again
4. Review access logs for suspicious activity
5. Notify affected users if data was accessed

### If database is breached

1. Take database offline or restrict access
2. Run `bash scripts/db-backup.sh` from a clean system if possible
3. Audit all dealer and user data
4. Notify affected parties per applicable regulations (IT Act 2000, India)
5. Rotate all DB credentials and JWT secrets

### Log locations (production)

```
/var/log/nginx/hub4estate_access.log
/var/log/nginx/hub4estate_error.log
/var/log/pm2/hub4estate-api-*.log
```

---

## Known Limitations & Roadmap

- [ ] WAF (Web Application Firewall) — CloudFlare recommended for DDoS protection
- [ ] Automated dependency vulnerability scanning in CI (Dependabot / Snyk)
- [ ] Audit log table in DB for admin actions
- [ ] 2FA for dealer and admin accounts
- [ ] IP allowlist for admin routes in production
