# Hub4Estate Definitive PRD v2 -- Sections 25-26
# DevOps, CI/CD, Monitoring, Observability & Alerting
# Version: 2.0.0 | Date: 2026-04-08
# Author: Shreshth Agarwal & CTO Office
# Status: Authoritative Reference
# Classification: Internal -- Engineering
# Prerequisite Reading: section-01 through section-24

---

# SECTION 25 -- DEVOPS & CI/CD ARCHITECTURE

Every pipeline, every deployment step, every environment configuration. No manual deployments. No "it works on my machine." If it is not automated, it does not exist.

---

## 25.1 Git Strategy

### 25.1.1 Branch Model

Hub4Estate uses a modified GitFlow model optimized for continuous delivery with production safety gates.

```
main ─────────────────────────────────────────────────── (production)
  │                                           ▲
  │                                           │ (merge via PR + 1 approval + CI green)
  ▼                                           │
develop ──────────────────────────────────────┤──────── (staging, auto-deploy)
  │         ▲         ▲         ▲             │
  │         │         │         │             │
  ├── feature/H4E-42-blind-bid-engine         │
  ├── feature/H4E-71-dealer-dashboard         │
  ├── fix/H4E-85-bid-evaluation-timeout       │
  ├── hotfix/H4E-99-payment-escrow-bug ───────┘ (can merge to main directly)
  └── release/v1.2.0 ────────────────────────── (optional, for coordinated releases)
```

**Branch Types:**

| Branch Type | Pattern | Base Branch | Merges Into | Auto-Deploy | Description |
|---|---|---|---|---|---|
| `main` | `main` | -- | -- | Production (manual) | Production-ready code. Every commit is deployable. |
| `develop` | `develop` | `main` | `main` | Staging (auto) | Integration branch. All features merge here first. |
| `feature/*` | `feature/H4E-{ticket}-{slug}` | `develop` | `develop` | Preview (auto) | New features or enhancements. |
| `fix/*` | `fix/H4E-{ticket}-{slug}` | `develop` | `develop` | Preview (auto) | Non-urgent bug fixes. |
| `hotfix/*` | `hotfix/H4E-{ticket}-{slug}` | `main` | `main` + `develop` | -- | Critical production fixes. Bypasses develop. |
| `release/*` | `release/v{semver}` | `develop` | `main` + `develop` | Staging (auto) | Release candidates for coordinated deploys. |
| `chore/*` | `chore/{slug}` | `develop` | `develop` | -- | Dependency updates, config changes, CI tweaks. |

### 25.1.2 Branch Protection Rules

**`main` branch:**

```yaml
# GitHub branch protection settings for main
protection:
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
    require_last_push_approval: true
  required_status_checks:
    strict: true                    # Branch must be up-to-date with base
    contexts:
      - "ci / lint"
      - "ci / typecheck"
      - "ci / test-unit"
      - "ci / test-integration"
      - "ci / build"
      - "ci / security-scan"
  required_conversation_resolution: true
  enforce_admins: true              # Even Shreshth follows the rules
  restrictions:
    users: []
    teams: ["core-team"]
  allow_force_pushes: false
  allow_deletions: false
  required_linear_history: true     # Squash merges only
```

**`develop` branch:**

```yaml
protection:
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
  required_status_checks:
    strict: false                   # Allow slightly stale branches
    contexts:
      - "ci / lint"
      - "ci / typecheck"
      - "ci / test-unit"
      - "ci / build"
  required_conversation_resolution: true
  enforce_admins: false
  allow_force_pushes: false
  allow_deletions: false
  required_linear_history: false    # Allow merge commits for feature branches
```

### 25.1.3 PR Process

**Opening a PR:**

1. Developer creates branch from `develop` (or `main` for hotfixes).
2. Commits follow conventional commit format (see 25.1.4).
3. Developer opens PR using the template below.
4. CI runs automatically.
5. At least 1 reviewer approves.
6. All status checks pass.
7. Merge via squash merge (feature/fix) or merge commit (release/hotfix).

**PR Template:**

```markdown
<!-- .github/PULL_REQUEST_TEMPLATE.md -->

## Summary
<!-- What does this PR do? Link the Linear/GitHub issue. -->

Resolves H4E-{ticket}

## Changes
<!-- Bullet list of what changed -->
-

## Type of Change
- [ ] Feature (new functionality)
- [ ] Fix (bug fix)
- [ ] Refactor (no behavior change)
- [ ] Chore (deps, config, CI)
- [ ] Docs (documentation only)

## Testing
<!-- How was this tested? -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] E2E tests pass

## Screenshots
<!-- If UI changes, add before/after screenshots -->

## Checklist
- [ ] Code follows project conventions
- [ ] No console.log or debug code left
- [ ] Environment variables documented in .env.example
- [ ] Database migrations are reversible
- [ ] API changes are backward compatible
- [ ] Sentry error handling added for new endpoints
- [ ] No secrets or PII in code
```

### 25.1.4 Conventional Commits

All commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification, enforced by `commitlint` in a Git hook.

**Format:**

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | Description | SemVer Impact |
|---|---|---|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `perf` | Performance improvement | PATCH |
| `refactor` | Code restructure, no behavior change | -- |
| `docs` | Documentation only | -- |
| `style` | Formatting, whitespace (not CSS) | -- |
| `test` | Adding/fixing tests | -- |
| `chore` | Build, CI, deps, tooling | -- |
| `ci` | CI/CD config changes | -- |
| `revert` | Reverts a previous commit | -- |

**Scopes (Hub4Estate-specific):**

```
api, web, mobile, shared, db, auth, bids, catalog,
dealers, orders, payments, search, notifications,
ai, scraper, analytics, admin, infra, ci, docker
```

**Examples:**

```bash
feat(bids): add blind bid evaluation scoring algorithm
fix(payments): handle Razorpay webhook signature mismatch
perf(catalog): add Redis cache for product search results
refactor(api): extract dealer verification into service layer
chore(deps): update prisma to 5.12.0
ci: add security scanning step to CI pipeline
docs(api): document bid evaluation API endpoint
```

**Commitlint config:**

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'perf', 'refactor', 'docs', 'style', 'test', 'chore', 'ci', 'revert'],
    ],
    'scope-enum': [
      1,                            // warning, not error -- allows new scopes
      'always',
      [
        'api', 'web', 'mobile', 'shared', 'db', 'auth', 'bids', 'catalog',
        'dealers', 'orders', 'payments', 'search', 'notifications',
        'ai', 'scraper', 'analytics', 'admin', 'infra', 'ci', 'docker',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [1, 'always', 120],
    'header-max-length': [2, 'always', 100],
  },
};
```

### 25.1.5 CODEOWNERS

```bash
# .github/CODEOWNERS
# Default: CTO reviews everything
*                           @shreshth-h4e

# Backend
/packages/api/              @shreshth-h4e
/packages/api/src/routes/   @shreshth-h4e
/packages/api/src/services/ @shreshth-h4e

# Frontend
/packages/web/              @shreshth-h4e
/packages/web/src/          @shreshth-h4e

# Mobile
/packages/mobile/           @shreshth-h4e

# Database & Migrations
/packages/api/prisma/       @shreshth-h4e

# Infrastructure & CI
/infrastructure/            @shreshth-h4e
/.github/                   @shreshth-h4e
/docker-compose*.yml        @shreshth-h4e
/Dockerfile*                @shreshth-h4e

# Security-sensitive files (require explicit CTO approval)
/packages/api/src/middleware/auth*    @shreshth-h4e
/packages/api/src/middleware/rbac*    @shreshth-h4e
/packages/api/src/services/payment*  @shreshth-h4e
/packages/api/src/integrations/razorpay/ @shreshth-h4e

# Shared types and validations
/packages/shared/           @shreshth-h4e

# Environment config
.env.example                @shreshth-h4e
```

### 25.1.6 Git Hooks (Husky + lint-staged)

```json
// package.json (root)
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "packages/**/*.{ts,tsx}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ],
    "packages/**/*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx lint-staged

# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx --no -- commitlint --edit ${1}

# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npm run typecheck
npm run test:unit -- --run
```

---

## 25.2 CI Pipeline (GitHub Actions)

### 25.2.1 ci.yml -- Primary CI Pipeline

Runs on every push and PR to `develop` and `main`. This is the gatekeeper.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20.11'
  PNPM_VERSION: '8.15'
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  # ─────────────────────────────────────────────
  # JOB 1: Lint
  # ─────────────────────────────────────────────
  lint:
    name: Lint
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm turbo lint

      - name: Run Prettier check
        run: pnpm turbo format:check

      - name: Check for console.log in source files
        run: |
          if grep -rn "console\.\(log\|debug\|info\)" \
            --include="*.ts" --include="*.tsx" \
            --exclude-dir=node_modules \
            --exclude-dir=dist \
            --exclude-dir=.next \
            --exclude="*.test.ts" \
            --exclude="*.spec.ts" \
            --exclude="logger.ts" \
            --exclude="server.ts" \
            packages/api/src/ packages/web/src/; then
            echo "::error::Found console.log statements in source code. Use the logger utility instead."
            exit 1
          fi

  # ─────────────────────────────────────────────
  # JOB 2: Type Check
  # ─────────────────────────────────────────────
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma types
        run: pnpm --filter api prisma generate

      - name: Run TypeScript compiler
        run: pnpm turbo typecheck

  # ─────────────────────────────────────────────
  # JOB 3: Unit Tests
  # ─────────────────────────────────────────────
  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma types
        run: pnpm --filter api prisma generate

      - name: Run unit tests
        run: pnpm turbo test:unit -- --run --coverage
        env:
          NODE_ENV: test

      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-unit
          path: |
            packages/api/coverage/
            packages/web/coverage/
            packages/shared/coverage/
          retention-days: 7

      - name: Check coverage thresholds
        run: |
          # Parse coverage summary from vitest output
          # Fail if below thresholds
          pnpm turbo test:unit -- --run --coverage --reporter=json \
            --outputFile=coverage-summary.json || true

          # Enforce minimum coverage
          node -e "
            const fs = require('fs');
            const thresholds = { statements: 80, branches: 75, functions: 80, lines: 80 };
            try {
              const files = ['packages/api/coverage/coverage-summary.json', 'packages/shared/coverage/coverage-summary.json'];
              for (const file of files) {
                if (!fs.existsSync(file)) continue;
                const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                const total = data.total;
                for (const [metric, min] of Object.entries(thresholds)) {
                  const actual = total[metric]?.pct || 0;
                  if (actual < min) {
                    console.error('Coverage for ' + metric + ' is ' + actual + '%, minimum is ' + min + '%');
                    process.exit(1);
                  }
                }
              }
            } catch (e) {
              console.warn('Coverage check skipped:', e.message);
            }
          "

  # ─────────────────────────────────────────────
  # JOB 4: Integration Tests
  # ─────────────────────────────────────────────
  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: hub4estate_test
          POSTGRES_PASSWORD: test_password_ci
          POSTGRES_DB: hub4estate_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm --filter api prisma generate

      - name: Run database migrations
        run: pnpm --filter api prisma migrate deploy
        env:
          DATABASE_URL: postgresql://hub4estate_test:test_password_ci@localhost:5432/hub4estate_test

      - name: Seed test data
        run: pnpm --filter api prisma db seed
        env:
          DATABASE_URL: postgresql://hub4estate_test:test_password_ci@localhost:5432/hub4estate_test
          NODE_ENV: test

      - name: Run integration tests
        run: pnpm --filter api test:integration -- --run
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://hub4estate_test:test_password_ci@localhost:5432/hub4estate_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: ci-test-jwt-secret-not-for-production
          JWT_REFRESH_SECRET: ci-test-jwt-refresh-secret-not-for-production
          RAZORPAY_KEY_ID: rzp_test_ci_key
          RAZORPAY_KEY_SECRET: ci_test_rzp_secret
          RAZORPAY_WEBHOOK_SECRET: ci_test_webhook_secret
          CLAUDE_API_KEY: sk-ant-test-not-real
          S3_BUCKET: hub4estate-test
          S3_REGION: ap-south-1

      - name: Upload integration test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: integration-test-results
          path: packages/api/test-results/
          retention-days: 7

  # ─────────────────────────────────────────────
  # JOB 5: Build
  # ─────────────────────────────────────────────
  build:
    name: Build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm --filter api prisma generate

      - name: Build all packages
        run: pnpm turbo build
        env:
          VITE_BACKEND_API_URL: https://api.hub4estate.com/api
          VITE_POSTHOG_KEY: ${{ vars.POSTHOG_KEY_STAGING }}
          VITE_POSTHOG_HOST: https://app.posthog.com
          VITE_SENTRY_DSN: ${{ vars.SENTRY_DSN_FRONTEND }}

      - name: Check build output sizes
        run: |
          echo "=== API Build ==="
          du -sh packages/api/dist/ || true

          echo "=== Web Build ==="
          du -sh packages/web/dist/ || true

          # Fail if web bundle exceeds 10MB
          WEB_SIZE=$(du -sk packages/web/dist/ 2>/dev/null | cut -f1 || echo "0")
          if [ "$WEB_SIZE" -gt 10240 ]; then
            echo "::warning::Web build exceeds 10MB. Consider code splitting."
          fi

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            packages/api/dist/
            packages/web/dist/
          retention-days: 3

  # ─────────────────────────────────────────────
  # JOB 6: Security Scan (on PR only)
  # ─────────────────────────────────────────────
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    timeout-minutes: 10
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run pnpm audit
        run: pnpm audit --audit-level=high
        continue-on-error: true

      - name: Check for secrets in code
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: License compliance check
        run: |
          npx license-checker --production --failOn \
            "GPL-2.0;GPL-3.0;AGPL-1.0;AGPL-3.0;SSPL-1.0;BSL-1.1" \
            --excludePackages "" \
            || echo "::warning::License compliance issues found"

  # ─────────────────────────────────────────────
  # JOB 7: CI Summary
  # ─────────────────────────────────────────────
  ci-summary:
    name: CI Summary
    runs-on: ubuntu-latest
    if: always()
    needs: [lint, typecheck, test-unit, test-integration, build]
    steps:
      - name: Check job results
        run: |
          echo "Lint: ${{ needs.lint.result }}"
          echo "Typecheck: ${{ needs.typecheck.result }}"
          echo "Unit Tests: ${{ needs.test-unit.result }}"
          echo "Integration Tests: ${{ needs.test-integration.result }}"
          echo "Build: ${{ needs.build.result }}"

          if [ "${{ needs.lint.result }}" != "success" ] || \
             [ "${{ needs.typecheck.result }}" != "success" ] || \
             [ "${{ needs.test-unit.result }}" != "success" ] || \
             [ "${{ needs.test-integration.result }}" != "success" ] || \
             [ "${{ needs.build.result }}" != "success" ]; then
            echo "::error::One or more CI jobs failed"
            exit 1
          fi

          echo "All CI checks passed"
```

