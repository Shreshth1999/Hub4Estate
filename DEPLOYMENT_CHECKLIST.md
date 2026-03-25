# Hub4Estate Deployment Checklist

Use this before every production deployment. Check each item manually.

---

## Pre-Deployment: Environment

- [ ] `bash scripts/check-env.sh --strict` passes with zero failures
- [ ] `NODE_ENV=production` is set
- [ ] `JWT_SECRET` is at least 64 characters of random entropy
- [ ] `SESSION_SECRET` is at least 64 characters of random entropy
- [ ] `DATABASE_URL` points to production PostgreSQL (not local/staging)
- [ ] `FRONTEND_URL` uses `https://` (not http)
- [ ] Google OAuth credentials are production app credentials (not test)
- [ ] SMTP credentials are verified and sending correctly
- [ ] `.env` file has permissions `600` (`chmod 600 backend/.env`)

## Pre-Deployment: Security

- [ ] `bash scripts/security-audit.sh` passes with zero FAIL items
- [ ] `npm audit --audit-level=high` in backend — zero high/critical vulnerabilities
- [ ] `npm audit --audit-level=high` in frontend — zero high/critical vulnerabilities
- [ ] No hardcoded secrets in source code (audit script checks this)
- [ ] `.env` is listed in `.gitignore` and not in git history
- [ ] `google-play-service-account.json` is gitignored (if present)

## Pre-Deployment: Database

- [ ] `npx prisma migrate deploy` applied successfully on production DB
- [ ] Database backup taken: `bash scripts/db-backup.sh`
- [ ] Backup file verified (gzip integrity check passes)
- [ ] PostgreSQL user has minimum required permissions (no superuser in app)
- [ ] Database connection pool limits set appropriately

## Pre-Deployment: Build

- [ ] Backend TypeScript compiles with `npm run build` — zero errors
- [ ] Frontend builds with `npm run build` — zero errors, no type errors
- [ ] All environment-specific config is loaded from env vars (no hardcoded URLs)
- [ ] API base URL in frontend points to production API (`https://api.hub4estate.com`)

## Pre-Deployment: Mobile (if releasing)

- [ ] `mobile/app.json` has correct `bundleIdentifier` and `package`
- [ ] `mobile/eas.json` is up to date
- [ ] Version numbers bumped (`version`, `buildNumber`, `versionCode`)
- [ ] `expo doctor` reports no issues
- [ ] Test on physical device (iOS + Android) before submitting to store
- [ ] Push notification certificates are valid (check Expo dashboard)

---

## Deployment Steps

### 1. Database Migration

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 2. Install Dependencies

```bash
cd backend && npm ci --production
cd ../frontend && npm ci
```

### 3. Build Frontend

```bash
cd frontend && npm run build
# Copy dist/ to server: /var/www/hub4estate/frontend/dist/
```

### 4. Start/Restart Backend

```bash
# With PM2:
pm2 restart hub4estate-api --update-env
# Or:
pm2 start dist/index.js --name hub4estate-api --env production

# Verify:
pm2 status
pm2 logs hub4estate-api --lines 50
```

### 5. Reload Nginx

```bash
sudo nginx -t          # Test config — must print "syntax is ok"
sudo nginx -s reload   # Graceful reload (no downtime)
```

### 6. SSL Certificate Renewal (if due)

```bash
sudo certbot renew --dry-run    # Test first
sudo certbot renew
sudo nginx -s reload
```

---

## Post-Deployment: Verification

- [ ] `bash scripts/health-check.sh https://api.hub4estate.com` — all checks pass
- [ ] Homepage loads at `https://hub4estate.com`
- [ ] Dealer login works at `https://hub4estate.com/dealer/login`
- [ ] Inquiry submission works end-to-end (submit → get inquiry number)
- [ ] Track inquiry returns correct status
- [ ] Admin dashboard loads at `https://hub4estate.com/admin`
- [ ] HTTPS certificate is valid (no browser warning)
- [ ] `curl -I https://api.hub4estate.com/api/health` shows HSTS header
- [ ] Rate limiting is active (6 OTP requests triggers 429)

## Post-Deployment: Monitoring

- [ ] PM2 is set to auto-restart on crash: `pm2 startup`
- [ ] Log rotation is configured: `pm2 install pm2-logrotate`
- [ ] Uptime monitoring configured (Uptime Robot / BetterUptime)
- [ ] Error alerting configured (Sentry / Logtail / Axiom)
- [ ] Backup job scheduled (cron or systemd timer): `bash scripts/db-backup.sh`

---

## Rollback Procedure

If deployment breaks production:

```bash
# 1. Restore previous build
pm2 restart hub4estate-api --update-env  # restart with previous binary if kept

# 2. Restore database (if migration caused issues)
gunzip -c backups/hub4estate_YYYYMMDD_HHMMSS.sql.gz \
  | PGPASSWORD='<pass>' psql -h <host> -U <user> -d <dbname>

# 3. Verify rollback
bash scripts/health-check.sh https://api.hub4estate.com
```

---

## SSL Certificate Setup (First Time)

```bash
sudo apt install certbot python3-certbot-nginx

# Issue certificates:
sudo certbot --nginx -d hub4estate.com -d www.hub4estate.com
sudo certbot --nginx -d api.hub4estate.com

# Auto-renew (add to crontab):
0 3 * * * certbot renew --quiet && nginx -s reload
```

---

## PM2 Ecosystem Config

Create `backend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'hub4estate-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    error_file: '/var/log/pm2/hub4estate-error.log',
    out_file: '/var/log/pm2/hub4estate-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '512M',
    restart_delay: 4000,
  }],
};
```

Start with: `pm2 start ecosystem.config.js --env production`