### 25.2.2 deploy-staging.yml -- Staging Deployment

Auto-deploys to staging when code merges to `develop`.

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy Staging

on:
  push:
    branches: [develop]

concurrency:
  group: deploy-staging
  cancel-in-progress: false          # Never cancel an in-progress deploy

env:
  AWS_REGION: ap-south-1
  ECR_REPOSITORY: hub4estate-api
  ECS_CLUSTER: hub4estate-staging
  ECS_SERVICE: hub4estate-api-staging
  ECS_TASK_DEFINITION: hub4estate-api-staging
  WORKER_ECS_SERVICE: hub4estate-worker-staging
  WORKER_ECS_TASK_DEFINITION: hub4estate-worker-staging

permissions:
  id-token: write                    # For AWS OIDC
  contents: read
  deployments: write

jobs:
  # ─────────────────────────────────────────────
  # JOB 1: Build & Push Docker Image
  # ─────────────────────────────────────────────
  build-push:
    name: Build & Push Docker Image
    runs-on: ubuntu-latest
    timeout-minutes: 15
    outputs:
      image_tag: ${{ steps.meta.outputs.tags }}
      image_digest: ${{ steps.build.outputs.digest }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN_STAGING }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: ecr-login
        uses: aws-actions/amazon-ecr-login@v2

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ steps.ecr-login.outputs.registry }}/${{ env.ECR_REPOSITORY }}
          tags: |
            type=sha,prefix=staging-
            type=raw,value=staging-latest

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./packages/api/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NODE_ENV=staging

  # ─────────────────────────────────────────────
  # JOB 2: Deploy API to ECS
  # ─────────────────────────────────────────────
  deploy-api:
    name: Deploy API to ECS Staging
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: build-push
    environment:
      name: staging
      url: https://api-staging.hub4estate.com
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN_STAGING }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Download current task definition
        run: |
          aws ecs describe-task-definition \
            --task-definition ${{ env.ECS_TASK_DEFINITION }} \
            --query 'taskDefinition' \
            > task-def.json

      - name: Update task definition with new image
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-def.json
          container-name: hub4estate-api
          image: ${{ needs.build-push.outputs.image_tag }}

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
          wait-for-minutes: 10

      - name: Run database migrations
        run: |
          aws ecs run-task \
            --cluster ${{ env.ECS_CLUSTER }} \
            --task-definition ${{ env.ECS_TASK_DEFINITION }} \
            --overrides '{
              "containerOverrides": [{
                "name": "hub4estate-api",
                "command": ["npx", "prisma", "migrate", "deploy"]
              }]
            }' \
            --launch-type FARGATE \
            --network-configuration '{
              "awsvpcConfiguration": {
                "subnets": ${{ secrets.STAGING_PRIVATE_SUBNETS }},
                "securityGroups": ${{ secrets.STAGING_ECS_SG }}
              }
            }'

  # ─────────────────────────────────────────────
  # JOB 3: Deploy Worker to ECS
  # ─────────────────────────────────────────────
  deploy-worker:
    name: Deploy Worker to ECS Staging
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: [build-push, deploy-api]
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN_STAGING }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Download current task definition
        run: |
          aws ecs describe-task-definition \
            --task-definition ${{ env.WORKER_ECS_TASK_DEFINITION }} \
            --query 'taskDefinition' \
            > worker-task-def.json

      - name: Update task definition with new image
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: worker-task-def.json
          container-name: hub4estate-worker
          image: ${{ needs.build-push.outputs.image_tag }}

      - name: Deploy worker to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.WORKER_ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
          wait-for-minutes: 10

  # ─────────────────────────────────────────────
  # JOB 4: Post-Deploy Smoke Tests
  # ─────────────────────────────────────────────
  smoke-tests:
    name: Smoke Tests (Staging)
    runs-on: ubuntu-latest
    timeout-minutes: 5
    needs: [deploy-api, deploy-worker]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Wait for service stability
        run: sleep 15

      - name: Health check -- liveness
        run: |
          for i in {1..5}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
              https://api-staging.hub4estate.com/health)
            if [ "$STATUS" = "200" ]; then
              echo "Liveness check passed"
              exit 0
            fi
            echo "Attempt $i: got $STATUS, retrying in 10s..."
            sleep 10
          done
          echo "::error::Liveness check failed after 5 attempts"
          exit 1

      - name: Health check -- readiness
        run: |
          RESPONSE=$(curl -sf https://api-staging.hub4estate.com/health/ready)
          echo "$RESPONSE" | jq .

          DB_OK=$(echo "$RESPONSE" | jq -r '.checks.database')
          REDIS_OK=$(echo "$RESPONSE" | jq -r '.checks.redis')

          if [ "$DB_OK" != "ok" ]; then
            echo "::error::Database health check failed"
            exit 1
          fi
          if [ "$REDIS_OK" != "ok" ]; then
            echo "::error::Redis health check failed"
            exit 1
          fi

          echo "All readiness checks passed"

      - name: API smoke tests
        run: |
          BASE_URL="https://api-staging.hub4estate.com/api/v1"

          echo "Testing catalog search..."
          curl -sf "$BASE_URL/catalog/categories" | jq '.data | length' || exit 1

          echo "Testing search..."
          curl -sf "$BASE_URL/catalog/search?q=mcb&limit=5" | jq '.data | length' || exit 1

          echo "All smoke tests passed"

      - name: Notify deployment success
        if: success()
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_STAGING }}" \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "Staging deployed successfully",
              "blocks": [{
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Staging Deploy*\nCommit: `${{ github.sha }}`\nBy: ${{ github.actor }}\nStatus: All smoke tests passed"
                }
              }]
            }' || true

      - name: Notify deployment failure
        if: failure()
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_STAGING }}" \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "STAGING DEPLOY FAILED",
              "blocks": [{
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*STAGING DEPLOY FAILED*\nCommit: `${{ github.sha }}`\nBy: ${{ github.actor }}\nAction: <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Logs>"
                }
              }]
            }' || true
```

### 25.2.3 deploy-production.yml -- Production Deployment

Manual deploy to production when `develop` merges into `main`. Requires approval from the `production` environment.

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    branches: [main]

concurrency:
  group: deploy-production
  cancel-in-progress: false

env:
  AWS_REGION: ap-south-1
  ECR_REPOSITORY: hub4estate-api
  ECS_CLUSTER: hub4estate-production
  ECS_SERVICE: hub4estate-api-production
  ECS_TASK_DEFINITION: hub4estate-api-production
  WORKER_ECS_SERVICE: hub4estate-worker-production
  WORKER_ECS_TASK_DEFINITION: hub4estate-worker-production

permissions:
  id-token: write
  contents: read
  deployments: write

jobs:
  # ─────────────────────────────────────────────
  # JOB 1: Build & Push Docker Image
  # ─────────────────────────────────────────────
  build-push:
    name: Build & Push Docker Image
    runs-on: ubuntu-latest
    timeout-minutes: 15
    outputs:
      image_tag: ${{ steps.meta.outputs.tags }}
      image_digest: ${{ steps.build.outputs.digest }}
      short_sha: ${{ steps.vars.outputs.short_sha }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set variables
        id: vars
        run: echo "short_sha=$(echo ${{ github.sha }} | cut -c1-7)" >> $GITHUB_OUTPUT

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN_PRODUCTION }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: ecr-login
        uses: aws-actions/amazon-ecr-login@v2

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ steps.ecr-login.outputs.registry }}/${{ env.ECR_REPOSITORY }}
          tags: |
            type=sha,prefix=prod-
            type=raw,value=prod-latest
            type=semver,pattern={{version}},enable=${{ startsWith(github.ref, 'refs/tags/v') }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./packages/api/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NODE_ENV=production

  # ─────────────────────────────────────────────
  # JOB 2: Pre-Deploy Database Backup
  # ─────────────────────────────────────────────
  db-backup:
    name: Pre-Deploy Database Backup
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: build-push
    environment:
      name: production
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN_PRODUCTION }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Create RDS snapshot
        run: |
          SNAPSHOT_ID="pre-deploy-${{ needs.build-push.outputs.short_sha }}-$(date +%Y%m%d-%H%M%S)"
          aws rds create-db-snapshot \
            --db-instance-identifier hub4estate-production \
            --db-snapshot-identifier "$SNAPSHOT_ID"

          echo "Created snapshot: $SNAPSHOT_ID"
          echo "SNAPSHOT_ID=$SNAPSHOT_ID" >> $GITHUB_ENV

      - name: Wait for snapshot completion
        run: |
          aws rds wait db-snapshot-available \
            --db-snapshot-identifier "$SNAPSHOT_ID"
          echo "Snapshot $SNAPSHOT_ID is available"

  # ─────────────────────────────────────────────
  # JOB 3: Run Database Migrations
  # ─────────────────────────────────────────────
  db-migrate:
    name: Database Migrations
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: [build-push, db-backup]
    environment:
      name: production
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN_PRODUCTION }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Run migrations via ECS task
        run: |
          TASK_ARN=$(aws ecs run-task \
            --cluster ${{ env.ECS_CLUSTER }} \
            --task-definition ${{ env.ECS_TASK_DEFINITION }} \
            --overrides '{
              "containerOverrides": [{
                "name": "hub4estate-api",
                "command": ["npx", "prisma", "migrate", "deploy"],
                "environment": [
                  {"name": "DATABASE_URL", "value": "${{ secrets.PRODUCTION_DATABASE_URL }}"}
                ]
              }]
            }' \
            --launch-type FARGATE \
            --network-configuration '{
              "awsvpcConfiguration": {
                "subnets": ${{ secrets.PRODUCTION_PRIVATE_SUBNETS }},
                "securityGroups": ${{ secrets.PRODUCTION_ECS_SG }},
                "assignPublicIp": "DISABLED"
              }
            }' \
            --query 'tasks[0].taskArn' \
            --output text)

          echo "Migration task: $TASK_ARN"

          # Wait for task to complete
          aws ecs wait tasks-stopped \
            --cluster ${{ env.ECS_CLUSTER }} \
            --tasks "$TASK_ARN"

          # Check exit code
          EXIT_CODE=$(aws ecs describe-tasks \
            --cluster ${{ env.ECS_CLUSTER }} \
            --tasks "$TASK_ARN" \
            --query 'tasks[0].containers[0].exitCode' \
            --output text)

          if [ "$EXIT_CODE" != "0" ]; then
            echo "::error::Migration failed with exit code $EXIT_CODE"
            exit 1
          fi

          echo "Migrations completed successfully"

  # ─────────────────────────────────────────────
  # JOB 4: Deploy API (Blue-Green)
  # ─────────────────────────────────────────────
  deploy-api:
    name: Deploy API (Blue-Green)
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: [build-push, db-migrate]
    environment:
      name: production
      url: https://api.hub4estate.com
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN_PRODUCTION }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Download current task definition
        run: |
          aws ecs describe-task-definition \
            --task-definition ${{ env.ECS_TASK_DEFINITION }} \
            --query 'taskDefinition' \
            > task-def.json

      - name: Update task definition with new image
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-def.json
          container-name: hub4estate-api
          image: ${{ needs.build-push.outputs.image_tag }}

      - name: Deploy to ECS (blue-green)
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
          wait-for-minutes: 15
          codedeploy-appspec: appspec.yaml
          codedeploy-application: hub4estate-api
          codedeploy-deployment-group: hub4estate-api-production

  # ─────────────────────────────────────────────
  # JOB 5: Deploy Worker
  # ─────────────────────────────────────────────
  deploy-worker:
    name: Deploy Worker
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: [build-push, deploy-api]
    environment:
      name: production
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN_PRODUCTION }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Download current task definition
        run: |
          aws ecs describe-task-definition \
            --task-definition ${{ env.WORKER_ECS_TASK_DEFINITION }} \
            --query 'taskDefinition' \
            > worker-task-def.json

      - name: Update task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: worker-task-def.json
          container-name: hub4estate-worker
          image: ${{ needs.build-push.outputs.image_tag }}

      - name: Deploy worker to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.WORKER_ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
          wait-for-minutes: 10

  # ─────────────────────────────────────────────
  # JOB 6: Production Smoke Tests
  # ─────────────────────────────────────────────
  smoke-tests:
    name: Production Smoke Tests
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: [deploy-api, deploy-worker]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Wait for DNS propagation
        run: sleep 20

      - name: Liveness check
        run: |
          for i in {1..10}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
              https://api.hub4estate.com/health)
            if [ "$STATUS" = "200" ]; then
              echo "Liveness check passed"
              break
            fi
            echo "Attempt $i: got $STATUS, retrying in 10s..."
            sleep 10
          done

          if [ "$STATUS" != "200" ]; then
            echo "::error::Production liveness check FAILED"
            exit 1
          fi

      - name: Readiness check
        run: |
          RESPONSE=$(curl -sf https://api.hub4estate.com/health/ready)
          echo "$RESPONSE" | jq .

          OVERALL=$(echo "$RESPONSE" | jq -r '.status')
          if [ "$OVERALL" != "ok" ]; then
            echo "::error::Production readiness check FAILED"
            echo "$RESPONSE" | jq .
            exit 1
          fi

      - name: Critical path tests
        run: |
          BASE="https://api.hub4estate.com/api/v1"

          echo "Testing catalog categories..."
          curl -sf "$BASE/catalog/categories" > /dev/null

          echo "Testing catalog search..."
          curl -sf "$BASE/catalog/search?q=havells+mcb&limit=3" > /dev/null

          echo "Testing version endpoint..."
          curl -sf "$BASE/version" | jq .

          echo "All critical path tests passed"

      - name: Check Sentry for new errors
        run: |
          FIVE_MIN_AGO=$(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S 2>/dev/null || \
                         date -u -v-5M +%Y-%m-%dT%H:%M:%S)

          ERROR_COUNT=$(curl -sf \
            -H "Authorization: Bearer ${{ secrets.SENTRY_AUTH_TOKEN }}" \
            "https://sentry.io/api/0/projects/hub4estate/api-production/issues/?query=is:unresolved+firstSeen:>$FIVE_MIN_AGO" \
            | jq 'length')

          if [ "$ERROR_COUNT" -gt "5" ]; then
            echo "::warning::$ERROR_COUNT new Sentry errors detected post-deploy"
          else
            echo "Sentry error count ($ERROR_COUNT) within acceptable range"
          fi

      - name: Notify production deploy success
        if: success()
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_PRODUCTION }}" \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "PRODUCTION DEPLOYED SUCCESSFULLY",
              "blocks": [{
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Production Deploy*\nCommit: `${{ github.sha }}`\nBy: ${{ github.actor }}\nAll smoke tests passed. Monitoring for errors..."
                }
              }]
            }' || true

      - name: Alert on production deploy failure
        if: failure()
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_PRODUCTION }}" \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "PRODUCTION DEPLOY FAILED -- IMMEDIATE ATTENTION REQUIRED",
              "blocks": [{
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*PRODUCTION DEPLOY FAILED*\nCommit: `${{ github.sha }}`\nBy: ${{ github.actor }}\n*Action Required*: <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Logs>\n\nConsider rollback if smoke tests are failing."
                }
              }]
            }' || true
```

### 25.2.4 security-scan.yml -- Daily Security Scan

```yaml
# .github/workflows/security-scan.yml
name: Security Scan (Daily)

on:
  schedule:
    - cron: '0 4 * * *'             # 4:00 UTC = 9:30 AM IST
  workflow_dispatch:                  # Manual trigger

permissions:
  contents: read
  security-events: write

jobs:
  dependency-scan:
    name: Dependency Vulnerability Scan
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: '8.15'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.11'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run pnpm audit
        id: audit
        run: |
          pnpm audit --audit-level=moderate --json > audit-results.json 2>&1 || true
          VULN_COUNT=$(cat audit-results.json | jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical' 2>/dev/null || echo "0")
          echo "vuln_count=$VULN_COUNT" >> $GITHUB_OUTPUT

      - name: Run Snyk scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=medium --json-file-output=snyk-results.json

      - name: Check for critical CVEs
        run: |
          CRITICAL=$(cat snyk-results.json 2>/dev/null | \
            jq '[.vulnerabilities[] | select(.severity == "critical")] | length' 2>/dev/null || echo "0")
          HIGH=$(cat snyk-results.json 2>/dev/null | \
            jq '[.vulnerabilities[] | select(.severity == "high")] | length' 2>/dev/null || echo "0")

          echo "Critical: $CRITICAL, High: $HIGH"

          if [ "$CRITICAL" -gt "0" ]; then
            echo "::error::$CRITICAL critical vulnerabilities found"
          fi
          if [ "$HIGH" -gt "0" ]; then
            echo "::warning::$HIGH high-severity vulnerabilities found"
          fi

      - name: Upload scan results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: security-scan-results
          path: |
            audit-results.json
            snyk-results.json
          retention-days: 30

      - name: Notify on critical vulnerabilities
        if: steps.audit.outputs.vuln_count > 0
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_SECURITY }}" \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "Security scan found vulnerabilities",
              "blocks": [{
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Daily Security Scan*\nHigh/Critical vulnerabilities: ${{ steps.audit.outputs.vuln_count }}\nAction: <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Results>"
                }
              }]
            }' || true

  docker-scan:
    name: Docker Image Vulnerability Scan
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN_PRODUCTION }}
          aws-region: ap-south-1

      - name: Login to ECR
        id: ecr-login
        uses: aws-actions/amazon-ecr-login@v2

      - name: Scan production image with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ steps.ecr-login.outputs.registry }}/hub4estate-api:prod-latest
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'HIGH,CRITICAL'

      - name: Upload Trivy scan results to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  code-scan:
    name: Static Code Analysis
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript

      - name: Perform CodeQL analysis
        uses: github/codeql-action/analyze@v3

      - name: Check for hardcoded secrets
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified --json
```

### 25.2.5 e2e-tests.yml -- E2E Test Pipeline (on demand)

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  workflow_dispatch:
  pull_request:
    branches: [main]
    types: [opened, synchronize]

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: true

jobs:
  e2e:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: hub4estate_test
          POSTGRES_PASSWORD: test_password_ci
          POSTGRES_DB: hub4estate_e2e
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: '8.15'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.11'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium firefox

      - name: Setup database
        run: |
          pnpm --filter api prisma generate
          pnpm --filter api prisma migrate deploy
          pnpm --filter api prisma db seed
        env:
          DATABASE_URL: postgresql://hub4estate_test:test_password_ci@localhost:5432/hub4estate_e2e

      - name: Start backend
        run: |
          pnpm --filter api build
          pnpm --filter api start &
          sleep 5
        env:
          NODE_ENV: test
          PORT: 3001
          DATABASE_URL: postgresql://hub4estate_test:test_password_ci@localhost:5432/hub4estate_e2e
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: e2e-test-jwt-secret
          JWT_REFRESH_SECRET: e2e-test-jwt-refresh-secret

      - name: Start frontend
        run: |
          pnpm --filter web build
          pnpm --filter web preview &
          sleep 5
        env:
          VITE_BACKEND_API_URL: http://localhost:3001/api

      - name: Run Playwright tests
        run: npx playwright test --project=chromium
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:4173

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results
          path: |
            test-results/
            playwright-report/
          retention-days: 7
```

---

## 25.3 Docker

### 25.3.1 Backend Dockerfile (Multi-Stage)

```dockerfile
# packages/api/Dockerfile
# ──────────────────────────────────────────────
# Stage 1: Dependencies
# ──────────────────────────────────────────────
FROM node:20.11-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy workspace root for pnpm workspace resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/shared/package.json ./packages/shared/

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# ──────────────────────────────────────────────
# Stage 2: Build
# ──────────────────────────────────────────────
FROM node:20.11-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY packages/api/ ./packages/api/
COPY tsconfig.base.json ./

# Generate Prisma client
RUN cd packages/api && npx prisma generate

# Build shared package first
RUN cd packages/shared && npx tsc --build

# Build API
RUN cd packages/api && npx tsc --build

# Prune dev dependencies
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
RUN pnpm prune --prod

# ──────────────────────────────────────────────
# Stage 3: Production
# ──────────────────────────────────────────────
FROM node:20.11-alpine AS production

# Security: run as non-root user
RUN addgroup --system --gid 1001 hub4estate && \
    adduser --system --uid 1001 hub4estate

RUN apk add --no-cache \
    libc6-compat \
    openssl \
    dumb-init \
    curl

WORKDIR /app

# Copy production dependencies
COPY --from=builder --chown=hub4estate:hub4estate /app/node_modules ./node_modules
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy built code
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/api/dist ./packages/api/dist
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/shared/dist ./packages/shared/dist

# Copy Prisma schema and migrations (needed for prisma migrate deploy)
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/api/prisma ./packages/api/prisma

# Copy generated Prisma client
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/api/node_modules/.prisma ./packages/api/node_modules/.prisma

# Copy package.json for metadata
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/api/package.json ./packages/api/package.json

ENV NODE_ENV=production
ENV PORT=3001

# Switch to non-root user
USER hub4estate

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use dumb-init to handle PID 1 and signal forwarding
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "packages/api/dist/server.js"]
```

### 25.3.2 Worker Dockerfile

```dockerfile
# packages/api/Dockerfile.worker
# Uses the same build stages as the API Dockerfile, only the CMD changes.
# In practice, use the same image with a different CMD in the ECS task definition.

FROM node:20.11-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/shared/package.json ./packages/shared/
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
RUN pnpm install --frozen-lockfile

FROM node:20.11-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY packages/shared/ ./packages/shared/
COPY packages/api/ ./packages/api/
COPY tsconfig.base.json ./
RUN cd packages/api && npx prisma generate
RUN cd packages/shared && npx tsc --build
RUN cd packages/api && npx tsc --build
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
RUN pnpm prune --prod

FROM node:20.11-alpine AS production
RUN addgroup --system --gid 1001 hub4estate && \
    adduser --system --uid 1001 hub4estate
RUN apk add --no-cache libc6-compat openssl dumb-init curl
WORKDIR /app
COPY --from=builder --chown=hub4estate:hub4estate /app/node_modules ./node_modules
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/api/dist ./packages/api/dist
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/api/prisma ./packages/api/prisma
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/api/node_modules/.prisma ./packages/api/node_modules/.prisma
COPY --from=builder --chown=hub4estate:hub4estate /app/packages/api/package.json ./packages/api/package.json

ENV NODE_ENV=production
USER hub4estate

# No HEALTHCHECK for worker -- BullMQ handles job health
# Worker does not expose ports

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "packages/api/dist/jobs/worker.js"]
```

### 25.3.3 .dockerignore

```
# .dockerignore
node_modules
.git
.github
.husky
.vscode
.env
.env.*
!.env.example
dist
coverage
test-results
playwright-report
*.md
!README.md
infrastructure/
docs/
scripts/
*.log
.DS_Store
Thumbs.db
```

### 25.3.4 docker-compose.yml -- Local Development

```yaml
# docker-compose.yml
# Local development environment
# Usage: docker compose up -d

version: '3.9'

services:
  # ─────────────────────────────────────────────
  # PostgreSQL 15
  # ─────────────────────────────────────────────
  postgres:
    image: postgres:15-alpine
    container_name: h4e-postgres
    restart: unless-stopped
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: hub4estate
      POSTGRES_PASSWORD: hub4estate_dev
      POSTGRES_DB: hub4estate_dev
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U hub4estate']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - hub4estate

  # ─────────────────────────────────────────────
  # Redis 7
  # ─────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: h4e-redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    command: >
      redis-server
        --maxmemory 256mb
        --maxmemory-policy allkeys-lru
        --appendonly yes
        --appendfsync everysec
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - hub4estate

  # ─────────────────────────────────────────────
  # Elasticsearch 8.12
  # ─────────────────────────────────────────────
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.2
    container_name: h4e-elasticsearch
    restart: unless-stopped
    ports:
      - '9200:9200'
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - xpack.security.http.ssl.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
      - cluster.name=hub4estate-dev
      - bootstrap.memory_lock=true
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65536
        hard: 65536
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ['CMD-SHELL', 'curl -sf http://localhost:9200/_cluster/health || exit 1']
      interval: 15s
      timeout: 10s
      retries: 5
      start_period: 30s
    networks:
      - hub4estate

  # ─────────────────────────────────────────────
  # MinIO (S3-compatible storage for local dev)
  # ─────────────────────────────────────────────
  minio:
    image: minio/minio:latest
    container_name: h4e-minio
    restart: unless-stopped
    ports:
      - '9000:9000'                          # S3 API
      - '9001:9001'                          # MinIO Console
    environment:
      MINIO_ROOT_USER: hub4estate_dev
      MINIO_ROOT_PASSWORD: hub4estate_dev_secret
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ['CMD', 'mc', 'ready', 'local']
      interval: 15s
      timeout: 10s
      retries: 5
      start_period: 10s
    networks:
      - hub4estate

  # ─────────────────────────────────────────────
  # MinIO bucket initialization
  # ─────────────────────────────────────────────
  minio-init:
    image: minio/mc:latest
    container_name: h4e-minio-init
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
        mc alias set h4e http://minio:9000 hub4estate_dev hub4estate_dev_secret;
        mc mb --ignore-existing h4e/hub4estate-uploads;
        mc mb --ignore-existing h4e/hub4estate-documents;
        mc mb --ignore-existing h4e/hub4estate-invoices;
        mc anonymous set download h4e/hub4estate-uploads;
        echo 'MinIO buckets initialized';
      "
    networks:
      - hub4estate

  # ─────────────────────────────────────────────
  # Redis Commander (Redis GUI for dev -- debug profile only)
  # ─────────────────────────────────────────────
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: h4e-redis-commander
    restart: unless-stopped
    ports:
      - '8081:8081'
    environment:
      REDIS_HOSTS: local:redis:6379
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - hub4estate
    profiles:
      - debug

  # ─────────────────────────────────────────────
  # pgAdmin (PostgreSQL GUI for dev -- debug profile only)
  # ─────────────────────────────────────────────
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: h4e-pgadmin
    restart: unless-stopped
    ports:
      - '8082:80'
    environment:
      PGADMIN_DEFAULT_EMAIL: dev@hub4estate.com
      PGADMIN_DEFAULT_PASSWORD: dev_password
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - hub4estate
    profiles:
      - debug

  # ─────────────────────────────────────────────
  # Kibana (Elasticsearch GUI for dev -- debug profile only)
  # ─────────────────────────────────────────────
  kibana:
    image: docker.elastic.co/kibana/kibana:8.12.2
    container_name: h4e-kibana
    restart: unless-stopped
    ports:
      - '5601:5601'
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
      - xpack.security.enabled=false
    depends_on:
      elasticsearch:
        condition: service_healthy
    networks:
      - hub4estate
    profiles:
      - debug

  # ─────────────────────────────────────────────
  # MailHog (email capture for dev -- debug profile only)
  # ─────────────────────────────────────────────
  mailhog:
    image: mailhog/mailhog
    container_name: h4e-mailhog
    restart: unless-stopped
    ports:
      - '1025:1025'                          # SMTP
      - '8025:8025'                          # Web UI
    networks:
      - hub4estate
    profiles:
      - debug

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  elasticsearch_data:
    driver: local
  minio_data:
    driver: local

networks:
  hub4estate:
    driver: bridge
    name: hub4estate-network
```

### 25.3.5 docker-compose.test.yml -- CI/Test Environment

```yaml
# docker-compose.test.yml
# Used in CI for integration tests
# Usage: docker compose -f docker-compose.test.yml up -d

version: '3.9'

services:
  postgres-test:
    image: postgres:15-alpine
    container_name: h4e-postgres-test
    ports:
      - '5433:5432'
    environment:
      POSTGRES_USER: hub4estate_test
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: hub4estate_test
    tmpfs:
      - /var/lib/postgresql/data           # In-memory for speed
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U hub4estate_test']
      interval: 5s
      timeout: 3s
      retries: 10

  redis-test:
    image: redis:7-alpine
    container_name: h4e-redis-test
    ports:
      - '6380:6379'
    command: redis-server --save "" --appendonly no  # No persistence for speed
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 10
```

---

## 25.4 Deployment Architecture

### 25.4.1 Overview

```
                                    Internet
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   Cloudflare     │
                              │   (DNS + WAF +   │
                              │    CDN + DDoS)   │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                   │
                    ▼                  ▼                   ▼
           ┌───────────────┐  ┌──────────────┐   ┌──────────────┐
           │    Vercel      │  │  ALB (AWS)   │   │ status.      │
           │  (Frontend)    │  │  (Backend)   │   │ hub4estate   │
           │  hub4estate.   │  │  api.        │   │ .com         │
           │  com           │  │  hub4estate  │   │ (BetterUp)   │
           └───────────────┘  │  .com         │   └──────────────┘
                              └──────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                 │
                    ▼                ▼                 ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
           │  ECS Fargate  │ │  ECS Fargate │ │  ECS Fargate │
           │  API Task 1   │ │  API Task 2  │ │  Worker      │
           │  (1vCPU/2GB)  │ │  (1vCPU/2GB) │ │  (0.5vCPU/   │
           │               │ │              │ │   1GB)        │
           └──────┬────────┘ └──────┬───────┘ └──────┬───────┘
                  │                 │                  │
                  └────────────────┼──────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │               │
                    ▼              ▼               ▼
           ┌──────────────┐ ┌──────────┐  ┌──────────────┐
           │  RDS Postgres │ │  Redis   │  │  Elastic     │
           │  (db.r6g.     │ │  (Elasti │  │  search      │
           │   large)      │ │   cache  │  │  (t3.medium  │
           │  Multi-AZ     │ │   t3.    │  │   .search)   │
           │               │ │   micro) │  │              │
           └──────────────┘ └──────────┘  └──────────────┘
                    │
                    ▼
           ┌──────────────┐
           │  S3 Bucket   │
           │  (uploads,   │
           │   docs,      │
           │   invoices)  │
           └──────────────┘
```

### 25.4.2 Frontend -- Vercel

| Setting | Value |
|---|---|
| Provider | Vercel |
| Framework | Vite (React) |
| Region | Mumbai (bom1) |
| Build Command | `cd packages/web && pnpm build` |
| Output Directory | `packages/web/dist` |
| Install Command | `pnpm install --frozen-lockfile` |
| Node Version | 20.x |
| Environment | Production: `hub4estate.com`, Preview: `*.vercel.app` |

**Custom domains:**

```
hub4estate.com            → Vercel production
www.hub4estate.com        → Redirect to hub4estate.com
app.hub4estate.com        → Vercel production (future dashboard)
```

**Preview deployments:**

- Every PR gets an automatic preview URL.
- Pattern: `hub4estate-{branch}-{hash}.vercel.app`
- Preview deploys use staging environment variables.
- Automatically deleted after PR merge.

**Vercel configuration:**

```json
{
  "buildCommand": "cd packages/web && pnpm build",
  "outputDirectory": "packages/web/dist",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "vite",
  "regions": ["bom1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.posthog.com https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.hub4estate.com https://s3.ap-south-1.amazonaws.com; connect-src 'self' https://api.hub4estate.com https://*.posthog.com https://*.sentry.io; frame-ancestors 'none';"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 25.4.3 Backend -- AWS ECS Fargate

**API Service:**

| Setting | Value |
|---|---|
| Cluster | `hub4estate-production` |
| Service | `hub4estate-api-production` |
| Task Definition | `hub4estate-api-production` |
| Launch Type | FARGATE |
| CPU | 1024 (1 vCPU) |
| Memory | 2048 MB (2 GB) |
| Desired Count | 2 |
| Min Tasks | 2 |
| Max Tasks | 8 |
| Health Check Path | `/health` |
| Health Check Interval | 30s |
| Health Check Timeout | 10s |
| Healthy Threshold | 2 |
| Unhealthy Threshold | 3 |
| Deregistration Delay | 60s |
| Deployment Type | Blue-Green (CodeDeploy) |

**Auto-Scaling Policy:**

```json
{
  "targetTrackingScalingPolicies": [
    {
      "policyName": "cpu-target-tracking",
      "targetTrackingScalingPolicyConfiguration": {
        "targetValue": 70.0,
        "predefinedMetricSpecification": {
          "predefinedMetricType": "ECSServiceAverageCPUUtilization"
        },
        "scaleInCooldown": 300,
        "scaleOutCooldown": 120
      }
    },
    {
      "policyName": "memory-target-tracking",
      "targetTrackingScalingPolicyConfiguration": {
        "targetValue": 75.0,
        "predefinedMetricSpecification": {
          "predefinedMetricType": "ECSServiceAverageMemoryUtilization"
        },
        "scaleInCooldown": 300,
        "scaleOutCooldown": 120
      }
    },
    {
      "policyName": "request-count-target-tracking",
      "targetTrackingScalingPolicyConfiguration": {
        "targetValue": 1000.0,
        "predefinedMetricSpecification": {
          "predefinedMetricType": "ALBRequestCountPerTarget",
          "resourceLabel": "app/hub4estate-alb/targetgroup/hub4estate-api/..."
        },
        "scaleInCooldown": 300,
        "scaleOutCooldown": 60
      }
    }
  ]
}
```

**Worker Service:**

| Setting | Value |
|---|---|
| Service | `hub4estate-worker-production` |
| CPU | 512 (0.5 vCPU) |
| Memory | 1024 MB (1 GB) |
| Desired Count | 1 |
| Min Tasks | 1 |
| Max Tasks | 4 |
| Health Check | Queue depth based (CloudWatch alarm) |
| Scaling | Scale on queue depth |

**ALB Configuration:**

```
Application Load Balancer: hub4estate-alb
  Listener 443 (HTTPS):
    Rule 1: Host=api.hub4estate.com → Target Group: hub4estate-api-tg
    Default: 404 fixed response

  Target Group: hub4estate-api-tg
    Protocol: HTTP
    Port: 3001
    Target Type: IP
    Health Check: /health (HTTP 200)
    Stickiness: Disabled (stateless API)
    Connection Draining: 60s
```

### 25.4.4 Database -- RDS PostgreSQL

| Setting | Value |
|---|---|
| Engine | PostgreSQL 15.6 |
| Instance Class | db.r6g.large (2 vCPU, 16 GB RAM) |
| Storage | 100 GB gp3, autoscaling up to 500 GB |
| IOPS | 3000 (baseline gp3) |
| Multi-AZ | Yes (standby in ap-south-1b) |
| Backup Retention | 7 days automated, 30 days manual snapshots |
| Backup Window | 02:00-03:00 IST (20:30-21:30 UTC) |
| Maintenance Window | Sun 03:00-04:00 IST |
| Encryption | AES-256 (AWS KMS managed key) |
| Performance Insights | Enabled (7 days free retention) |
| Enhanced Monitoring | Enabled (60s granularity) |
| Parameter Group | Custom: `hub4estate-pg15` |
| Publicly Accessible | No |
| VPC | `hub4estate-vpc`, private subnets only |
| Security Group | `hub4estate-rds-sg` (ingress from ECS SG only, port 5432) |

**Custom Parameter Group:**

```
shared_preload_libraries = pg_stat_statements
log_min_duration_statement = 500         # Log queries > 500ms
max_connections = 200
work_mem = 16MB
maintenance_work_mem = 256MB
effective_cache_size = 12GB
random_page_cost = 1.1                   # SSD storage
```

**Read Replica (Phase 2):**

When read traffic exceeds 60% of primary capacity:
- Deploy a single read replica (db.r6g.large).
- Route analytics/reporting queries to replica.
- Use Prisma's `$extends` for read/write splitting.

### 25.4.5 Redis -- ElastiCache

| Setting | Value |
|---|---|
| Engine | Redis 7.1 |
| Node Type | cache.t3.micro (Phase 1), cache.t3.small (Phase 2) |
| Nodes | 1 (Phase 1), 2 with failover (Phase 2) |
| Multi-AZ | No (Phase 1), Yes (Phase 2) |
| Encryption at Rest | Yes (AWS managed key) |
| Encryption in Transit | Yes (TLS) |
| Auth Token | Yes (via Secrets Manager) |
| Eviction Policy | allkeys-lru |
| Max Memory | 512 MB (t3.micro) |
| Snapshot | Daily, 3-day retention |
| Maintenance Window | Sun 04:00-05:00 IST |

### 25.4.6 Elasticsearch

| Setting | Value |
|---|---|
| Service | Amazon OpenSearch (Elasticsearch compatible) |
| Instance | t3.medium.search (Phase 1) |
| Nodes | 1 (Phase 1), 2 (Phase 2) |
| Storage | 50 GB gp3 |
| Version | OpenSearch 2.11 (ES 7.x compatible) |
| Access | VPC-based (private subnet) |
| Encryption | At rest + in transit |
| Fine-grained Access | Enabled |
| Snapshot | Automated hourly |

### 25.4.7 S3 Storage

**Buckets:**

| Bucket | Purpose | Lifecycle | Access |
|---|---|---|---|
| `hub4estate-uploads-prod` | Product images, profile photos | Standard to IA after 90 days | CloudFront CDN |
| `hub4estate-documents-prod` | KYC docs, contracts, invoices | Standard to IA after 30 days, Glacier after 365 days | Signed URLs only |
| `hub4estate-backups-prod` | DB dumps, exports | Standard to IA after 7 days, Glacier after 30 days | Private, no public access |
| `hub4estate-logs-prod` | ALB access logs, CloudTrail | Standard, delete after 90 days | Private |

**CloudFront Distribution:**

```
Origin: hub4estate-uploads-prod.s3.ap-south-1.amazonaws.com
Domain: cdn.hub4estate.com
Price Class: PriceClass_200 (Asia, Europe, North America)
Cache Policy: CachingOptimized (TTL 86400s)
Origin Access Identity: Enabled (S3 bucket not publicly accessible)
Compress: Yes (gzip, br)
Viewer Protocol: HTTPS only
SSL Certificate: ACM (*.hub4estate.com)
```

---

## 25.5 Terraform Infrastructure as Code

### 25.5.1 Directory Structure

```
infrastructure/
├── terraform/
│   ├── environments/
│   │   ├── staging/
│   │   │   ├── main.tf                 # Staging-specific overrides
│   │   │   ├── terraform.tfvars        # Staging variable values
│   │   │   └── backend.tf              # S3 backend for staging state
│   │   └── production/
│   │       ├── main.tf                 # Production-specific overrides
│   │       ├── terraform.tfvars        # Production variable values
│   │       └── backend.tf              # S3 backend for production state
│   ├── modules/
│   │   ├── vpc/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── rds/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── elasticache/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── ecs/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   └── task-definitions/
│   │   │       ├── api.json.tpl
│   │   │       └── worker.json.tpl
│   │   ├── s3/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── cloudfront/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── alb/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── ecr/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── iam/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── secrets/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   └── monitoring/
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       └── outputs.tf
│   ├── main.tf                         # Root module
│   ├── variables.tf                    # Root variables
│   ├── outputs.tf                      # Root outputs
│   ├── providers.tf                    # AWS provider config
│   └── versions.tf                     # Terraform + provider versions
```

### 25.5.2 Root Module (main.tf)

```hcl
# infrastructure/terraform/main.tf

terraform {
  required_version = ">= 1.7.0"
}

module "vpc" {
  source          = "./modules/vpc"
  environment     = var.environment
  vpc_cidr        = var.vpc_cidr
  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs
  tags            = local.common_tags
}

module "ecr" {
  source              = "./modules/ecr"
  repository_name     = "hub4estate-api"
  image_tag_mutability = "MUTABLE"
  scan_on_push        = true
  lifecycle_policy_count = 10
  tags                = local.common_tags
}

module "rds" {
  source                  = "./modules/rds"
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  subnet_ids              = module.vpc.private_subnet_ids
  instance_class          = var.rds_instance_class
  allocated_storage       = var.rds_allocated_storage
  max_allocated_storage   = var.rds_max_allocated_storage
  db_name                 = "hub4estate_${var.environment}"
  master_username         = var.rds_master_username
  multi_az                = var.environment == "production" ? true : false
  backup_retention        = var.environment == "production" ? 7 : 1
  allowed_security_groups = [module.ecs.ecs_security_group_id]
  tags                    = local.common_tags
}

module "elasticache" {
  source                  = "./modules/elasticache"
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  subnet_ids              = module.vpc.private_subnet_ids
  node_type               = var.redis_node_type
  num_cache_nodes         = var.environment == "production" ? 2 : 1
  allowed_security_groups = [module.ecs.ecs_security_group_id]
  tags                    = local.common_tags
}

module "s3" {
  source      = "./modules/s3"
  environment = var.environment
  buckets = {
    uploads   = { versioning = true,  lifecycle_ia_days = 90,  lifecycle_glacier_days = null }
    documents = { versioning = true,  lifecycle_ia_days = 30,  lifecycle_glacier_days = 365 }
    backups   = { versioning = false, lifecycle_ia_days = 7,   lifecycle_glacier_days = 30 }
    logs      = { versioning = false, lifecycle_ia_days = null, lifecycle_glacier_days = null, expiration_days = 90 }
  }
  tags = local.common_tags
}

module "cloudfront" {
  source              = "./modules/cloudfront"
  environment         = var.environment
  s3_uploads_bucket   = module.s3.bucket_arns["uploads"]
  s3_uploads_domain   = module.s3.bucket_regional_domains["uploads"]
  acm_certificate_arn = var.acm_certificate_arn
  domain_aliases      = ["cdn.hub4estate.com"]
  tags                = local.common_tags
}

module "alb" {
  source              = "./modules/alb"
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  acm_certificate_arn = var.acm_certificate_arn
  health_check_path   = "/health"
  tags                = local.common_tags
}

module "ecs" {
  source               = "./modules/ecs"
  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  alb_target_group_arn = module.alb.target_group_arn
  ecr_repository_url   = module.ecr.repository_url
  api_cpu              = var.ecs_api_cpu
  api_memory           = var.ecs_api_memory
  api_desired_count    = var.ecs_api_desired_count
  api_min_count        = var.ecs_api_min_count
  api_max_count        = var.ecs_api_max_count
  worker_cpu           = var.ecs_worker_cpu
  worker_memory        = var.ecs_worker_memory
  worker_desired_count = var.ecs_worker_desired_count
  secrets_arn          = module.secrets.secrets_arn
  database_url         = module.rds.connection_string
  redis_url            = module.elasticache.connection_string
  elasticsearch_url    = var.elasticsearch_url
  tags                 = local.common_tags
}

module "iam" {
  source             = "./modules/iam"
  environment        = var.environment
  ecs_task_role_name = "hub4estate-ecs-task-${var.environment}"
  s3_bucket_arns     = values(module.s3.bucket_arns)
  secrets_arn        = module.secrets.secrets_arn
  tags               = local.common_tags
}

module "secrets" {
  source      = "./modules/secrets"
  environment = var.environment
  secrets = {
    "hub4estate/${var.environment}/database-url"      = "placeholder"
    "hub4estate/${var.environment}/redis-auth-token"   = "placeholder"
    "hub4estate/${var.environment}/jwt-secret"          = "placeholder"
    "hub4estate/${var.environment}/jwt-refresh-secret"  = "placeholder"
    "hub4estate/${var.environment}/razorpay-key-id"    = "placeholder"
    "hub4estate/${var.environment}/razorpay-secret"    = "placeholder"
    "hub4estate/${var.environment}/claude-api-key"     = "placeholder"
    "hub4estate/${var.environment}/sentry-dsn"         = "placeholder"
  }
  tags = local.common_tags
}

module "monitoring" {
  source                     = "./modules/monitoring"
  environment                = var.environment
  ecs_cluster_name           = module.ecs.cluster_name
  ecs_service_name           = module.ecs.api_service_name
  rds_instance_id            = module.rds.instance_id
  alb_arn_suffix             = module.alb.arn_suffix
  target_group_arn_suffix    = module.alb.target_group_arn_suffix
  sns_alarm_topic_arn        = var.sns_alarm_topic_arn
  tags                       = local.common_tags
}

locals {
  common_tags = {
    Project     = "hub4estate"
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = "shreshth"
  }
}
```

### 25.5.3 Production terraform.tfvars

```hcl
# infrastructure/terraform/environments/production/terraform.tfvars

environment           = "production"
aws_region            = "ap-south-1"
vpc_cidr              = "10.0.0.0/16"
availability_zones    = ["ap-south-1a", "ap-south-1b"]
private_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
public_subnet_cidrs   = ["10.0.101.0/24", "10.0.102.0/24"]

rds_instance_class        = "db.r6g.large"
rds_allocated_storage     = 100
rds_max_allocated_storage = 500

redis_node_type = "cache.t3.micro"

ecs_api_cpu           = 1024
ecs_api_memory        = 2048
ecs_api_desired_count = 2
ecs_api_min_count     = 2
ecs_api_max_count     = 8

ecs_worker_cpu           = 512
ecs_worker_memory        = 1024
ecs_worker_desired_count = 1
```

### 25.5.4 Monitoring Module (CloudWatch Alarms)

```hcl
# infrastructure/terraform/modules/monitoring/main.tf

resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "hub4estate-${var.environment}-ecs-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_actions       = [var.sns_alarm_topic_arn]
  ok_actions          = [var.sns_alarm_topic_arn]
  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  alarm_name          = "hub4estate-${var.environment}-ecs-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 85
  alarm_actions       = [var.sns_alarm_topic_arn]
  ok_actions          = [var.sns_alarm_topic_arn]
  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "hub4estate-${var.environment}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_actions       = [var.sns_alarm_topic_arn]
  ok_actions          = [var.sns_alarm_topic_arn]
  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "rds_storage_low" {
  alarm_name          = "hub4estate-${var.environment}-rds-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10737418240   # 10 GB in bytes
  alarm_actions       = [var.sns_alarm_topic_arn]
  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "rds_connections_high" {
  alarm_name          = "hub4estate-${var.environment}-rds-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 150
  alarm_actions       = [var.sns_alarm_topic_arn]
  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx_high" {
  alarm_name          = "hub4estate-${var.environment}-alb-5xx-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_actions       = [var.sns_alarm_topic_arn]
  treat_missing_data  = "notBreaching"
  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "alb_unhealthy_hosts" {
  alarm_name          = "hub4estate-${var.environment}-unhealthy-hosts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_actions       = [var.sns_alarm_topic_arn]
  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "alb_latency_high" {
  alarm_name          = "hub4estate-${var.environment}-alb-latency-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  extended_statistic  = "p99"
  threshold           = 2.0
  alarm_actions       = [var.sns_alarm_topic_arn]
  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }
  tags = var.tags
}
```

---

## 25.6 Environment Variables

### 25.6.1 Complete Environment Variable Reference

```bash
# .env.example
# Hub4Estate Platform -- Environment Configuration
# NEVER commit .env files. Copy to .env and fill in values.

# ── Core Application ──────────────────────────
NODE_ENV=development                     # development | staging | production | test
PORT=3001                                # API server port
API_VERSION=v1                           # API version prefix
APP_NAME=hub4estate                      # Application name for logging
LOG_LEVEL=info                           # debug | info | warn | error
CORS_ORIGINS=http://localhost:3000       # Comma-separated allowed origins

# ── Database (PostgreSQL via Prisma) ──────────
DATABASE_URL=postgresql://hub4estate:hub4estate_dev@localhost:5432/hub4estate_dev
DATABASE_POOL_SIZE=10                    # Prisma connection pool size (prod: 20)
DATABASE_TIMEOUT=10000                   # Connection timeout in ms

# ── Redis ─────────────────────────────────────
REDIS_URL=redis://localhost:6379         # Redis connection URL
REDIS_KEY_PREFIX=h4e:                    # Key namespace prefix
REDIS_DEFAULT_TTL=3600                   # Default cache TTL in seconds

# ── Elasticsearch ─────────────────────────────
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX_PREFIX=hub4estate

# ── Authentication (JWT) ──────────────────────
JWT_SECRET=                              # Min 32 chars. Use: openssl rand -hex 32
JWT_REFRESH_SECRET=                      # Min 32 chars. Use: openssl rand -hex 32
JWT_ACCESS_EXPIRY=15m                    # Access token expiry
JWT_REFRESH_EXPIRY=7d                    # Refresh token expiry
JWT_ISSUER=hub4estate

# ── Authentication (Google OAuth) ─────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback

# ── Payments (Razorpay) ──────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_ACCOUNT_NUMBER=

# ── AI (Claude API) ──────────────────────────
CLAUDE_API_KEY=sk-ant-xxxx
CLAUDE_MODEL=claude-sonnet-4-20250514
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.3

# ── File Storage (S3) ────────────────────────
S3_BUCKET=hub4estate-uploads-dev
S3_REGION=ap-south-1
S3_ACCESS_KEY_ID=                        # Local dev only; use IAM roles in prod
S3_SECRET_ACCESS_KEY=                    # Local dev only
S3_ENDPOINT=http://localhost:9000        # MinIO for local; omit for AWS
CDN_URL=                                 # e.g., https://cdn.hub4estate.com

# ── Email (Resend) ───────────────────────────
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=noreply@hub4estate.com
RESEND_FROM_NAME=Hub4Estate

# ── SMS (MSG91) ──────────────────────────────
MSG91_AUTH_KEY=
MSG91_SENDER_ID=H4ESTB
MSG91_TEMPLATE_OTP=
MSG91_TEMPLATE_ORDER_CONFIRM=
MSG91_TEMPLATE_BID_UPDATE=

# ── WhatsApp (Gupshup) ──────────────────────
GUPSHUP_API_KEY=
GUPSHUP_APP_NAME=Hub4Estate
GUPSHUP_SOURCE_NUMBER=

# ── Error Tracking (Sentry) ─────────────────
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=                          # Auto-set in CI from git SHA
SENTRY_TRACES_SAMPLE_RATE=0.1           # 0-1 (10% in prod)
SENTRY_PROFILES_SAMPLE_RATE=0.1

# ── Analytics (PostHog) ─────────────────────
POSTHOG_API_KEY=phc_xxxx
POSTHOG_HOST=https://app.posthog.com

# ── Frontend-Specific (VITE_ prefix) ────────
VITE_BACKEND_API_URL=http://localhost:3001/api
VITE_SENTRY_DSN=
VITE_POSTHOG_KEY=phc_xxxx
VITE_POSTHOG_HOST=https://app.posthog.com
VITE_APP_VERSION=

# ── Rate Limiting ────────────────────────────
RATE_LIMIT_WINDOW_MS=60000              # 1 minute
RATE_LIMIT_MAX_REQUESTS=100             # General
RATE_LIMIT_AUTH_MAX=10                  # Auth attempts
RATE_LIMIT_SEARCH_MAX=30               # Search requests
RATE_LIMIT_BID_MAX=10                  # Bid submissions

# ── Feature Flags ────────────────────────────
FF_BLIND_BIDDING=true
FF_AI_ASSISTANT=true
FF_ESCROW_PAYMENTS=false
FF_SERVICE_MARKETPLACE=false
FF_PRICE_PREDICTION=false
FF_WHATSAPP_NOTIFICATIONS=false
FF_DEALER_SELF_ONBOARDING=true
FF_ADVANCED_ANALYTICS=false
FF_MULTI_CITY=false

# ── Background Jobs (BullMQ) ────────────────
BULL_REDIS_URL=redis://localhost:6379
BULL_CONCURRENCY=5
BULL_MAX_RETRIES=3
BULL_RETRY_DELAY=5000

# ── Security ─────────────────────────────────
BCRYPT_ROUNDS=12                        # 12 for prod, 4 for test
ENCRYPTION_KEY=                         # AES-256 key for sensitive fields
OTP_EXPIRY_MINUTES=10
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp,pdf,csv,xlsx
MAX_FILE_SIZE_MB=10

# ── Scraping / Data Pipeline ────────────────
SCRAPER_CRON=0 2 * * *                  # 2 AM IST
SCRAPER_CONCURRENT_LIMIT=3
SCRAPER_REQUEST_DELAY_MS=2000
SCRAPER_USER_AGENT=Hub4EstateBot/1.0
```

### 25.6.2 Environment Variable Validation

```typescript
// packages/api/src/config/env.ts

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('hub4estate'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),
  DATABASE_TIMEOUT: z.coerce.number().default(10000),

  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_KEY_PREFIX: z.string().default('h4e:'),
  REDIS_DEFAULT_TTL: z.coerce.number().default(3600),

  ELASTICSEARCH_URL: z.string().default('http://localhost:9200'),
  ELASTICSEARCH_INDEX_PREFIX: z.string().default('hub4estate'),

  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  JWT_ISSUER: z.string().default('hub4estate'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  CLAUDE_API_KEY: z.string().optional(),
  CLAUDE_MODEL: z.string().default('claude-sonnet-4-20250514'),
  CLAUDE_MAX_TOKENS: z.coerce.number().default(4096),

  S3_BUCKET: z.string().default('hub4estate-uploads-dev'),
  S3_REGION: z.string().default('ap-south-1'),
  S3_ENDPOINT: z.string().optional(),
  CDN_URL: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default('noreply@hub4estate.com'),

  MSG91_AUTH_KEY: z.string().optional(),
  GUPSHUP_API_KEY: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),

  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().default('https://app.posthog.com'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(10),

  FF_BLIND_BIDDING: z.coerce.boolean().default(true),
  FF_AI_ASSISTANT: z.coerce.boolean().default(true),
  FF_ESCROW_PAYMENTS: z.coerce.boolean().default(false),
  FF_SERVICE_MARKETPLACE: z.coerce.boolean().default(false),
  FF_PRICE_PREDICTION: z.coerce.boolean().default(false),
  FF_WHATSAPP_NOTIFICATIONS: z.coerce.boolean().default(false),
  FF_DEALER_SELF_ONBOARDING: z.coerce.boolean().default(true),

  BULL_CONCURRENCY: z.coerce.number().default(5),
  BULL_MAX_RETRIES: z.coerce.number().default(3),

  BCRYPT_ROUNDS: z.coerce.number().default(12),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues.map(
      (issue) => `  ${issue.path.join('.')}: ${issue.message}`
    );
    console.error('Environment validation failed:');
    console.error(missing.join('\n'));
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
```

---

## 25.7 Rollback Strategy

### 25.7.1 Frontend Rollback (Vercel)

**Time to rollback: < 30 seconds**

Vercel maintains immutable deployments. Every deploy has a unique, addressable URL. Rolling back is instant.

**Procedure:**

1. Open Vercel Dashboard > hub4estate > Deployments.
2. Find the last known good deployment.
3. Click the three-dot menu > "Promote to Production."
4. Traffic routes instantly to the previous deployment.

**CLI alternative:**

```bash
vercel ls hub4estate --limit 10
vercel promote <deployment-url> --scope hub4estate
```

### 25.7.2 Backend Rollback (ECS Blue-Green)

**Time to rollback: < 5 minutes**

ECS with CodeDeploy keeps the previous task set alive during deployment.

**During deployment (within the traffic-shift window):**

```bash
aws deploy stop-deployment \
  --deployment-id <deployment-id> \
  --auto-rollback-enabled
```

**After deployment completed:**

```bash
PREVIOUS_TASK_DEF=$(aws ecs describe-services \
  --cluster hub4estate-production \
  --services hub4estate-api-production \
  --query 'services[0].taskDefinition' \
  --output text)

CURRENT_REV=$(echo $PREVIOUS_TASK_DEF | grep -o '[0-9]*$')
ROLLBACK_REV=$((CURRENT_REV - 1))

aws ecs update-service \
  --cluster hub4estate-production \
  --service hub4estate-api-production \
  --task-definition "hub4estate-api-production:$ROLLBACK_REV" \
  --force-new-deployment
```

**CodeDeploy auto-rollback triggers:**

| Trigger | CloudWatch Alarm | Action |
|---|---|---|
| Deploy failure | (automatic) | CodeDeploy reverts |
| 5xx spike | `alb-5xx-high` | CodeDeploy reverts |
| Unhealthy hosts | `unhealthy-hosts` | CodeDeploy reverts |

### 25.7.3 Database Rollback

**Policy: Forward-migrate only. Never roll back migrations.**

All migrations must be backward-compatible. Use the expand-contract pattern:

| Step | Migration | App Deploy | State |
|---|---|---|---|
| 1 | Add new column (nullable) | No change needed | Both columns exist |
| 2 | No migration | Deploy dual-write code | Writes to both columns |
| 3 | Backfill migration | No change needed | All data in both columns |
| 4 | No migration | Deploy code reading new column only | New column is source of truth |
| 5 | Drop old column | No change needed | Clean state |

**Emergency data recovery:** Restore from the pre-deploy RDS snapshot (created automatically by CI).

### 25.7.4 Feature Flags as Kill Switches

Every major feature has a flag toggled via Redis without deployment:

```typescript
// packages/api/src/config/featureFlags.ts

import { env } from './env';
import { redisClient } from '../lib/redis';

interface FeatureFlags {
  blindBidding: boolean;
  aiAssistant: boolean;
  escrowPayments: boolean;
  serviceMarketplace: boolean;
  pricePrediction: boolean;
  whatsappNotifications: boolean;
  dealerSelfOnboarding: boolean;
  advancedAnalytics: boolean;
  multiCity: boolean;
}

const defaultFlags: FeatureFlags = {
  blindBidding: env.FF_BLIND_BIDDING,
  aiAssistant: env.FF_AI_ASSISTANT,
  escrowPayments: env.FF_ESCROW_PAYMENTS,
  serviceMarketplace: env.FF_SERVICE_MARKETPLACE,
  pricePrediction: env.FF_PRICE_PREDICTION,
  whatsappNotifications: env.FF_WHATSAPP_NOTIFICATIONS,
  dealerSelfOnboarding: env.FF_DEALER_SELF_ONBOARDING,
  advancedAnalytics: env.FF_ADVANCED_ANALYTICS,
  multiCity: env.FF_MULTI_CITY,
};

const REDIS_KEY = 'h4e:feature_flags';

export async function getFeatureFlag(flag: keyof FeatureFlags): Promise<boolean> {
  try {
    const override = await redisClient.hget(REDIS_KEY, flag);
    if (override !== null) return override === 'true';
  } catch {
    // Redis unavailable -- fall back to env defaults
  }
  return defaultFlags[flag];
}

export async function setFeatureFlag(flag: keyof FeatureFlags, enabled: boolean): Promise<void> {
  await redisClient.hset(REDIS_KEY, flag, String(enabled));
}

export function requireFeature(flag: keyof FeatureFlags) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const enabled = await getFeatureFlag(flag);
    if (!enabled) {
      return res.status(404).json({ error: 'Feature not available', code: 'FEATURE_DISABLED' });
    }
    next();
  };
}
```

**Kill switch procedure:** Admin panel > Feature Flags > toggle OFF. Propagates via Redis in < 1 second. No deployment required.

---

## 25.8 Post-Deploy Monitoring

### 25.8.1 Automated Smoke Tests

| Check | Method | Pass Criteria | Failure Action |
|---|---|---|---|
| Liveness | `GET /health` | HTTP 200 within 60s | Auto-rollback |
| Readiness | `GET /health/ready` | All deps "ok" | Alert P1, evaluate rollback |
| Catalog API | `GET /api/v1/catalog/categories` | HTTP 200, non-empty | Alert P1 |
| Search API | `GET /api/v1/catalog/search?q=mcb` | HTTP 200 | Alert P2 |
| Version | `GET /api/v1/version` | Matches deployed SHA | Alert P1 |
| Sentry | Sentry API query | < 5 new errors in 5 min | Alert P2 |

### 25.8.2 Post-Deploy Monitoring Window (30 minutes)

**T+0 to T+5 min:** Verify smoke tests passed. Check Sentry for new errors. Open Grafana latency dashboard.

**T+5 to T+15 min:** Monitor error rate (< 0.1%). Check ECS CPU/memory (< 60%). Verify no 5xx spike in ALB metrics. Spot-check one critical flow manually.

**T+15 to T+30 min:** Confirm no customer-facing issues. Verify background jobs processing. Check Redis cache hit rate (> 80%). Mark deploy stable in Slack.

### 25.8.3 Auto-Rollback Triggers

| Trigger | Alarm | Threshold | Action |
|---|---|---|---|
| 5xx spike | `alb-5xx-high` | > 10 errors in 60s | CodeDeploy auto-rollback |
| Unhealthy hosts | `unhealthy-hosts` | > 0 | CodeDeploy auto-rollback |
| High latency | `alb-latency-high` | p99 > 2s for 3 min | Alert P1 + manual decision |
| Health check fail | ALB health check | 3 consecutive failures | ECS replaces task |

---

---

# SECTION 26 -- MONITORING, OBSERVABILITY & ALERTING

If you cannot measure it, you cannot improve it. If you cannot alert on it, you cannot fix it before users notice.

---

## 26.1 Observability Stack

### 26.1.1 Tool Selection

| Tool | Purpose | Tier | Monthly Cost | Why This Tool |
|---|---|---|---|---|
| **Sentry** | Error tracking, performance | Team | $26/mo | Best-in-class error grouping, stack traces, release tracking for JS/TS |
| **PostHog** | Product analytics, session replay, flags | Self-hosted (free) | $0 | Open-source, self-hostable, combines analytics + replay + flags |
| **Grafana Cloud** | Infrastructure dashboards | Free tier | $0 | Industry-standard. Free tier: 10K metrics, 50GB logs |
| **CloudWatch** | AWS infrastructure metrics | Standard | ~$15/mo | Native AWS integration for ECS/RDS/ALB. Cannot avoid. |
| **BetterUptime** | External uptime, status page | Starter | $20/mo | Clean status page, 60s checks from multiple regions |
| **PagerDuty** | On-call management, escalation | Free | $0 | Free for up to 5 users. Essential for alert routing. |
| **Total** | | | **~$61/mo** | |

### 26.1.2 Data Flow

```
Application Code
  │
  ├──> Sentry SDK ──────────────────────> Sentry Cloud
  │     (errors, transactions,             (error grouping, alerts,
  │      performance traces)                release tracking)
  │
  ├──> Structured Logger ───────────────> CloudWatch Logs ──> Grafana Cloud
  │     (JSON logs via winston)            (log storage)       (dashboards)
  │
  ├──> PostHog SDK ─────────────────────> PostHog (self-hosted)
  │     (events, user identification,      (funnels, cohorts,
  │      feature flag checks)               session replay)
  │
  ├──> Custom Metrics ──────────────────> CloudWatch Metrics ──> Grafana Cloud
  │     (business metrics via               (metric storage)      (dashboards)
  │      CloudWatch PutMetricData)
  │
  └──> Health Endpoints ────────────────> BetterUptime
        (/health, /health/ready)           (uptime monitoring,
                                            status page)

CloudWatch Alarms ──────────────────────> PagerDuty ──> Slack / SMS / Phone
  (threshold breaches)                     (routing,     (notification
                                            escalation)   delivery)
```

### 26.1.3 Integration Architecture

```typescript
// packages/api/src/lib/observability/index.ts

import * as Sentry from '@sentry/node';
import { PostHog } from 'posthog-node';
import { CloudWatch } from '@aws-sdk/client-cloudwatch';
import { logger } from '../logger';
import { env } from '../../config/env';

export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    logger.warn('Sentry DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV,
    release: env.SENTRY_RELEASE || `hub4estate-api@${process.env.npm_package_version}`,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
    profilesSampleRate: env.SENTRY_PROFILES_SAMPLE_RATE,

    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      if (event.request?.data) {
        const data = event.request.data as Record<string, unknown>;
        const sensitiveFields = ['password', 'token', 'secret', 'otp', 'pan', 'aadhaar', 'phone'];
        for (const field of sensitiveFields) {
          if (field in data) {
            (data as Record<string, string>)[field] = '[REDACTED]';
          }
        }
      }
      return event;
    },

    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'http' && breadcrumb.data?.url?.includes('/health')) {
        return null;
      }
      return breadcrumb;
    },

    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.prismaIntegration(),
    ],

    ignoreErrors: [
      'TokenExpiredError',
      'JsonWebTokenError',
      'ECONNRESET',
      'EPIPE',
    ],
  });

  logger.info('Sentry initialized', { environment: env.NODE_ENV });
}

let posthogClient: PostHog | null = null;

export function initPostHog(): PostHog | null {
  if (!env.POSTHOG_API_KEY) {
    logger.warn('PostHog API key not configured, analytics disabled');
    return null;
  }

  posthogClient = new PostHog(env.POSTHOG_API_KEY, {
    host: env.POSTHOG_HOST,
    flushAt: 20,
    flushInterval: 10000,
  });

  logger.info('PostHog initialized', { host: env.POSTHOG_HOST });
  return posthogClient;
}

export function getPostHog(): PostHog | null {
  return posthogClient;
}

const cloudwatch = new CloudWatch({ region: env.S3_REGION });

export async function putMetric(
  metricName: string,
  value: number,
  unit: 'Count' | 'Milliseconds' | 'Bytes' | 'Percent' = 'Count',
  dimensions: Record<string, string> = {}
): Promise<void> {
  if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
    logger.debug('CloudWatch metric (dev)', { metricName, value, unit });
    return;
  }

  try {
    await cloudwatch.putMetricData({
      Namespace: `Hub4Estate/${env.NODE_ENV}`,
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Timestamp: new Date(),
          Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })),
        },
      ],
    });
  } catch (error) {
    logger.error('Failed to put CloudWatch metric', { metricName, error });
  }
}

export async function shutdownObservability(): Promise<void> {
  await Sentry.close(2000);
  if (posthogClient) {
    await posthogClient.shutdown();
  }
  logger.info('Observability services shut down');
}
```

---

## 26.2 Error Tracking (Sentry)

### 26.2.1 Sentry Project Structure

| Project | Platform | Coverage |
|---|---|---|
| `hub4estate-api-production` | Node.js | Backend API + workers |
| `hub4estate-api-staging` | Node.js | Staging backend |
| `hub4estate-web-production` | JavaScript (React) | Frontend app |
| `hub4estate-web-staging` | JavaScript (React) | Staging frontend |
| `hub4estate-mobile` | React Native | Mobile app (Phase 2) |

### 26.2.2 Frontend Sentry Configuration

```typescript
// packages/web/src/lib/sentry.ts

import * as Sentry from '@sentry/react';

export function initSentryWeb(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        maskAllInputs: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    beforeSend(event) {
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.data?.url) {
            breadcrumb.data.url = breadcrumb.data.url.replace(/token=[^&]+/g, 'token=[REDACTED]');
          }
          return breadcrumb;
        });
      }
      return event;
    },

    denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i],
  });
}
```

### 26.2.3 Sentry Alert Rules

| Alert Name | Condition | Frequency | Severity | Notification Channel |
|---|---|---|---|---|
| Error Spike (P0) | > 50 errors in 5 minutes | Real-time | P0 | PagerDuty (phone) + Slack #incidents |
| Error Spike (P1) | > 10 errors in 5 minutes | Real-time | P1 | PagerDuty (push) + Slack #alerts |
| Payment Error | Any error tagged `module:payments` | Real-time | P1 | PagerDuty + Slack #payments |
| Auth Error Spike | > 20 auth errors in 10 minutes | Real-time | P2 | Slack #security |
| New Unhandled Error | First occurrence of unhandled exception | Real-time | P2 | Slack #alerts |
| Regression | Previously resolved issue re-occurs | Real-time | P2 | Slack #alerts |
| Performance Degradation | p95 transaction time > 2x baseline | Hourly | P2 | Slack #performance |
| High Error Rate | Error rate > 1% of transactions | 15-min | P1 | PagerDuty + Slack #alerts |
| Unresolved Error Aging | Unresolved error > 48 hours old | Daily 9 AM IST | P3 | Slack #engineering |

### 26.2.4 Sentry Context Enrichment

```typescript
// packages/api/src/middleware/sentryContext.middleware.ts

import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';

export function sentryContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.user) {
    Sentry.setUser({
      id: req.user.id,
      email: req.user.email,
      segment: req.user.role,
    });
  }

  Sentry.setContext('request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  Sentry.setTag('api_version', 'v1');
  Sentry.setTag('module', extractModule(req.path));
  Sentry.getCurrentScope().setTransactionName(`${req.method} ${req.route?.path || req.path}`);

  next();
}

function extractModule(path: string): string {
  const segments = path.split('/').filter(Boolean);
  return segments[2] || 'unknown';
}
```

### 26.2.5 Error Categorization

```typescript
// packages/api/src/lib/errors.ts

export enum ErrorCode {
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  INSUFFICIENT_PERMISSIONS = 'AUTH_003',
  ACCOUNT_LOCKED = 'AUTH_004',

  VALIDATION_ERROR = 'VAL_001',
  INVALID_FILE_TYPE = 'VAL_002',
  FILE_TOO_LARGE = 'VAL_003',

  BID_ALREADY_AWARDED = 'BID_001',
  BID_EXPIRED = 'BID_002',
  BID_LIMIT_EXCEEDED = 'BID_003',
  INSUFFICIENT_INVENTORY = 'INV_001',
  DEALER_NOT_VERIFIED = 'DLR_001',

  PAYMENT_FAILED = 'PAY_001',
  ESCROW_INSUFFICIENT = 'PAY_002',
  REFUND_FAILED = 'PAY_003',
  WEBHOOK_SIGNATURE_INVALID = 'PAY_004',

  RAZORPAY_ERROR = 'EXT_001',
  CLAUDE_API_ERROR = 'EXT_002',
  S3_UPLOAD_ERROR = 'EXT_003',
  SMS_SEND_ERROR = 'EXT_004',
  EMAIL_SEND_ERROR = 'EXT_005',

  DATABASE_ERROR = 'SYS_001',
  REDIS_ERROR = 'SYS_002',
  ELASTICSEARCH_ERROR = 'SYS_003',
  RATE_LIMIT_EXCEEDED = 'SYS_004',
  INTERNAL_ERROR = 'SYS_999',
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly metadata: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    isOperational = true,
    metadata: Record<string, unknown> = {}
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.metadata = metadata;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id ${id}` : ''} not found`, 404, ErrorCode.VALIDATION_ERROR, true, { resource, id });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, ErrorCode.INVALID_CREDENTIALS);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}

export class PaymentError extends AppError {
  constructor(message: string, metadata: Record<string, unknown> = {}) {
    super(message, 402, ErrorCode.PAYMENT_FAILED, true, metadata);
  }
}
```

---

## 26.3 Application Metrics

### 26.3.1 Business Metrics

| Metric | Description | Source | Alert Threshold |
|---|---|---|---|
| `gmv_daily` | Gross Merchandise Value (total order value) | Orders table | < 50% of 7-day average |
| `active_users_daily` | Unique users with at least 1 request | API logs | < 30% of 7-day average |
| `signups_daily` | New user registrations | Auth events | None (informational) |
| `inquiries_created` | New bid/inquiry requests | Bids table | < 50% of 7-day average |
| `inquiries_responded` | Bids with at least 1 dealer response | Bids table | None |
| `inquiry_conversion_rate` | % of inquiries resulting in an order | Bids + Orders | < 10% |
| `average_savings_percent` | Average savings vs. MRP | Orders table | None (informational) |
| `dealer_active_count` | Dealers who submitted >= 1 bid in 7 days | Bid responses | < 50% of verified dealers |
| `mrr` | Monthly Recurring Revenue | Payments table | < 80% of previous month |
| `average_order_value` | Mean order value in INR | Orders table | None |
| `bid_fill_rate` | % of bids receiving >= 3 responses | Bids table | < 40% |
| `time_to_first_response` | Median time from bid creation to first response | Bid lifecycle | > 4 hours |
| `nps_score` | Net Promoter Score from surveys | Surveys | < 30 |

**Business metric collection job:**

```typescript
// packages/api/src/jobs/businessMetrics.job.ts

import { Queue, Worker, Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import { putMetric } from '../lib/observability';
import { logger } from '../lib/logger';

const QUEUE_NAME = 'business-metrics';

export const businessMetricsQueue = new Queue(QUEUE_NAME, {
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    repeat: { pattern: '*/15 * * * *' },  // Every 15 minutes
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const businessMetricsWorker = new Worker(
  QUEUE_NAME,
  async (_job: Job) => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const activeUsers = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: oneDayAgo } },
    });
    await putMetric('ActiveUsersDaily', activeUsers.length, 'Count');

    const inquiries = await prisma.bid.count({
      where: { createdAt: { gte: oneDayAgo } },
    });
    await putMetric('InquiriesCreated', inquiries, 'Count');

    const gmv = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: oneDayAgo },
        status: { in: ['CONFIRMED', 'DELIVERED', 'COMPLETED'] },
      },
    });
    await putMetric('GMVDaily', Number(gmv._sum.totalAmount || 0), 'Count');

    const bidsWithResponses = await prisma.bid.count({
      where: { createdAt: { gte: oneDayAgo }, bidResponses: { some: {} } },
    });
    const totalBids = await prisma.bid.count({ where: { createdAt: { gte: oneDayAgo } } });
    const fillRate = totalBids > 0 ? (bidsWithResponses / totalBids) * 100 : 0;
    await putMetric('BidFillRate', fillRate, 'Percent');

    logger.info('Business metrics collected', {
      activeUsers: activeUsers.length, inquiries,
      gmv: Number(gmv._sum.totalAmount || 0), fillRate,
    });
  },
  { connection: { url: process.env.REDIS_URL }, concurrency: 1 }
);
```

### 26.3.2 Technical Metrics

| Metric | Target | Alert Threshold | Source |
|---|---|---|---|
| API Latency (p50) | < 100ms | -- | Sentry transactions |
| API Latency (p95) | < 300ms | > 500ms | Sentry transactions |
| API Latency (p99) | < 500ms | > 1000ms | Sentry transactions |
| Error Rate | < 0.1% | > 0.5% | Sentry + CloudWatch |
| 5xx Rate | 0% | > 0.1% | ALB metrics |
| DB Query Time (p95) | < 50ms | > 100ms | Prisma metrics |
| DB Connection Pool | < 70% utilized | > 85% | Prisma metrics |
| Redis Latency (p95) | < 5ms | > 20ms | Redis INFO |
| Redis Hit Rate | > 90% | < 80% | Redis INFO |
| Redis Memory | < 70% | > 85% | ElastiCache metrics |
| ES Query Time (p95) | < 100ms | > 200ms | ES slow query log |
| Queue Depth | < 100 | > 500 | BullMQ metrics |
| Queue Processing Time | < 5s per job | > 30s average | BullMQ metrics |
| Failed Jobs | 0 | > 10 in 1 hour | BullMQ metrics |
| CPU Utilization | < 60% | > 80% for 5 min | CloudWatch ECS |
| Memory Utilization | < 70% | > 85% for 5 min | CloudWatch ECS |

**Request metrics middleware:**

```typescript
// packages/api/src/middleware/metrics.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { putMetric } from '../lib/observability';
import { logger } from '../lib/logger';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationNs = Number(process.hrtime.bigint() - start);
    const durationMs = durationNs / 1_000_000;
    const module = extractModule(req.path);

    logger.info('request_completed', {
      method: req.method,
      path: req.route?.path || req.path,
      statusCode: res.statusCode,
      duration: Math.round(durationMs),
      contentLength: res.get('content-length'),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      userId: (req as any).user?.id,
    });

    putMetric('RequestDuration', durationMs, 'Milliseconds', { Method: req.method, Module: module });
    putMetric('RequestCount', 1, 'Count', { Method: req.method, Module: module, StatusCode: String(res.statusCode) });

    if (res.statusCode >= 500) putMetric('ServerErrors', 1, 'Count', { Module: module });
    if (res.statusCode >= 400 && res.statusCode < 500) putMetric('ClientErrors', 1, 'Count', { Module: module });
  });

  next();
}

function extractModule(path: string): string {
  const match = path.match(/^\/api\/v\d+\/(\w+)/);
  return match?.[1] || 'other';
}
```

---

## 26.4 Structured Logging

### 26.4.1 Log Format

All logs are structured JSON. No `console.log` in production code.

**Standard log entry:**

```json
{
  "level": "info",
  "timestamp": "2026-04-08T10:23:45.123Z",
  "requestId": "req_a1b2c3d4e5f6",
  "userId": "usr_7g8h9i0j",
  "method": "POST",
  "path": "/api/v1/bids",
  "statusCode": 201,
  "duration": 142,
  "module": "bids",
  "message": "Bid created successfully",
  "meta": {
    "bidId": "bid_k1l2m3n4",
    "itemCount": 3,
    "deliveryCity": "Sri Ganganagar"
  }
}
```

**Error log entry:**

```json
{
  "level": "error",
  "timestamp": "2026-04-08T10:24:12.456Z",
  "requestId": "req_x9y8z7w6v5",
  "userId": "usr_7g8h9i0j",
  "method": "POST",
  "path": "/api/v1/payments/verify",
  "statusCode": 500,
  "duration": 3421,
  "module": "payments",
  "message": "Razorpay webhook verification failed",
  "error": {
    "name": "PaymentError",
    "code": "PAY_004",
    "message": "Invalid webhook signature",
    "stack": "PaymentError: Invalid webhook signature\n    at verifyWebhook ..."
  },
  "meta": {
    "razorpayOrderId": "order_abc123",
    "webhookEventType": "payment.captured"
  }
}
```

### 26.4.2 Logger Implementation

```typescript
// packages/api/src/lib/logger.ts

import winston from 'winston';
import { env } from '../config/env';

const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: env.APP_NAME, environment: env.NODE_ENV },
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === 'development' ? devFormat : structuredFormat,
    }),
  ],
  exitOnError: false,
});
```

### 26.4.3 Request Context Logger

```typescript
// packages/api/src/middleware/requestLogger.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger';
import { AsyncLocalStorage } from 'async_hooks';

export const requestContext = new AsyncLocalStorage<{
  requestId: string;
  userId?: string;
  method: string;
  path: string;
}>();

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || `req_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
  res.setHeader('x-request-id', requestId);

  const context = {
    requestId,
    userId: (req as any).user?.id,
    method: req.method,
    path: req.path,
  };

  requestContext.run(context, () => next());
}

export function getRequestLogger() {
  const context = requestContext.getStore();
  if (!context) return logger;
  return logger.child({
    requestId: context.requestId,
    userId: context.userId,
    method: context.method,
    path: context.path,
  });
}
```

### 26.4.4 Log Levels

| Level | When to Use | Examples |
|---|---|---|
| `error` | Something failed that should not have. Requires investigation. | Payment webhook failed, database connection lost |
| `warn` | Something unexpected but handled. May need attention. | Rate limit approached, cache miss on hot key |
| `info` | Normal operational events. Business-relevant actions. | Request completed, bid created, user registered |
| `debug` | Detailed diagnostic info. Only in development. | Query parameters, cache lookup result |

**By environment:**

| Environment | Level |
|---|---|
| Development | `debug` |
| Test | `warn` |
| Staging | `info` |
| Production | `info` |

### 26.4.5 PII Redaction Rules

PII must NEVER appear in logs, metrics, or error reports.

| Data Type | Pattern | Redaction |
|---|---|---|
| Phone number | `+91XXXXXXXXXX` | `***999` (last 3 digits) |
| Email | `user@domain.com` | `u***@domain.com` |
| PAN | `ABCDE1234F` | `[PAN:REDACTED]` |
| Aadhaar | `XXXX XXXX XXXX` | `[AADHAAR:REDACTED]` |
| Password | Any field named password/secret/token | `[REDACTED]` |
| JWT Token | `eyJ...` | `[JWT:REDACTED]` |
| API Key | `sk-ant-...`, `rzp_...`, `re_...` | `[API_KEY:REDACTED]` |
| GST Number | `XXAAAAA0000A1Z5` | `[GST:REDACTED]` |
| Bank Account | Numeric, 9-18 digits | `[BANK_ACCT:REDACTED]` |

```typescript
// packages/api/src/lib/redact.ts

const REDACTION_PATTERNS: Array<{ field: RegExp; replacement: string }> = [
  { field: /password/i, replacement: '[REDACTED]' },
  { field: /secret/i, replacement: '[REDACTED]' },
  { field: /token/i, replacement: '[REDACTED]' },
  { field: /authorization/i, replacement: '[REDACTED]' },
  { field: /cookie/i, replacement: '[REDACTED]' },
  { field: /apiKey/i, replacement: '[API_KEY:REDACTED]' },
  { field: /pan$/i, replacement: '[PAN:REDACTED]' },
  { field: /aadhaar/i, replacement: '[AADHAAR:REDACTED]' },
  { field: /gst/i, replacement: '[GST:REDACTED]' },
  { field: /accountNumber/i, replacement: '[BANK_ACCT:REDACTED]' },
  { field: /otp/i, replacement: '[REDACTED]' },
];

export function redactSensitiveFields(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const pattern = REDACTION_PATTERNS.find((p) => p.field.test(key));
    if (pattern) { redacted[key] = pattern.replacement; continue; }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      redacted[key] = redactSensitiveFields(value as Record<string, unknown>); continue;
    }
    if (typeof value === 'string') { redacted[key] = redactInlinePatterns(value); continue; }
    redacted[key] = value;
  }
  return redacted;
}

function redactInlinePatterns(value: string): string {
  value = value.replace(/(\+?91)?[6-9]\d{9}/g, (match) => `***${match.slice(-3)}`);
  value = value.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    (match) => { const [local, domain] = match.split('@'); return `${local[0]}***@${domain}`; });
  value = value.replace(/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[JWT:REDACTED]');
  value = value.replace(/[A-Z]{5}[0-9]{4}[A-Z]/g, '[PAN:REDACTED]');
  value = value.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[AADHAAR:REDACTED]');
  return value;
}
```

### 26.4.6 Log Retention

| Environment | Storage | Retention | Cost |
|---|---|---|---|
| Production | CloudWatch Logs | 30 days hot, 90 days archived to S3 Glacier | ~$5/mo |
| Staging | CloudWatch Logs | 7 days | ~$1/mo |
| Development | Local console | Session only | $0 |

---

## 26.5 Health Checks

### 26.5.1 Endpoints

```typescript
// packages/api/src/routes/health.routes.ts

import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../lib/observability/dbMetrics';
import { checkRedisHealth } from '../lib/observability/redisMetrics';
import { checkElasticsearchHealth } from '../lib/observability/esMetrics';
import { logger } from '../lib/logger';
import { env } from '../config/env';

const router = Router();

// GET /health -- Liveness probe. Returns 200 if process is alive.
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: env.APP_NAME,
    version: process.env.npm_package_version || 'unknown',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// GET /health/ready -- Readiness probe. Checks all dependencies.
router.get('/health/ready', async (_req: Request, res: Response) => {
  const startTime = Date.now();

  const [dbHealth, redisHealth, esHealth] = await Promise.allSettled([
    checkDatabaseHealth(),
    checkRedisHealth(),
    checkElasticsearchHealth(),
  ]);

  const checks = {
    database: dbHealth.status === 'fulfilled' ? dbHealth.value.status : 'down',
    redis: redisHealth.status === 'fulfilled' ? redisHealth.value.status : 'down',
    elasticsearch: esHealth.status === 'fulfilled' ? esHealth.value.status : 'down',
  };

  const details = {
    database: dbHealth.status === 'fulfilled'
      ? { latency: dbHealth.value.latency, connections: dbHealth.value.connections }
      : { error: 'Connection failed' },
    redis: redisHealth.status === 'fulfilled'
      ? { latency: redisHealth.value.latency, hitRate: Math.round(redisHealth.value.hitRate * 100) / 100, memoryUsage: Math.round(redisHealth.value.memoryUsage * 100) / 100 }
      : { error: 'Connection failed' },
    elasticsearch: esHealth.status === 'fulfilled'
      ? { latency: esHealth.value.latency, clusterStatus: esHealth.value.clusterStatus }
      : { error: 'Connection failed' },
  };

  const overallStatus =
    checks.database === 'down' || checks.redis === 'down' ? 'unhealthy'
    : checks.elasticsearch === 'down' ? 'degraded'
    : 'ok';

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  if (statusCode !== 200) {
    logger.warn('Health check degraded or unhealthy', { checks, details });
  }

  res.status(statusCode).json({
    status: overallStatus,
    service: env.APP_NAME,
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || 'unknown',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    responseTime: Date.now() - startTime,
    checks,
    details,
  });
});

// GET /api/v1/version -- Build metadata
router.get('/api/v1/version', (_req: Request, res: Response) => {
  res.status(200).json({
    version: process.env.npm_package_version || 'unknown',
    commit: process.env.SENTRY_RELEASE || 'unknown',
    environment: env.NODE_ENV,
    nodeVersion: process.version,
    buildTime: process.env.BUILD_TIME || 'unknown',
  });
});

export default router;
```

### 26.5.2 Response Examples

**Healthy (200):**

```json
{
  "status": "ok",
  "service": "hub4estate",
  "environment": "production",
  "version": "1.2.3",
  "timestamp": "2026-04-08T10:30:00.000Z",
  "uptime": 86421,
  "responseTime": 23,
  "checks": { "database": "ok", "redis": "ok", "elasticsearch": "ok" },
  "details": {
    "database": { "latency": 3, "connections": 14 },
    "redis": { "latency": 1, "hitRate": 94.2, "memoryUsage": 34.1 },
    "elasticsearch": { "latency": 18, "clusterStatus": "green" }
  }
}
```

**Degraded (200):** ES down, DB and Redis healthy. Search degraded but platform functional.

**Unhealthy (503):** DB or Redis down. Service unavailable.

---

## 26.6 Uptime Monitoring

### 26.6.1 BetterUptime Configuration

| Monitor | URL | Interval | Alert After | Regions |
|---|---|---|---|---|
| API Health | `https://api.hub4estate.com/health` | 60s | 2 failures | Mumbai, Singapore, Frankfurt |
| API Readiness | `https://api.hub4estate.com/health/ready` | 120s | 2 failures | Mumbai |
| Web App | `https://hub4estate.com` | 60s | 2 failures | Mumbai, Singapore |
| Staging API | `https://api-staging.hub4estate.com/health` | 300s | 3 failures | Mumbai |

### 26.6.2 Status Page

**URL:** `https://status.hub4estate.com`

**Components:**

| Component | Type |
|---|---|
| Website | Website |
| API | API |
| Search | Service |
| Payments | Service |
| Notifications | Service |
| Database | Infrastructure |

### 26.6.3 Uptime SLA Targets

| Component | Target | Allowed Downtime/Month |
|---|---|---|
| API | 99.9% | 43 minutes |
| Website | 99.9% | 43 minutes |
| Payments | 99.95% | 22 minutes |
| Search | 99.5% | 3.6 hours |

---

## 26.7 Dashboards

### 26.7.1 Engineering Dashboard (Grafana)

URL: `https://grafana.hub4estate.com`

**Dashboard: API Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│  HUB4ESTATE -- API Overview                         Last 6h    │
├─────────────────┬───────────────────┬───────────────────────────┤
│  Request Rate   │  Error Rate       │  Active Connections       │
│  142 req/min    │  0.03%            │  28 / 200                 │
├─────────────────┴───────────────────┴───────────────────────────┤
│  Latency Heatmap (p50 / p95 / p99)                             │
│  p50: 45ms    p95: 187ms    p99: 423ms                         │
├────────────────────────────────┬────────────────────────────────┤
│  Latency by Endpoint           │  Status Code Distribution      │
│  POST /bids         234ms avg  │  2xx  94.2%                    │
│  GET  /catalog/search 89ms avg │  3xx   4.1%                    │
│  POST /auth/login    156ms avg │  4xx   1.6%                    │
│  GET  /dealers/:id    67ms avg │  5xx   0.1%                    │
│  POST /payments/verify 445ms   │                                │
├────────────────────────────────┴────────────────────────────────┤
│  ECS Tasks                                                      │
│  API Task 1: CPU 34%, Mem 52%, RUNNING                          │
│  API Task 2: CPU 28%, Mem 48%, RUNNING                          │
│  Worker:     CPU 12%, Mem 31%, Jobs/min: 8                      │
├─────────────────────────────────────────────────────────────────┤
│  Database: Conn 28/200, CPU 15%, IOPS 342, Latency 3ms         │
│  Redis: Memory 34%, Hit Rate 94.2%, Keys 12,847, p99 2ms       │
├─────────────────────────────────────────────────────────────────┤
│  BullMQ Queues                                                  │
│  notifications     W:3  A:1  C:1,247  F:2                      │
│  bid-evaluation    W:0  A:0  C:89     F:0                      │
│  business-metrics  W:0  A:1  C:96     F:0                      │
│  email             W:1  A:0  C:534    F:4                      │
│  price-scraper     W:0  A:0  C:12     F:1                      │
└─────────────────────────────────────────────────────────────────┘
```

### 26.7.2 Business Dashboard (PostHog)

URL: `https://analytics.hub4estate.com`

**Dashboard: Growth**

| Panel | Visualization | Time Range |
|---|---|---|
| Daily Signups | Bar chart | Last 30 days |
| Weekly Active Users | Line chart | Last 12 weeks |
| Monthly Active Users | Line chart | Last 6 months |
| User Source (Google, phone, email) | Pie chart | Last 30 days |
| User Type Distribution | Stacked bar | Last 30 days |

**Dashboard: Engagement**

| Panel | Visualization | Time Range |
|---|---|---|
| Inquiry Funnel (view -> search -> inquiry -> bid -> order) | Funnel | Last 30 days |
| Feature Usage | Horizontal bar | Last 7 days |
| Session Duration | Histogram | Last 7 days |
| Retention Cohorts | Cohort table | Last 12 weeks |

**Dashboard: Revenue**

| Panel | Visualization | Time Range |
|---|---|---|
| GMV Daily | Line chart | Last 30 days |
| Order Count | Bar chart | Last 30 days |
| Average Order Value | Stat + trend | Last 30 days |
| Revenue by Category | Stacked area | Last 30 days |
| Customer Savings Total | Stat | Last 30 days |
| MRR (Dealer Subscriptions) | Line chart | Last 6 months |

**Dashboard: Marketplace Health**

| Panel | Visualization | Time Range |
|---|---|---|
| Bid Fill Rate | Gauge | Last 7 days |
| Time to First Response | Stat | Last 7 days |
| Dealer Win Rate by Tier | Bar chart | Last 30 days |
| Top Dealers by GMV | Table | Last 30 days |
| Category Demand | Treemap | Last 30 days |
| City Distribution | Map or bar | Last 30 days |

**Frontend analytics implementation:**

```typescript
// packages/web/src/lib/analytics.ts

import posthog from 'posthog-js';

export function initAnalytics(): void {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    session_recording: { maskAllInputs: true, maskTextSelector: '.sensitive-data' },
  });
}

export function identifyUser(userId: string, properties: Record<string, unknown>): void {
  posthog.identify(userId, { email: properties.email, role: properties.role, city: properties.city });
}

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  posthog.capture(event, properties);
}

export const analytics = {
  signupStarted: () => trackEvent('signup_started'),
  signupCompleted: (method: string) => trackEvent('signup_completed', { method }),
  loginCompleted: (method: string) => trackEvent('login_completed', { method }),
  productViewed: (productId: string, categoryId: string) => trackEvent('product_viewed', { productId, categoryId }),
  productSearched: (query: string, resultCount: number) => trackEvent('product_searched', { query, resultCount }),
  inquiryCreated: (inquiryId: string, itemCount: number, city: string) => trackEvent('inquiry_created', { inquiryId, itemCount, city }),
  bidReceived: (inquiryId: string, bidCount: number) => trackEvent('bid_received', { inquiryId, bidCount }),
  bidAwarded: (inquiryId: string, savingsPercent: number) => trackEvent('bid_awarded', { inquiryId, savingsPercent }),
  orderPlaced: (orderId: string, amount: number, category: string) => trackEvent('order_placed', { orderId, amount, category }),
  aiChatStarted: () => trackEvent('ai_chat_started'),
  aiBOQGenerated: (projectType: string, itemCount: number) => trackEvent('ai_boq_generated', { projectType, itemCount }),
  dealerOnboardingCompleted: () => trackEvent('dealer_onboarding_completed'),
  dealerBidSubmitted: (inquiryId: string) => trackEvent('dealer_bid_submitted', { inquiryId }),
};
```

### 26.7.3 Admin Dashboard (In-App)

Accessible at `/admin/dashboard`, role-gated to `ADMIN` users only.

**Real-Time Health Panel:** Polls `GET /health/ready` every 30s.

**Today's Numbers (auto-refreshing):**

| Metric | API Endpoint |
|---|---|
| Orders today | `GET /api/v1/admin/analytics/orders?period=today` |
| Revenue today | `GET /api/v1/admin/analytics/revenue?period=today` |
| Active users today | `GET /api/v1/admin/analytics/users?period=today` |
| Inquiries today | `GET /api/v1/admin/analytics/inquiries?period=today` |
| New signups today | `GET /api/v1/admin/analytics/signups?period=today` |
| Dealer bids today | `GET /api/v1/admin/analytics/bids?period=today` |

**Pending Actions Queue:** Dealer KYC pending, open disputes, flagged reviews, failed payments, support tickets -- each with a count badge.

**System Alerts Feed:** Real-time feed from Sentry + CloudWatch, P0-P2 only, last 24 hours.

---

## 26.8 Incident Response

### 26.8.1 Severity Levels

| Severity | Name | Definition | Examples |
|---|---|---|---|
| **P0** | Critical | Complete outage. No users can use the platform. Revenue impact immediate. | API down, database unreachable, all payments failing |
| **P1** | High | Major feature broken. Significant user impact. Revenue at risk. | Blind bidding down, payments failing for some, dealer dashboard inaccessible |
| **P2** | Medium | Feature degraded. Some users affected. Workaround exists. | Search slow (>3s), notifications delayed, AI assistant errors |
| **P3** | Low | Minor issue. Minimal impact. No revenue impact. | Cosmetic UI bug, analytics missing, minor performance regression |

### 26.8.2 Response & Resolution SLAs

| Severity | Acknowledge | First Response | Resolution Target | Escalation |
|---|---|---|---|---|
| **P0** | 5 minutes | 15 minutes | 1 hour | Immediate: Shreshth + all engineers |
| **P1** | 15 minutes | 30 minutes | 4 hours | After 30 min: Shreshth |
| **P2** | 1 hour | 4 hours | 24 hours | After 4 hours: engineering lead |
| **P3** | 4 hours | Next business day | 1 week | None |

### 26.8.3 On-Call Rotation

**Phase 1 (team size 1-3):** Shreshth is primary on-call. All P0/P1 go to his phone.

**Phase 2 (team size 4+):** Weekly rotation via PagerDuty. Primary + secondary. Monday 10 AM IST to Monday 10 AM IST.

### 26.8.4 Escalation Matrix

```
Alert Triggered
  │
  ▼
PagerDuty receives alert
  │
  ├── P0/P1: Phone call + push + SMS to primary on-call
  │     ├── No ACK in 5 min → secondary on-call
  │     ├── No ACK in 10 min → Shreshth (phone call)
  │     └── P0 not resolved in 1 hour → all-hands war room
  │
  ├── P2: Push notification to primary
  │     ├── No ACK in 1 hour → secondary
  │     └── Not resolved in 8 hours → Shreshth
  │
  └── P3: Slack #alerts only
        └── Reviewed in next morning standup
```

### 26.8.5 Incident Response Procedure

**Step 1: Triage (0-5 min)**
1. Acknowledge in PagerDuty.
2. Assess severity.
3. P0/P1: create `#inc-YYYY-MM-DD-description` Slack channel.
4. Post: what is broken, who is investigating, ETA for update.

**Step 2: Investigate (5-30 min)**
1. Sentry: new errors, stack traces, affected users.
2. Grafana: latency spike, error rate, resource usage.
3. CloudWatch: infrastructure issues.
4. Recent deployments (anything in last 2 hours?).
5. External services (Razorpay, AWS, Cloudflare status pages).

**Step 3: Mitigate (ASAP)**
Options in order of speed:
1. Feature flag kill switch (< 1 min).
2. Rollback deployment (< 5 min).
3. Scale up resources (5-15 min).
4. Hotfix (merge directly to main).
5. Failover (standby RDS, backup service).

**Step 4: Communicate**
Update every 15 min (P0) or 30 min (P1):

```
Incident Update [HH:MM IST]
Status: Investigating | Identified | Mitigating | Monitoring | Resolved
Impact: [user impact description]
Current action: [what we are doing]
Next update: [time]
```

**Step 5: Resolve**
1. Confirm service restored (health checks, error rate normalized).
2. Monitor 30 min for stability.
3. Update status page to "Resolved."
4. Post resolution summary.
5. Schedule PIR within 48 hours.

### 26.8.6 Post-Incident Review Template

Every P0 and P1 requires a PIR within 48 hours.

```markdown
# Post-Incident Review: [Title]

## Summary
- **Date**: YYYY-MM-DD
- **Duration**: HH:MM to HH:MM IST (X hours Y minutes)
- **Severity**: P0 / P1
- **Impact**: [users affected, revenue impact, features affected]
- **On-Call**: [name]

## Timeline (IST)
| Time | Event |
|---|---|
| HH:MM | Alert triggered |
| HH:MM | Acknowledged |
| HH:MM | Investigation started |
| HH:MM | Root cause identified |
| HH:MM | Mitigation applied |
| HH:MM | Service restored |
| HH:MM | Confirmed stable |

## Root Cause
[Technical explanation]

## Contributing Factors
- [Factor 1]
- [Factor 2]

## What Went Well
- [Item]

## What Went Poorly
- [Item]

## Action Items
| # | Action | Owner | Priority | Due | Status |
|---|---|---|---|---|---|
| 1 | [action] | [name] | P1 | YYYY-MM-DD | Open |

## Lessons Learned
[Key takeaways]
```

### 26.8.7 Runbooks

Stored in `docs/runbooks/`.

| Runbook | Trigger | Key Steps |
|---|---|---|
| `api-high-cpu.md` | CPU > 80% for 5 min | Check hot endpoints, scale tasks, identify slow queries |
| `api-high-memory.md` | Memory > 85% | Check leaks, restart tasks, increase limits |
| `database-connection-exhaustion.md` | Connections > 150 | Kill idle, increase pool, check leaks |
| `database-high-cpu.md` | RDS CPU > 80% | Performance Insights, add indexes |
| `database-storage-low.md` | Free storage < 10GB | VACUUM, increase storage |
| `redis-high-memory.md` | Memory > 85% | Check key distribution, scale up |
| `payment-failures.md` | Payment errors > 1% | Check Razorpay status, verify webhook, check escrow |
| `search-degraded.md` | ES yellow/red | Shard health, add nodes, reindex |
| `deployment-failed.md` | ECS deploy fails | Task logs, verify image, check secrets, rollback |
| `full-outage.md` | All checks failing | Network, DNS, AWS status, restart |
| `data-breach-suspected.md` | Unauthorized access | Isolate, preserve logs, reset creds, notify legal |

### 26.8.8 War Room Protocol (P0 Only)

When P0 exceeds 30 minutes without resolution:

1. Declare war room: `/incident declare "description"`.
2. Assign roles:
   - **Incident Commander (IC)**: Coordinates, communicates. Does NOT debug.
   - **Technical Lead (TL)**: Leads debugging.
   - **Communications Lead**: Updates status page + clients.
   - **Scribe**: Documents timeline.
3. Communication: update every 10 min in incident channel.
4. External: update status page every 15 min.
5. Post-resolution: mandatory PIR within 24 hours.

---

## 26.9 Monitoring Cost Summary

| Service | Tier | Monthly | Annual |
|---|---|---|---|
| Sentry | Team (5 seats) | $26 | $312 |
| PostHog | Self-hosted | $0 | $0 |
| Grafana Cloud | Free tier | $0 | $0 |
| CloudWatch | Standard | ~$15 | ~$180 |
| BetterUptime | Starter | $20 | $240 |
| PagerDuty | Free (5 users) | $0 | $0 |
| **Total** | | **~$61** | **~$732** |

**Scaling forecast:**

| Stage | Users | Events/mo | Cost | Notes |
|---|---|---|---|---|
| Phase 1 (now) | 50-500 | 50K | $61/mo | Free tiers sufficient |
| Phase 2 (6mo) | 500-5K | 500K | $120/mo | Sentry Business, PostHog cloud |
| Phase 3 (12mo) | 5K-50K | 5M | $350/mo | Growth tiers across all tools |
| Phase 4 (24mo) | 50K+ | 50M+ | $800-1,200/mo | Enterprise tiers |

---

*End of Sections 25-26. Every CI/CD pipeline, deployment step, monitoring alert, log format, health check, dashboard, incident response procedure, and rollback strategy is defined. A DevOps engineer reads this and knows exactly how to set up, deploy, monitor, and maintain the Hub4Estate infrastructure.*

*Next: See section-27-28 for Testing Strategy and Performance Engineering.*
