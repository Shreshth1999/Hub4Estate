# PRD-06: DevOps, Infrastructure, Testing, Roadmap & Team Strategy

**Document Version:** 2.0
**Date:** 7 April 2026
**Author:** CTO Office, Hub4Estate LLP
**Founder:** Shreshth Agarwal
**LLPIN:** ACW-4269 | **Incorporated:** 17 March 2026
**Classification:** Internal -- Confidential
**Status:** Living Document (updated with every sprint)

---

## Table of Contents

1. [DevOps & Infrastructure](#1-devops--infrastructure)
   - 1.1 [Current Infrastructure (As-Is)](#11-current-infrastructure-as-is)
   - 1.2 [Target Infrastructure (Scale-Ready)](#12-target-infrastructure-scale-ready)
   - 1.3 [CI/CD Pipeline](#13-cicd-pipeline)
   - 1.4 [Monitoring & Observability](#14-monitoring--observability)
   - 1.5 [Security Infrastructure](#15-security-infrastructure)
   - 1.6 [Cost Optimization](#16-cost-optimization)
2. [Testing Strategy](#2-testing-strategy)
   - 2.1 [Testing Pyramid](#21-testing-pyramid)
   - 2.2 [Unit Testing](#22-unit-testing)
   - 2.3 [Integration Testing](#23-integration-testing)
   - 2.4 [End-to-End Testing](#24-end-to-end-testing)
   - 2.5 [Load & Performance Testing](#25-load--performance-testing)
   - 2.6 [Security Testing](#26-security-testing)
   - 2.7 [Visual Regression Testing](#27-visual-regression-testing)
   - 2.8 [Coverage Targets](#28-coverage-targets)
3. [Development Roadmap](#3-development-roadmap)
   - 3.1 [Phase 1: Foundation (Months 1-3)](#31-phase-1-foundation-months-1-3)
   - 3.2 [Phase 2: Growth (Months 4-6)](#32-phase-2-growth-months-4-6)
   - 3.3 [Phase 3: Scale (Months 7-12)](#33-phase-3-scale-months-7-12)
   - 3.4 [Phase 4: Intelligence (Months 13-24)](#34-phase-4-intelligence-months-13-24)
   - 3.5 [Phase 5: Dominance (Months 25-36)](#35-phase-5-dominance-months-25-36)
4. [Team Structure & Hiring](#4-team-structure--hiring)
   - 4.1 [Current State](#41-current-state)
   - 4.2 [Phase-Wise Team Build-Out](#42-phase-wise-team-build-out)
   - 4.3 [Contractor vs Full-Time Decisions](#43-contractor-vs-full-time-decisions)
   - 4.4 [Hiring Priorities & Compensation Benchmarks](#44-hiring-priorities--compensation-benchmarks)
5. [Success Metrics & KPIs](#5-success-metrics--kpis)
   - 5.1 [North Star Metric](#51-north-star-metric)
   - 5.2 [Buyer Metrics](#52-buyer-metrics)
   - 5.3 [Dealer Metrics](#53-dealer-metrics)
   - 5.4 [Platform Metrics](#54-platform-metrics)
   - 5.5 [Technical Metrics](#55-technical-metrics)
   - 5.6 [KPI Dashboard Layout](#56-kpi-dashboard-layout)
6. [Risk Register](#6-risk-register)
   - 6.1 [Technical Risks](#61-technical-risks)
   - 6.2 [Business Risks](#62-business-risks)
   - 6.3 [Operational Risks](#63-operational-risks)
   - 6.4 [Contingency Plans](#64-contingency-plans)

---

# 1. DevOps & Infrastructure

---

## 1.1 Current Infrastructure (As-Is)

Hub4Estate runs on a lean AWS stack, manually deployed. This section documents the exact state of production as of April 2026.

### 1.1.1 Architecture Diagram -- Current State

```
                           ┌──────────────────────────────────────────────────────────┐
                           │                     CURRENT PRODUCTION                    │
                           └──────────────────────────────────────────────────────────┘

                                         ┌─────────────────┐
                                         │   Route 53 DNS  │
                                         │  hub4estate.com  │
                                         └────────┬────────┘
                                                  │
                                    ┌─────────────┴─────────────┐
                                    │                           │
                              ┌─────▼──────┐            ┌──────▼───────┐
                              │ CloudFront │            │   Amplify    │
                              │    CDN     │            │   Frontend   │
                              │ (static)   │            │  React+Vite  │
                              └─────┬──────┘            └──────┬───────┘
                                    │                          │
                                    │     ┌────────────────────┘
                                    │     │  API calls (HTTPS)
                                    │     │
                              ┌─────▼─────▼──────────────────┐
                              │      EC2 (t3.small)          │
                              │  ┌─────────────────────┐     │
                              │  │  PM2 Process Manager │     │
                              │  │  ┌─────────────────┐│     │
                              │  │  │ Express (3001)  ││     │
                              │  │  │ Node.js Backend ││     │
                              │  │  └─────────────────┘│     │
                              │  └─────────────────────┘     │
                              │  IP: 3.110.172.191           │
                              │  SSL: Let's Encrypt          │
                              │  HSTS: Enabled               │
                              └──────────┬───────────────────┘
                                         │
                              ┌──────────▼───────────────────┐
                              │   RDS PostgreSQL             │
                              │   db.t3.micro                │
                              │   Automated Backups: ON      │
                              │   Retention: 7 days          │
                              │   49 Prisma Models           │
                              └──────────────────────────────┘

                              ┌──────────────────────────────┐
                              │        S3 Buckets            │
                              │  - Product images            │
                              │  - Dealer documents          │
                              │  - User uploads              │
                              └──────────────────────────────┘
```

### 1.1.2 Current Service Inventory

| Service | Spec | Region | Purpose | Monthly Cost (INR) |
|---------|------|--------|---------|-------------------|
| EC2 | t3.small (2 vCPU, 2 GB RAM) | ap-south-1 | Backend API + PM2 | ~1,500 |
| RDS PostgreSQL | db.t3.micro (1 vCPU, 1 GB RAM) | ap-south-1 | Primary database | ~1,200 |
| S3 | Standard tier | ap-south-1 | File storage (images, docs) | ~200 |
| AWS Amplify | Build minutes (free tier) | us-east-1 | Frontend CI/CD + hosting | ~0 (free tier) |
| Route 53 | 1 hosted zone | Global | DNS management | ~50 |
| CloudFront | Free tier usage | Global | CDN for static assets | ~0 (free tier) |
| **Total Current** | | | | **~2,950/mo** |

### 1.1.3 Current Deployment Process

The current deployment is manual:

```bash
# Backend deployment (SSH into EC2)
ssh -i hub4estate.pem ec2-user@3.110.172.191
cd /var/www/hub4estate/backend

# Pull latest code (NOT a git repo on EC2 -- files are SCP'd)
# From local machine:
scp -r ./backend/* ec2-user@3.110.172.191:/var/www/hub4estate/backend/

# On EC2:
npm install
npm run build
npx prisma migrate deploy
pm2 restart hub4estate-backend --update-env
pm2 save

# Frontend deployment (automatic via Amplify)
# Push to main branch -> Amplify auto-builds
git push origin main
# Amplify runs: preBuild (root npm install --ignore-scripts) -> build (cd frontend && npm run build)
```

### 1.1.4 Current Health Check

A health check script exists at `/Users/apple/check-hub4estate.sh` that validates:

- EC2 instance reachability (3.110.172.191)
- RDS connectivity
- SSL certificate validity
- HSTS header presence
- Port 3001 firewall rules
- Google OAuth callback reachability

### 1.1.5 Known Limitations of Current Setup

| Limitation | Impact | Severity |
|-----------|--------|----------|
| Single EC2 instance | No failover, any crash = full downtime | HIGH |
| No auto-scaling | Cannot handle traffic spikes | HIGH |
| Manual SCP deployment | Error-prone, no rollback, no audit trail | HIGH |
| No Redis caching | Every request hits PostgreSQL | MEDIUM |
| db.t3.micro RDS | 1 GB RAM, will choke at ~500 concurrent connections | HIGH |
| No staging environment | All changes tested in production | CRITICAL |
| No structured logging | Debugging relies on PM2 logs, no search | MEDIUM |
| No error tracking | Errors discovered when users report them | HIGH |
| No monitoring/alerting | No awareness of CPU/memory/disk issues until failure | HIGH |
| Let's Encrypt renewal | Manual renewal process | LOW |

---

## 1.2 Target Infrastructure (Scale-Ready)

This section defines the infrastructure Hub4Estate needs to serve 10,000+ concurrent users with 99.9% uptime.

### 1.2.1 Target Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                        HUB4ESTATE TARGET ARCHITECTURE (Scale-Ready)                   │
└──────────────────────────────────────────────────────────────────────────────────────┘

                                     ┌──────────────┐
                                     │  Route 53    │
                                     │  DNS + Health │
                                     │  Checks      │
                                     └──────┬───────┘
                                            │
                              ┌─────────────┴─────────────┐
                              │                           │
                    ┌─────────▼─────────┐      ┌─────────▼─────────┐
                    │    CloudFront     │      │    AWS Amplify     │
                    │    CDN            │      │    Frontend        │
                    │  S3 Origin +      │      │  React 18 + Vite  │
                    │  API Gateway      │      │  TypeScript        │
                    │  origin           │      │                    │
                    └─────────┬─────────┘      └────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    AWS WAF        │
                    │  + AWS Shield     │
                    │  (DDoS Protection)│
                    └─────────┬─────────┘
                              │
┌─────────────────────────────▼──────────────────────────────────────────────────────┐
│                              VPC: 10.0.0.0/16                                       │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐   │
│  │  PUBLIC SUBNETS (10.0.1.0/24, 10.0.2.0/24)   [ap-south-1a, ap-south-1b]     │   │
│  │                                                                               │   │
│  │   ┌──────────────────────────────────────────────┐                            │   │
│  │   │     Application Load Balancer (ALB)          │                            │   │
│  │   │     - HTTPS listener (443)                   │                            │   │
│  │   │     - HTTP->HTTPS redirect (80->443)         │                            │   │
│  │   │     - Health check: /api/health              │                            │   │
│  │   │     - Sticky sessions: OFF                   │                            │   │
│  │   │     - SSL: ACM Certificate                   │                            │   │
│  │   └───────────────────┬──────────────────────────┘                            │   │
│  │                       │                                                        │   │
│  │   ┌───────────────────▼──────────────────────────┐                            │   │
│  │   │          NAT Gateway (per AZ)                │                            │   │
│  │   └──────────────────────────────────────────────┘                            │   │
│  └───────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐   │
│  │  PRIVATE SUBNETS (10.0.3.0/24, 10.0.4.0/24)  [ap-south-1a, ap-south-1b]     │   │
│  │                                                                               │   │
│  │   ┌──────────────────────────────────────────────────────────────────────┐    │   │
│  │   │  AUTO SCALING GROUP (min: 2, desired: 2, max: 10)                    │    │   │
│  │   │                                                                      │    │   │
│  │   │   ┌─────────────────┐   ┌─────────────────┐         ┌──────────┐   │    │   │
│  │   │   │ EC2 t3.medium   │   │ EC2 t3.medium   │  ...    │ EC2 #N   │   │    │   │
│  │   │   │ Node.js+Express │   │ Node.js+Express │         │ (auto)   │   │    │   │
│  │   │   │ PM2 cluster     │   │ PM2 cluster     │         │          │   │    │   │
│  │   │   │ Port 3001       │   │ Port 3001       │         │          │   │    │   │
│  │   │   └────────┬────────┘   └────────┬────────┘         └──────────┘   │    │   │
│  │   │            │                     │                                  │    │   │
│  │   └────────────┼─────────────────────┼──────────────────────────────────┘    │   │
│  │                │                     │                                        │   │
│  │   ┌────────────▼─────────────────────▼──────────────────────────────────┐    │   │
│  │   │                     ElastiCache Redis (r6g.medium)                   │    │   │
│  │   │  - Cluster mode: Enabled (2 shards, 1 replica each)                 │    │   │
│  │   │  - Sessions, rate-limiting, API response caching                    │    │   │
│  │   │  - Quote comparison cache, dealer availability cache                │    │   │
│  │   └─────────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                               │   │
│  │   ┌─────────────────────────────────────────────────────────────────────┐    │   │
│  │   │               RDS PostgreSQL Multi-AZ (db.r6g.large)                │    │   │
│  │   │  - Primary (ap-south-1a) + Standby (ap-south-1b)                    │    │   │
│  │   │  - Read Replica (ap-south-1a) for analytics/reporting               │    │   │
│  │   │  - Automated backups: 14-day retention                              │    │   │
│  │   │  - Encryption at rest: AES-256 (AWS KMS)                            │    │   │
│  │   │  - Storage: gp3 SSD, auto-scaling up to 500 GB                      │    │   │
│  │   └─────────────────────────────────────────────────────────────────────┘    │   │
│  └───────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐   │
│  │  ISOLATED SUBNETS (10.0.5.0/24, 10.0.6.0/24)                                 │   │
│  │                                                                               │   │
│  │   ┌──────────────────────┐  ┌───────────────────┐  ┌────────────────────┐    │   │
│  │   │  Lambda Functions    │  │  SQS Queues       │  │  SNS Topics        │    │   │
│  │   │  - Image processing  │  │  - email-queue    │  │  - order-events    │    │   │
│  │   │  - PDF parsing       │  │  - notification-q │  │  - dealer-alerts   │    │   │
│  │   │  - Scheduled tasks   │  │  - scraping-queue │  │  - system-alerts   │    │   │
│  │   │  - Price aggregation │  │  - ai-processing  │  │  - pricing-updates │    │   │
│  │   └──────────────────────┘  └───────────────────┘  └────────────────────┘    │   │
│  └───────────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────────┐
                    │          EXTERNAL SERVICES                   │
                    │                                             │
                    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
                    │  │ Resend   │  │ Sentry   │  │ PostHog  │  │
                    │  │ (Email)  │  │ (Errors) │  │(Analytics│  │
                    │  └──────────┘  └──────────┘  └──────────┘  │
                    │                                             │
                    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
                    │  │ Anthropic│  │ OpenAI   │  │ Google   │  │
                    │  │ (Claude) │  │ (GPT)    │  │ OAuth    │  │
                    │  └──────────┘  └──────────┘  └──────────┘  │
                    └─────────────────────────────────────────────┘
```

### 1.2.2 VPC Network Design

```
VPC CIDR: 10.0.0.0/16 (65,536 IPs)
Region: ap-south-1 (Mumbai)

┌────────────────────────────────────────────────────────────────────┐
│                     SUBNET ALLOCATION                              │
├────────────────┬──────────────┬──────────────┬─────────────────────┤
│ Subnet         │ CIDR         │ AZ           │ Purpose             │
├────────────────┼──────────────┼──────────────┼─────────────────────┤
│ public-1a      │ 10.0.1.0/24  │ ap-south-1a  │ ALB, NAT Gateway    │
│ public-1b      │ 10.0.2.0/24  │ ap-south-1b  │ ALB, NAT Gateway    │
│ private-1a     │ 10.0.3.0/24  │ ap-south-1a  │ EC2, ElastiCache    │
│ private-1b     │ 10.0.4.0/24  │ ap-south-1b  │ EC2, ElastiCache    │
│ isolated-1a    │ 10.0.5.0/24  │ ap-south-1a  │ RDS Primary, Lambda │
│ isolated-1b    │ 10.0.6.0/24  │ ap-south-1b  │ RDS Standby, Lambda │
└────────────────┴──────────────┴──────────────┴─────────────────────┘
```

### 1.2.3 Auto Scaling Configuration

```
┌─────────────────────────────────────────────────────────────┐
│              AUTO SCALING GROUP POLICY                        │
├──────────────────────┬──────────────────────────────────────┤
│ Instance Type        │ t3.medium (2 vCPU, 4 GB RAM)        │
│ AMI                  │ Amazon Linux 2023 + Node 20 + PM2   │
│ Min Instances        │ 2                                    │
│ Desired Instances    │ 2                                    │
│ Max Instances        │ 10                                   │
│ Scale-Out Trigger    │ CPU > 60% for 3 min OR              │
│                      │ Request count > 1000/min per target  │
│ Scale-In Trigger     │ CPU < 30% for 10 min                │
│ Cooldown Period      │ 300 seconds                          │
│ Health Check Type    │ ELB (HTTP GET /api/health)           │
│ Health Check Grace   │ 120 seconds                          │
│ Termination Policy   │ OldestInstance                       │
└──────────────────────┴──────────────────────────────────────┘
```

**Scaling thresholds by user base:**

| Users (DAU) | EC2 Instances | RDS | ElastiCache | Est. Monthly Cost (INR) |
|-------------|---------------|-----|-------------|------------------------|
| 0 - 500 | 2x t3.medium | db.t3.small | cache.t3.micro | ~18,000 |
| 500 - 2,000 | 3x t3.medium | db.t3.medium | cache.t3.small | ~32,000 |
| 2,000 - 5,000 | 4x t3.medium | db.r6g.large | cache.r6g.medium | ~65,000 |
| 5,000 - 10,000 | 6x t3.large | db.r6g.large + read replica | cache.r6g.large (cluster) | ~1,20,000 |
| 10,000 - 50,000 | 8x t3.xlarge | db.r6g.xlarge + 2 replicas | cache.r6g.xlarge (cluster) | ~3,00,000 |
| 50,000+ | 10x c6g.xlarge | db.r6g.2xlarge + 3 replicas | cache.r6g.2xlarge (cluster) | ~6,50,000 |

### 1.2.4 ElastiCache Redis Design

```
┌────────────────────────────────────────────────────────────────────┐
│                    REDIS CACHE ARCHITECTURE                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  DATABASE 0: Sessions                                              │
│  ├── sess:{sessionId} -> user session data        TTL: 24h        │
│  ├── refresh:{tokenId} -> refresh token data      TTL: 7d         │
│  └── oauth:{state} -> OAuth flow state            TTL: 10m        │
│                                                                    │
│  DATABASE 1: API Response Cache                                    │
│  ├── cat:{categoryId} -> category tree            TTL: 1h         │
│  ├── brands:all -> brand list                     TTL: 30m        │
│  ├── products:{query_hash} -> search results      TTL: 5m         │
│  ├── dealer:{dealerId}:profile -> dealer info     TTL: 15m        │
│  └── prices:{productTypeId} -> price aggregation  TTL: 10m        │
│                                                                    │
│  DATABASE 2: Rate Limiting                                         │
│  ├── rl:ip:{ip} -> request count                  TTL: 1m         │
│  ├── rl:user:{userId} -> request count            TTL: 1m         │
│  ├── rl:inquiry:{userId} -> inquiry count         TTL: 1h         │
│  └── rl:quote:{dealerId} -> quote submission rate TTL: 1m         │
│                                                                    │
│  DATABASE 3: Real-Time Features                                    │
│  ├── online:dealers -> SET of online dealer IDs   TTL: none       │
│  ├── typing:{inquiryId} -> who is typing          TTL: 5s         │
│  ├── notifications:{userId} -> unread count       TTL: none       │
│  └── quotes:live:{inquiryId} -> live quote stream TTL: 24h        │
│                                                                    │
│  DATABASE 4: AI Processing Queue                                   │
│  ├── ai:job:{jobId} -> processing status          TTL: 1h         │
│  ├── ai:result:{inquiryId} -> parsed specs        TTL: 24h        │
│  └── ai:cache:{prompt_hash} -> cached response    TTL: 6h         │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 1.2.5 S3 + CloudFront Design

```
┌────────────────────────────────────────────────────────────────────┐
│                     S3 BUCKET STRATEGY                              │
├───────────────────────┬──────────────────┬─────────────────────────┤
│ Bucket                │ Access           │ Lifecycle               │
├───────────────────────┼──────────────────┼─────────────────────────┤
│ h4e-product-images    │ CloudFront OAI   │ Standard 90d -> IA 180d │
│ h4e-dealer-documents  │ Presigned URLs   │ Standard 365d -> Glacier│
│ h4e-user-uploads      │ Presigned URLs   │ Standard 30d -> IA 90d  │
│ h4e-invoice-pdfs      │ Presigned URLs   │ Standard 2y -> Glacier  │
│ h4e-ai-training-data  │ Private          │ Standard (permanent)    │
│ h4e-backups           │ Private          │ Standard 30d -> Glacier │
│ h4e-static-assets     │ CloudFront OAI   │ Standard (permanent)    │
│ h4e-logs              │ Private          │ Standard 30d -> delete  │
└───────────────────────┴──────────────────┴─────────────────────────┘

CloudFront Configuration:
  - Origin: h4e-product-images.s3.ap-south-1.amazonaws.com
  - Behaviors:
    /images/*   -> S3 origin, cache 7d, compress
    /api/*      -> ALB origin, cache 0, passthrough
    /static/*   -> S3 origin, cache 30d, compress
  - Price Class: PriceClass_200 (India + Asia focus)
  - SSL: ACM certificate (*.hub4estate.com)
  - WAF: Attached (see Security section)
```

### 1.2.6 SQS/SNS Async Processing Architecture

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                        ASYNC PROCESSING FLOW                                   │
└────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐     ┌─────────────────────────────────────────────────────┐
  │  Express     │     │                    SQS QUEUES                       │
  │  Backend     │────▶│                                                     │
  │  (Producer)  │     │  ┌─────────────────────┐  ┌──────────────────────┐ │
  └─────────────┘     │  │  h4e-email-queue     │  │  h4e-notification-q  │ │
                       │  │  Visibility: 60s     │  │  Visibility: 30s     │ │
                       │  │  DLQ after 3 retries │  │  DLQ after 3 retries │ │
                       │  └──────────┬──────────┘  └──────────┬───────────┘ │
                       │             │                        │              │
                       │  ┌──────────┴──────────┐  ┌─────────┴───────────┐ │
                       │  │  Lambda: sendEmail   │  │  Lambda: pushNotify │ │
                       │  │  -> Resend API       │  │  -> FCM / APNs     │ │
                       │  └─────────────────────┘  └─────────────────────┘ │
                       │                                                     │
                       │  ┌─────────────────────┐  ┌──────────────────────┐ │
                       │  │  h4e-scraping-queue  │  │  h4e-ai-processing  │ │
                       │  │  Visibility: 300s    │  │  Visibility: 120s   │ │
                       │  │  DLQ after 2 retries │  │  DLQ after 3 retries│ │
                       │  └──────────┬──────────┘  └──────────┬───────────┘ │
                       │             │                        │              │
                       │  ┌──────────┴──────────┐  ┌─────────┴───────────┐ │
                       │  │  Lambda: scrapePrice │  │  Lambda: parseSlip  │ │
                       │  │  -> Puppeteer layer  │  │  -> Tesseract+Claude│ │
                       │  └─────────────────────┘  └─────────────────────┘ │
                       └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                          SNS TOPICS (Fan-Out)                               │
  │                                                                             │
  │  ┌─────────────────────────┐     Subscribers:                               │
  │  │  h4e-order-events       │──── SQS: email-queue (order confirmation)      │
  │  │                         │──── SQS: notification-q (push notification)    │
  │  │                         │──── Lambda: analytics-logger                   │
  │  └─────────────────────────┘                                                │
  │                                                                             │
  │  ┌─────────────────────────┐     Subscribers:                               │
  │  │  h4e-dealer-alerts      │──── SQS: email-queue (new inquiry alert)       │
  │  │                         │──── SQS: notification-q (push)                 │
  │  │                         │──── Lambda: sms-sender (SMS via MSG91)         │
  │  └─────────────────────────┘                                                │
  │                                                                             │
  │  ┌─────────────────────────┐     Subscribers:                               │
  │  │  h4e-system-alerts      │──── Lambda: slack-notifier (#engineering)      │
  │  │                         │──── SQS: email-queue (admin alert)             │
  │  └─────────────────────────┘                                                │
  └─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2.7 Lambda Functions Inventory

| Function | Runtime | Memory | Timeout | Trigger | Purpose |
|----------|---------|--------|---------|---------|---------|
| `h4e-image-processor` | Node 20 | 512 MB | 60s | S3 upload event | Resize, compress, generate thumbnails (Sharp) |
| `h4e-pdf-parser` | Node 20 | 1024 MB | 120s | SQS: ai-processing | Parse uploaded PDFs (invoices, spec sheets) |
| `h4e-email-sender` | Node 20 | 256 MB | 30s | SQS: email-queue | Send transactional emails via Resend |
| `h4e-push-notify` | Node 20 | 256 MB | 15s | SQS: notification-q | Push notifications via FCM |
| `h4e-price-scraper` | Node 20 + Puppeteer layer | 2048 MB | 300s | SQS: scraping-queue | Scrape competitor prices (Moglix, etc.) |
| `h4e-slip-scanner` | Node 20 + Tesseract layer | 2048 MB | 120s | API Gateway | OCR on uploaded material slips |
| `h4e-daily-digest` | Node 20 | 256 MB | 60s | EventBridge (cron) | Daily dealer performance digest |
| `h4e-backup-checker` | Node 20 | 128 MB | 30s | EventBridge (cron) | Verify RDS backups + S3 snapshots |
| `h4e-analytics-agg` | Node 20 | 512 MB | 120s | EventBridge (cron) | Aggregate daily analytics into summary tables |
| `h4e-certificate-renew` | Python 3.12 | 128 MB | 60s | EventBridge (monthly) | SSL certificate renewal check |

---

## 1.3 CI/CD Pipeline

### 1.3.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        CI/CD PIPELINE OVERVIEW                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

  Developer Push                                    Production
  ──────────────                                    ──────────
       │
       ▼
  ┌─────────┐    ┌──────┐    ┌──────┐    ┌───────┐    ┌────────────┐
  │  Lint   │───▶│ Test │───▶│Build │───▶│Staging│───▶│ Production │
  │         │    │      │    │      │    │Deploy │    │  Deploy    │
  └─────────┘    └──────┘    └──────┘    └───────┘    └────────────┘
       │              │           │           │              │
   ESLint +       Jest +      tsc +      Auto       Manual approval
   Prettier     Supertest   Vite build   deploy      + blue/green
   TypeScript   Playwright               to staging   swap
   check        Coverage                 env
```

### 1.3.2 GitHub Actions -- Backend CI/CD

```yaml
# .github/workflows/backend-ci-cd.yml
name: Backend CI/CD

on:
  push:
    branches: [main, develop, 'release/*']
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci-cd.yml'
  pull_request:
    branches: [main, develop]
    paths:
      - 'backend/**'

env:
  NODE_VERSION: '20'
  AWS_REGION: 'ap-south-1'

jobs:
  # ─────────────────────────────────────────
  # STAGE 1: Lint & Type Check
  # ─────────────────────────────────────────
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - run: npm ci

      - name: TypeScript type check
        run: npx tsc --noEmit

      - name: ESLint
        run: npx eslint src/ --ext .ts --max-warnings 0

      - name: Prisma validate
        run: npx prisma validate

  # ─────────────────────────────────────────
  # STAGE 2: Unit & Integration Tests
  # ─────────────────────────────────────────
  test:
    name: Test Suite
    needs: lint
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
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

    env:
      DATABASE_URL: postgresql://test_user:test_password@localhost:5432/hub4estate_test
      REDIS_URL: redis://localhost:6379
      JWT_SECRET: test-jwt-secret-do-not-use-in-production
      NODE_ENV: test

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - run: npm ci

      - name: Run Prisma migrations
        run: npx prisma migrate deploy

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run unit tests
        run: npx jest --coverage --coverageReporters=json-summary --forceExit
        env:
          JEST_JUNIT_OUTPUT_DIR: ./reports

      - name: Run integration tests
        run: npx jest --config jest.integration.config.ts --forceExit

      - name: Check coverage thresholds
        run: |
          node -e "
            const coverage = require('./coverage/coverage-summary.json');
            const total = coverage.total;
            const thresholds = { statements: 80, branches: 75, functions: 80, lines: 80 };
            let failed = false;
            for (const [metric, min] of Object.entries(thresholds)) {
              const actual = total[metric].pct;
              if (actual < min) {
                console.error('Coverage for ' + metric + ': ' + actual + '% < ' + min + '% threshold');
                failed = true;
              }
            }
            if (failed) process.exit(1);
            console.log('All coverage thresholds passed.');
          "

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: backend/coverage/

  # ─────────────────────────────────────────
  # STAGE 3: Build
  # ─────────────────────────────────────────
  build:
    name: Build & Package
    needs: test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - run: npm ci --production

      - name: Build TypeScript
        run: npx tsc

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Package artifact
        run: |
          tar -czf ../backend-build-${{ github.sha }}.tar.gz \
            dist/ \
            node_modules/ \
            prisma/ \
            package.json \
            package-lock.json

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: backend-build
          path: backend-build-${{ github.sha }}.tar.gz
          retention-days: 7

  # ─────────────────────────────────────────
  # STAGE 4: Deploy to Staging
  # ─────────────────────────────────────────
  deploy-staging:
    name: Deploy to Staging
    needs: build
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: backend-build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to staging EC2 via SSM
        run: |
          INSTANCE_ID=$(aws ec2 describe-instances \
            --filters "Name=tag:Environment,Values=staging" "Name=tag:Service,Values=backend" \
            --query "Reservations[0].Instances[0].InstanceId" --output text)

          aws s3 cp backend-build-${{ github.sha }}.tar.gz \
            s3://h4e-deployments/staging/${{ github.sha }}.tar.gz

          aws ssm send-command \
            --instance-ids "$INSTANCE_ID" \
            --document-name "AWS-RunShellScript" \
            --parameters commands='[
              "cd /var/www/hub4estate/backend",
              "aws s3 cp s3://h4e-deployments/staging/${{ github.sha }}.tar.gz /tmp/deploy.tar.gz",
              "tar -xzf /tmp/deploy.tar.gz -C /var/www/hub4estate/backend/",
              "npx prisma migrate deploy",
              "pm2 reload hub4estate-backend --update-env",
              "pm2 save",
              "sleep 5",
              "curl -f http://localhost:3001/api/health || (pm2 logs hub4estate-backend --lines 50 && exit 1)"
            ]'

      - name: Run smoke tests against staging
        run: |
          STAGING_URL="${{ secrets.STAGING_URL }}"
          # Health check
          curl -f "$STAGING_URL/api/health" || exit 1
          # Auth endpoint reachable
          curl -f -o /dev/null -s -w "%{http_code}" "$STAGING_URL/api/auth/google" | grep -q "302\|200" || exit 1
          echo "Staging smoke tests passed."

  # ─────────────────────────────────────────
  # STAGE 5: Deploy to Production
  # ─────────────────────────────────────────
  deploy-production:
    name: Deploy to Production (Blue/Green)
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.hub4estate.com
    steps:
      - uses: actions/checkout@v4

      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: backend-build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Blue/Green deployment
        run: |
          # Upload artifact
          aws s3 cp backend-build-${{ github.sha }}.tar.gz \
            s3://h4e-deployments/production/${{ github.sha }}.tar.gz

          # Get current (blue) target group
          ALB_ARN=$(aws elbv2 describe-load-balancers \
            --names h4e-production-alb \
            --query "LoadBalancers[0].LoadBalancerArn" --output text)

          LISTENER_ARN=$(aws elbv2 describe-listeners \
            --load-balancer-arn "$ALB_ARN" \
            --query "Listeners[?Port==\`443\`].ListenerArn" --output text)

          CURRENT_TG=$(aws elbv2 describe-rules \
            --listener-arn "$LISTENER_ARN" \
            --query "Rules[0].Actions[0].TargetGroupArn" --output text)

          # Determine green target group
          if [[ "$CURRENT_TG" == *"blue"* ]]; then
            GREEN_TG=$(echo "$CURRENT_TG" | sed 's/blue/green/')
          else
            GREEN_TG=$(echo "$CURRENT_TG" | sed 's/green/blue/')
          fi

          # Deploy to green instances
          GREEN_INSTANCES=$(aws ec2 describe-instances \
            --filters "Name=tag:TargetGroup,Values=green" "Name=tag:Environment,Values=production" \
            --query "Reservations[].Instances[].InstanceId" --output text)

          for INSTANCE_ID in $GREEN_INSTANCES; do
            aws ssm send-command \
              --instance-ids "$INSTANCE_ID" \
              --document-name "AWS-RunShellScript" \
              --parameters commands='[
                "cd /var/www/hub4estate/backend",
                "aws s3 cp s3://h4e-deployments/production/${{ github.sha }}.tar.gz /tmp/deploy.tar.gz",
                "tar -xzf /tmp/deploy.tar.gz -C /var/www/hub4estate/backend/",
                "npx prisma migrate deploy",
                "pm2 reload hub4estate-backend --update-env",
                "pm2 save"
              ]'
          done

          # Wait for green instances to be healthy
          echo "Waiting for green target group health checks..."
          sleep 30

          aws elbv2 wait target-in-service \
            --target-group-arn "$GREEN_TG"

          # Swap traffic to green
          aws elbv2 modify-rule \
            --rule-arn "$(aws elbv2 describe-rules --listener-arn "$LISTENER_ARN" \
              --query "Rules[0].RuleArn" --output text)" \
            --actions Type=forward,TargetGroupArn="$GREEN_TG"

          echo "Traffic switched to green. Deployment complete."
          echo "ROLLBACK_TG=$CURRENT_TG" >> $GITHUB_ENV

      - name: Production smoke tests
        run: |
          sleep 10
          curl -f "https://api.hub4estate.com/api/health" || exit 1
          echo "Production deployment verified."

      - name: Notify deployment
        if: always()
        run: |
          STATUS="${{ job.status }}"
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d "{
              \"text\": \"Production Deploy: $STATUS\nCommit: ${{ github.sha }}\nBy: ${{ github.actor }}\nRollback TG: ${{ env.ROLLBACK_TG }}\"
            }"
```

### 1.3.3 GitHub Actions -- Frontend CI/CD

```yaml
# .github/workflows/frontend-ci-cd.yml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci-cd.yml'
  pull_request:
    branches: [main, develop]
    paths:
      - 'frontend/**'

jobs:
  lint-and-test:
    name: Lint, Type Check & Test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - run: npm ci

      - name: TypeScript check
        run: npx tsc --noEmit

      - name: ESLint
        run: npm run lint

      - name: Unit tests
        run: npx vitest run --coverage

      - name: Build check
        run: npm run build
        env:
          VITE_BACKEND_API_URL: https://api.hub4estate.com/api

  e2e-tests:
    name: E2E Tests (Playwright)
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd frontend && npm ci
          npx playwright install --with-deps chromium

      - name: Run Playwright tests
        run: cd frontend && npx playwright test
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:5173
          VITE_BACKEND_API_URL: http://localhost:3001/api

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: frontend/playwright-report/

  # Frontend deploys automatically via AWS Amplify on push to main
  # This job just validates the build succeeds before Amplify picks it up
```

### 1.3.4 Database Migration Strategy

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                     PRISMA MIGRATION WORKFLOW                                  │
└────────────────────────────────────────────────────────────────────────────────┘

  Development:
  ────────────
  1. Developer edits schema.prisma
  2. Run: npx prisma migrate dev --name descriptive_name
  3. Migration SQL generated in prisma/migrations/{timestamp}_{name}/
  4. Migration applied to local dev database
  5. Prisma Client regenerated
  6. Commit migration file + schema changes

  Staging:
  ────────
  1. CI/CD runs: npx prisma migrate deploy
  2. Applies all pending migrations in order
  3. No interactive prompts (safe for CI)
  4. If migration fails -> deployment stops, alert sent

  Production:
  ───────────
  1. Pre-deployment: Create RDS snapshot (automated)
  2. CI/CD runs: npx prisma migrate deploy
  3. If migration fails:
     a. Deployment halts
     b. Alert sent to #engineering Slack
     c. Manual decision: fix-forward or rollback to snapshot
  4. Post-migration: Verify data integrity checks

  MIGRATION RULES:
  ─────────────────
  - NEVER use prisma migrate dev in staging/production
  - NEVER drop columns without a 2-phase deprecation:
    Phase 1: Stop writing to column, deploy
    Phase 2: Drop column in next release
  - ALWAYS add new columns as nullable or with defaults
  - ALWAYS test migrations against a production-size dataset copy
  - Large data migrations: Use background jobs, not schema migrations
  - Maximum migration execution time: 30 seconds
    (longer migrations must be split or done offline)
```

### 1.3.5 Rollback Procedures

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        ROLLBACK DECISION TREE                              │
└────────────────────────────────────────────────────────────────────────────┘

  Deployment fails?
       │
       ├── YES ── Build/test stage?
       │              │
       │              ├── YES → Pipeline stops. No action needed.
       │              │         Fix code, push again.
       │              │
       │              └── NO → Staging deploy failed?
       │                          │
       │                          ├── YES → Investigate logs.
       │                          │         Fix and re-deploy.
       │                          │         Staging has no SLA.
       │                          │
       │                          └── NO → Production deploy failed?
       │                                      │
       │                                      ├── Migration failed?
       │                                      │     │
       │                                      │     ├── YES → Restore RDS
       │                                      │     │         from pre-deploy
       │                                      │     │         snapshot.
       │                                      │     │         Switch ALB back
       │                                      │     │         to blue TG.
       │                                      │     │
       │                                      │     └── NO → Switch ALB back
       │                                      │              to previous TG.
       │                                      │              (1 API call,
       │                                      │               < 30 seconds)
       │                                      │
       │                                      └── App crashes post-deploy?
       │                                              │
       │                                              └── Switch ALB to
       │                                                  previous TG.
       │                                                  Keep green instances
       │                                                  alive for debugging.
       │
       └── NO ── Deployment successful. Monitor for 15 minutes.
                  If error rate > 1% or p95 > 2s:
                  → Automatic rollback via CloudWatch alarm action.
```

**Rollback commands (manual emergency):**

```bash
# IMMEDIATE ROLLBACK: Switch ALB target group (< 30 seconds)
aws elbv2 modify-rule \
  --rule-arn "$RULE_ARN" \
  --actions Type=forward,TargetGroupArn="$PREVIOUS_TARGET_GROUP_ARN"

# DATABASE ROLLBACK: Restore from snapshot (10-15 minutes)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier hub4estate-production-restored \
  --db-snapshot-identifier pre-deploy-$TIMESTAMP \
  --db-instance-class db.r6g.large

# FRONTEND ROLLBACK: Amplify has automatic rollback
aws amplify start-deployment \
  --app-id d1q97di2bq0r3o \
  --branch-name main \
  --source-url "s3://h4e-deployments/frontend/last-known-good.zip"
```

### 1.3.6 Environment Management

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                        ENVIRONMENT MATRIX                                      │
├────────────────┬──────────────┬──────────────────┬────────────────────────────┤
│ Environment    │ Branch       │ URL              │ Purpose                    │
├────────────────┼──────────────┼──────────────────┼────────────────────────────┤
│ Local Dev      │ feature/*    │ localhost:3000   │ Developer workstation      │
│                │              │ localhost:3001   │                            │
├────────────────┼──────────────┼──────────────────┼────────────────────────────┤
│ Staging        │ develop      │ staging.         │ QA testing, integration    │
│                │              │ hub4estate.com   │ testing, pre-release       │
├────────────────┼──────────────┼──────────────────┼────────────────────────────┤
│ Production     │ main         │ hub4estate.com   │ Live user traffic          │
│                │              │ api.hub4estate   │                            │
│                │              │ .com             │                            │
└────────────────┴──────────────┴──────────────────┴────────────────────────────┘

Environment Variables (per environment):

┌────────────────────────────────────┬────────────┬────────────┬────────────┐
│ Variable                           │ Local      │ Staging    │ Production │
├────────────────────────────────────┼────────────┼────────────┼────────────┤
│ NODE_ENV                           │ development│ staging    │ production │
│ DATABASE_URL                       │ local PG   │ RDS staging│ RDS prod   │
│ REDIS_URL                          │ local Redis│ ElastiCache│ ElastiCache│
│ JWT_SECRET                         │ dev secret │ SSM Param  │ SSM Param  │
│ GOOGLE_CLIENT_ID                   │ dev app    │ staging app│ prod app   │
│ GOOGLE_CLIENT_SECRET               │ dev secret │ SSM Param  │ SSM Param  │
│ ANTHROPIC_API_KEY                  │ dev key    │ SSM Param  │ SSM Param  │
│ RESEND_API_KEY                     │ dev key    │ SSM Param  │ SSM Param  │
│ VITE_BACKEND_API_URL               │ localhost  │ staging API│ prod API   │
│ SENTRY_DSN                         │ (disabled) │ staging DSN│ prod DSN   │
│ POSTHOG_KEY                        │ (disabled) │ staging key│ prod key   │
│ S3_BUCKET_NAME                     │ local mock │ h4e-stg-*  │ h4e-prod-* │
│ LOG_LEVEL                          │ debug      │ info       │ warn       │
│ RATE_LIMIT_WINDOW_MS               │ 60000      │ 60000      │ 60000      │
│ RATE_LIMIT_MAX_REQUESTS            │ 1000       │ 200        │ 100        │
└────────────────────────────────────┴────────────┴────────────┴────────────┘
```

---

## 1.4 Monitoring & Observability

### 1.4.1 Monitoring Stack Overview

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                      OBSERVABILITY ARCHITECTURE                                │
└────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐     ┌───────────────────┐     ┌──────────────────┐
  │  Express    │────▶│  CloudWatch Logs  │────▶│  CloudWatch      │
  │  Backend    │     │  (Structured JSON) │     │  Insights        │
  │             │     └───────────────────┘     │  (Query/Search)  │
  │  Winston    │                                └──────────────────┘
  │  Logger     │
  └──────┬──────┘     ┌───────────────────┐     ┌──────────────────┐
         │            │  Sentry           │────▶│  Error Alerts    │
         ├───────────▶│  (Error Tracking) │     │  (Slack + Email) │
         │            └───────────────────┘     └──────────────────┘
         │
         │            ┌───────────────────┐     ┌──────────────────┐
         ├───────────▶│  PostHog          │────▶│  Product         │
         │            │  (Analytics)      │     │  Insights        │
         │            └───────────────────┘     └──────────────────┘
         │
         │            ┌───────────────────┐     ┌──────────────────┐
         └───────────▶│  CloudWatch       │────▶│  PagerDuty /     │
                      │  Metrics          │     │  SNS Alerts      │
                      │  (Custom)         │     └──────────────────┘
                      └───────────────────┘

  ┌────────────────────────────────────────────────────────────────────┐
  │  EXTERNAL UPTIME: BetterUptime / UptimeRobot (free tier)          │
  │  - GET https://api.hub4estate.com/api/health every 60s            │
  │  - Alert on: 2 consecutive failures                               │
  │  - Notify: SMS + Slack + Email to shreshth.agarwal@hub4estate.com │
  └────────────────────────────────────────────────────────────────────┘
```

### 1.4.2 Structured Logging Configuration

```typescript
// backend/src/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'ISO' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'hub4estate-backend',
    version: process.env.APP_VERSION || 'unknown',
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console (for PM2 / CloudWatch agent pickup)
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json(),
    }),
    // File transport for production (CloudWatch agent reads these)
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: '/var/log/hub4estate/error.log',
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: '/var/log/hub4estate/combined.log',
            maxsize: 50 * 1024 * 1024, // 50MB
            maxFiles: 10,
          }),
        ]
      : []),
  ],
});

// Structured log helpers
export const logInquiry = (inquiryId: string, action: string, meta?: object) =>
  logger.info('inquiry_event', { inquiryId, action, ...meta });

export const logQuote = (quoteId: string, action: string, meta?: object) =>
  logger.info('quote_event', { quoteId, action, ...meta });

export const logAuth = (userId: string, action: string, meta?: object) =>
  logger.info('auth_event', { userId, action, ...meta });

export const logPerformance = (operation: string, durationMs: number, meta?: object) =>
  logger.info('performance', { operation, durationMs, ...meta });

export const logAI = (model: string, operation: string, meta?: object) =>
  logger.info('ai_event', { model, operation, ...meta });

export default logger;
```

### 1.4.3 CloudWatch Dashboards

```
┌────────────────────────────────────────────────────────────────────┐
│           CLOUDWATCH DASHBOARD: Hub4Estate Production               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ROW 1: Infrastructure Health                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ EC2 CPU    │  │ EC2 Memory │  │ RDS CPU    │  │ RDS Free   │  │
│  │ Avg: 35%   │  │ Avg: 62%   │  │ Avg: 28%   │  │ Storage    │  │
│  │ [sparkline]│  │ [sparkline]│  │ [sparkline]│  │ 45 GB      │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │
│                                                                    │
│  ROW 2: Application Metrics                                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ Request/s  │  │ Error Rate │  │ p50 Latency│  │ p95 Latency│  │
│  │ 45 req/s   │  │ 0.3%       │  │ 120ms      │  │ 450ms      │  │
│  │ [sparkline]│  │ [sparkline]│  │ [sparkline]│  │ [sparkline]│  │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │
│                                                                    │
│  ROW 3: Business Metrics                                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ Active     │  │ Inquiries  │  │ Quotes     │  │ AI Parse   │  │
│  │ Users      │  │ /hour      │  │ /hour      │  │ Time (avg) │  │
│  │ 234        │  │ 18         │  │ 42         │  │ 3.2s       │  │
│  │ [sparkline]│  │ [sparkline]│  │ [sparkline]│  │ [sparkline]│  │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │
│                                                                    │
│  ROW 4: Cache & Queue Health                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ Redis Hit  │  │ Redis Mem  │  │ SQS Depth  │  │ DLQ Count  │  │
│  │ Rate: 87%  │  │ 45%        │  │ 3 msgs     │  │ 0 msgs     │  │
│  │ [sparkline]│  │ [sparkline]│  │ [sparkline]│  │ [sparkline]│  │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 1.4.4 CloudWatch Alarms

| Alarm | Metric | Threshold | Period | Action |
|-------|--------|-----------|--------|--------|
| High CPU | EC2 CPUUtilization | > 80% | 5 min (2 datapoints) | SNS -> Slack + ASG scale-out |
| High Memory | Custom: MemoryUsage | > 85% | 5 min (2 datapoints) | SNS -> Slack |
| RDS CPU | RDS CPUUtilization | > 70% | 5 min (3 datapoints) | SNS -> Slack + Email |
| RDS Storage | RDS FreeStorageSpace | < 5 GB | 5 min (1 datapoint) | SNS -> Slack + Email |
| RDS Connections | RDS DatabaseConnections | > 80% of max | 5 min (2 datapoints) | SNS -> Slack |
| Error Rate | ALB HTTPCode_Target_5XX | > 10/min | 1 min (3 datapoints) | SNS -> Slack + PagerDuty |
| High Latency | ALB TargetResponseTime | p95 > 2s | 5 min (3 datapoints) | SNS -> Slack |
| Health Check Fail | ALB UnHealthyHostCount | > 0 | 1 min (2 datapoints) | SNS -> Slack + PagerDuty |
| Redis Memory | ElastiCache BytesUsedForCache | > 80% of max | 5 min (2 datapoints) | SNS -> Slack |
| SQS DLQ Non-Empty | SQS ApproximateNumberOfMessagesVisible | > 0 | 5 min (1 datapoint) | SNS -> Slack |
| Zero Requests | ALB RequestCount | < 1 | 5 min (3 datapoints) | SNS -> Slack (possible outage) |
| SSL Expiry | Custom Lambda check | < 14 days | Daily | SNS -> Email |

### 1.4.5 Sentry Integration

```typescript
// backend/src/lib/sentry.ts
import * as Sentry from '@sentry/node';

export function initSentry() {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: `hub4estate-backend@${process.env.APP_VERSION}`,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 0.1,
      integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
        Sentry.prismaIntegration(),
      ],
      beforeSend(event) {
        // Scrub sensitive data
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
      ignoreErrors: [
        'TokenExpiredError',       // Expected JWT expiry
        'UnauthorizedError',       // Expected auth failures
        /^Rate limit exceeded/,    // Expected rate limiting
      ],
    });
  }
}

// Express error handler (add AFTER all routes)
export const sentryErrorHandler = Sentry.expressErrorHandler();

// Manual capture helpers
export const captureBusinessError = (error: Error, context: Record<string, any>) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'business');
    scope.setContext('business', context);
    Sentry.captureException(error);
  });
};
```

### 1.4.6 Custom Business Metrics

```typescript
// backend/src/lib/metrics.ts
import { CloudWatch } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatch({ region: 'ap-south-1' });
const NAMESPACE = 'Hub4Estate/Application';

export async function publishMetric(
  metricName: string,
  value: number,
  unit: 'Count' | 'Milliseconds' | 'Percent' = 'Count',
  dimensions: Record<string, string> = {}
) {
  await cloudwatch.putMetricData({
    Namespace: NAMESPACE,
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
}

// Usage examples across the codebase:

// In inquiry controller:
publishMetric('InquirySubmitted', 1, 'Count', { Category: categoryName });
publishMetric('InquiryParseTime', parseTimeMs, 'Milliseconds');

// In quote controller:
publishMetric('QuoteSubmitted', 1, 'Count', { DealerId: dealerId });
publishMetric('QuoteResponseTime', timeSinceInquiryMs, 'Milliseconds');

// In AI service:
publishMetric('AIProcessingTime', durationMs, 'Milliseconds', { Model: 'claude-3' });
publishMetric('AIParseSuccess', success ? 1 : 0, 'Count');

// In auth middleware:
publishMetric('AuthSuccess', 1, 'Count', { Provider: 'google' });
publishMetric('AuthFailure', 1, 'Count', { Reason: reason });
```

### 1.4.7 Health Check Endpoint

```typescript
// backend/src/routes/health.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/health', async (req, res) => {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'healthy', latencyMs: Date.now() - dbStart };
  } catch (err) {
    checks.database = { status: 'unhealthy', error: (err as Error).message };
  }

  // Redis check (when implemented)
  // const redisStart = Date.now();
  // try {
  //   await redis.ping();
  //   checks.redis = { status: 'healthy', latencyMs: Date.now() - redisStart };
  // } catch (err) {
  //   checks.redis = { status: 'unhealthy', error: (err as Error).message };
  // }

  // Memory check
  const memUsage = process.memoryUsage();
  checks.memory = {
    status: memUsage.heapUsed / memUsage.heapTotal < 0.9 ? 'healthy' : 'warning',
    latencyMs: 0,
  };

  const allHealthy = Object.values(checks).every(
    (c) => c.status === 'healthy' || c.status === 'warning'
  );

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    version: process.env.APP_VERSION || 'unknown',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks,
  });
});

export default router;
```

---

## 1.5 Security Infrastructure

### 1.5.1 Security Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS (Defense in Depth)                       │
└────────────────────────────────────────────────────────────────────────────────┘

  LAYER 1: Edge (CloudFront + WAF + Shield)
  ──────────────────────────────────────────
  - AWS WAF: SQL injection, XSS, rate limiting, geo-blocking
  - AWS Shield Standard: Automatic DDoS protection (free)
  - CloudFront: TLS 1.2+ only, HSTS headers

  LAYER 2: Network (VPC + Security Groups + NACLs)
  ──────────────────────────────────────────────────
  - VPC isolation with public/private/isolated subnets
  - Security groups: principle of least privilege
  - NACLs: additional subnet-level filtering
  - NAT Gateway: private subnet internet access (outbound only)

  LAYER 3: Application (Express Middleware)
  ─────────────────────────────────────────
  - Helmet.js: security headers (CSP, HSTS, X-Frame-Options)
  - express-rate-limit: per-IP and per-user rate limiting
  - CORS: whitelist-only origin policy
  - express-validator + Zod: input validation
  - JWT + refresh token rotation
  - CSRF protection (double-submit cookie)

  LAYER 4: Data (Encryption + Access Control)
  ────────────────────────────────────────────
  - RDS: AES-256 encryption at rest (AWS KMS)
  - S3: SSE-S3 encryption at rest
  - TLS 1.2+: encryption in transit (all connections)
  - Prisma: parameterized queries (SQL injection prevention)
  - bcrypt: password hashing (cost factor 12)
  - PII: minimal collection, encrypted storage

  LAYER 5: Operations (IAM + Secrets + Audit)
  ────────────────────────────────────────────
  - IAM roles per service (no shared credentials)
  - AWS Secrets Manager: API keys, DB credentials
  - CloudTrail: full AWS API audit log
  - Application audit log: all admin actions recorded
```

### 1.5.2 WAF Rules Configuration

| Rule | Priority | Action | Description |
|------|----------|--------|-------------|
| AWS-AWSManagedRulesCommonRuleSet | 1 | Block | OWASP Top 10 protections |
| AWS-AWSManagedRulesSQLiRuleSet | 2 | Block | SQL injection patterns |
| AWS-AWSManagedRulesKnownBadInputsRuleSet | 3 | Block | Known exploit patterns |
| AWS-AWSManagedRulesLinuxRuleSet | 4 | Block | Linux-specific exploits |
| Custom-RateLimit-Global | 5 | Block (429) | > 2000 requests/5min per IP |
| Custom-RateLimit-API | 6 | Block (429) | > 100 requests/min per IP on /api/* |
| Custom-RateLimit-Auth | 7 | Block (429) | > 10 requests/min per IP on /api/auth/* |
| Custom-GeoBlock | 8 | Block | Block known attack-source countries (configurable) |
| Custom-BotDetection | 9 | Count/Block | User-agent pattern matching, honey pot detection |
| Custom-SizeRestriction | 10 | Block | Request body > 10 MB |

### 1.5.3 Security Groups

```
┌────────────────────────────────────────────────────────────────────┐
│                    SECURITY GROUP RULES                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SG: h4e-alb-sg (Application Load Balancer)                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Inbound:                                                    │  │
│  │   443 (HTTPS) from 0.0.0.0/0     (public internet)         │  │
│  │    80 (HTTP)  from 0.0.0.0/0     (redirect to HTTPS)       │  │
│  │ Outbound:                                                   │  │
│  │  3001         to h4e-backend-sg   (backend instances)       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  SG: h4e-backend-sg (EC2 Backend Instances)                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Inbound:                                                    │  │
│  │  3001         from h4e-alb-sg     (ALB health checks + API) │  │
│  │    22 (SSH)   from 10.0.0.0/16    (VPC internal only)       │  │
│  │ Outbound:                                                   │  │
│  │   443         to 0.0.0.0/0        (external APIs)           │  │
│  │  5432         to h4e-rds-sg       (database)                │  │
│  │  6379         to h4e-redis-sg     (cache)                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  SG: h4e-rds-sg (RDS PostgreSQL)                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Inbound:                                                    │  │
│  │  5432         from h4e-backend-sg (backend instances only)  │  │
│  │  5432         from h4e-lambda-sg  (Lambda functions)        │  │
│  │ Outbound:                                                   │  │
│  │  (none needed -- RDS does not initiate connections)         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  SG: h4e-redis-sg (ElastiCache Redis)                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Inbound:                                                    │  │
│  │  6379         from h4e-backend-sg (backend instances only)  │  │
│  │ Outbound:                                                   │  │
│  │  (none needed)                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  SG: h4e-lambda-sg (Lambda Functions)                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Inbound:                                                    │  │
│  │  (none -- Lambda is invoked, not contacted)                 │  │
│  │ Outbound:                                                   │  │
│  │   443         to 0.0.0.0/0        (external APIs, S3, SQS) │  │
│  │  5432         to h4e-rds-sg       (database)                │  │
│  │  6379         to h4e-redis-sg     (cache)                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 1.5.4 IAM Roles & Policies

| Role | Attached To | Policies | Scope |
|------|------------|----------|-------|
| `h4e-ec2-backend-role` | EC2 instances | S3 read/write to h4e-* buckets, SSM GetParameter, SQS Send/Receive, CloudWatch PutMetric, SNS Publish | ap-south-1 only |
| `h4e-lambda-execution-role` | Lambda functions | S3 read/write, SQS read, CloudWatch Logs, VPC access | Function-specific resource ARNs |
| `h4e-rds-monitoring-role` | RDS Enhanced Monitoring | CloudWatch Logs write | RDS instance ARN only |
| `h4e-amplify-role` | Amplify build | S3 read (build artifacts), CloudFront invalidation | App-specific |
| `h4e-ci-cd-role` | GitHub Actions (OIDC) | EC2 describe, SSM send-command, S3 deploy bucket, ELB modify | Scoped to h4e-* resources |
| `h4e-admin-role` | Shreshth's AWS console | Full access to h4e-* resources, NO IAM write | h4e-* resources only |

### 1.5.5 Secrets Management

```
┌────────────────────────────────────────────────────────────────────┐
│              AWS SYSTEMS MANAGER PARAMETER STORE                    │
│              (used until Secrets Manager is cost-justified)         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  /hub4estate/production/database-url        (SecureString, KMS)   │
│  /hub4estate/production/jwt-secret          (SecureString, KMS)   │
│  /hub4estate/production/jwt-refresh-secret  (SecureString, KMS)   │
│  /hub4estate/production/google-client-id    (String)              │
│  /hub4estate/production/google-client-secret(SecureString, KMS)   │
│  /hub4estate/production/anthropic-api-key   (SecureString, KMS)   │
│  /hub4estate/production/openai-api-key      (SecureString, KMS)   │
│  /hub4estate/production/resend-api-key      (SecureString, KMS)   │
│  /hub4estate/production/sentry-dsn          (String)              │
│  /hub4estate/production/posthog-api-key     (String)              │
│  /hub4estate/production/redis-url           (SecureString, KMS)   │
│                                                                    │
│  /hub4estate/staging/database-url           (SecureString, KMS)   │
│  /hub4estate/staging/jwt-secret             (SecureString, KMS)   │
│  ... (same structure, different values)                            │
│                                                                    │
│  Rotation Policy:                                                  │
│  - JWT secrets: rotate every 90 days                              │
│  - API keys: rotate on suspected compromise                       │
│  - Database password: rotate every 180 days                       │
│  - All rotations trigger Slack notification + deployment           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 1.5.6 Backup Strategy

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                          BACKUP STRATEGY                                       │
├──────────────────┬─────────────────┬────────────┬──────────────────────────────┤
│ Asset            │ Method          │ Frequency  │ Retention                    │
├──────────────────┼─────────────────┼────────────┼──────────────────────────────┤
│ RDS PostgreSQL   │ Automated       │ Daily      │ 14 days (automated)          │
│ (primary)        │ snapshots       │            │                              │
├──────────────────┼─────────────────┼────────────┼──────────────────────────────┤
│ RDS PostgreSQL   │ Manual          │ Weekly     │ 90 days                      │
│ (weekly)         │ snapshots       │ (Sunday)   │                              │
├──────────────────┼─────────────────┼────────────┼──────────────────────────────┤
│ RDS PostgreSQL   │ Pre-deployment  │ Every      │ 7 days                       │
│ (pre-deploy)     │ snapshots       │ deploy     │                              │
├──────────────────┼─────────────────┼────────────┼──────────────────────────────┤
│ S3 Buckets       │ Versioning      │ On change  │ 90 days (noncurrent         │
│                  │ enabled         │            │ version expiry)              │
├──────────────────┼─────────────────┼────────────┼──────────────────────────────┤
│ S3 Buckets       │ Cross-region    │ Real-time  │ Same as source               │
│ (critical)       │ replication     │            │ (ap-south-2 / Hyderabad)     │
├──────────────────┼─────────────────┼────────────┼──────────────────────────────┤
│ ElastiCache      │ Daily snapshots │ Daily      │ 7 days                       │
│ Redis            │                 │            │ (cache can be rebuilt)        │
├──────────────────┼─────────────────┼────────────┼──────────────────────────────┤
│ Application Code │ Git repository  │ Every      │ Permanent                    │
│                  │ (GitHub)        │ commit     │                              │
├──────────────────┼─────────────────┼────────────┼──────────────────────────────┤
│ Infrastructure   │ Terraform state │ Every      │ S3 versioning (permanent)    │
│ as Code          │ in S3           │ apply      │                              │
└──────────────────┴─────────────────┴────────────┴──────────────────────────────┘
```

### 1.5.7 Disaster Recovery Plan

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                       DISASTER RECOVERY TARGETS                                │
├────────────────────────┬───────────────────────────────────────────────────────┤
│ Metric                 │ Target                                                │
├────────────────────────┼───────────────────────────────────────────────────────┤
│ RTO (Recovery Time     │ Tier 1 (API + Auth): 15 minutes                      │
│ Objective)             │ Tier 2 (AI + Scraping): 2 hours                      │
│                        │ Tier 3 (Analytics + Reports): 4 hours                │
├────────────────────────┼───────────────────────────────────────────────────────┤
│ RPO (Recovery Point    │ Database: 5 minutes (point-in-time recovery)          │
│ Objective)             │ Files/S3: 0 (versioning + cross-region replication)   │
│                        │ Cache: N/A (rebuildable from DB)                      │
├────────────────────────┼───────────────────────────────────────────────────────┤
│ Uptime SLA             │ 99.9% (8.76 hours downtime/year max)                 │
│                        │ Measured monthly, excluding planned maintenance       │
└────────────────────────┴───────────────────────────────────────────────────────┘

  DISASTER SCENARIOS & RESPONSE PLAYBOOKS:

  Scenario 1: Single EC2 instance failure
  ─────────────────────────────────────────
  Detection: ALB health check fails within 30s
  Response:  ASG automatically launches replacement (< 3 min)
  Impact:    Zero downtime (min 2 instances, ALB routes to healthy)

  Scenario 2: Full AZ failure
  ────────────────────────────
  Detection: Multiple health check failures from one AZ
  Response:  ALB routes to healthy AZ. ASG launches instances in healthy AZ.
             RDS fails over to standby (Multi-AZ, < 2 min automatic)
  Impact:    < 2 minutes degraded performance during RDS failover

  Scenario 3: Database corruption
  ────────────────────────────────
  Detection: Application errors + data integrity alerts
  Response:  1. Immediately route traffic to maintenance page
             2. Restore RDS from point-in-time recovery (RPO: 5 min)
             3. Verify data integrity
             4. Resume traffic
  Impact:    15-30 minutes downtime, < 5 minutes data loss

  Scenario 4: Full region failure (ap-south-1)
  ──────────────────────────────────────────────
  Detection: Route 53 health check fails for all ap-south-1 endpoints
  Response:  1. Route 53 failover to static maintenance page (S3 in us-east-1)
             2. Manual: Launch infrastructure in ap-south-2 (Hyderabad)
             3. Restore RDS from cross-region snapshot
             4. Update Route 53 to point to new region
  Impact:    2-4 hours (acceptable for current scale)
  Note:      Full multi-region active-active is not cost-justified until
             50,000+ DAU. This is a manual DR plan.

  Scenario 5: Security breach / data exfiltration
  ──────────────────────────────────────────────────
  Detection: CloudTrail anomaly, WAF spike, Sentry unusual errors
  Response:  1. Rotate all secrets immediately
             2. Revoke all active sessions (clear Redis)
             3. Block suspicious IPs via WAF
             4. Audit CloudTrail for scope of breach
             5. Notify affected users (if PII exposed)
             6. Engage AWS support (Business tier)
  Impact:    Variable. Communication plan pre-drafted.
```

---

## 1.6 Cost Optimization

### 1.6.1 Current vs. Projected Costs (INR per month)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│              INFRASTRUCTURE COST PROJECTION (INR/month)                        │
├────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────────┤
│ Service            │ Current  │ Phase 1  │ Phase 2  │ Phase 3  │ Phase 4      │
│                    │ (Now)    │ (M1-3)   │ (M4-6)   │ (M7-12)  │ (M13-24)     │
│                    │ <100 DAU │ ~500 DAU │ ~2K DAU  │ ~10K DAU │ ~50K DAU     │
├────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ EC2 (backend)      │ 1,500    │ 6,500    │ 10,000   │ 32,000   │ 1,20,000     │
│ RDS PostgreSQL     │ 1,200    │ 3,500    │ 8,000    │ 22,000   │ 65,000       │
│ ElastiCache Redis  │ 0        │ 2,500    │ 2,500    │ 8,000    │ 25,000       │
│ S3 Storage         │ 200      │ 500      │ 1,500    │ 4,000    │ 10,000       │
│ CloudFront CDN     │ 0        │ 200      │ 800      │ 3,000    │ 8,000        │
│ ALB                │ 0        │ 2,000    │ 2,000    │ 2,500    │ 3,000        │
│ Route 53           │ 50       │ 100      │ 100      │ 200      │ 200          │
│ Lambda             │ 0        │ 0        │ 500      │ 2,000    │ 8,000        │
│ SQS/SNS            │ 0        │ 0        │ 100      │ 500      │ 2,000        │
│ WAF                │ 0        │ 500      │ 500      │ 500      │ 500          │
│ CloudWatch         │ 0        │ 300      │ 500      │ 1,500    │ 5,000        │
│ Data Transfer      │ 100      │ 500      │ 1,500    │ 5,000    │ 15,000       │
│ Secrets Manager    │ 0        │ 0        │ 200      │ 200      │ 200          │
│ Amplify            │ 0        │ 0        │ 500      │ 1,500    │ 3,000        │
├────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ AWS Subtotal       │ 3,050    │ 16,600   │ 28,700   │ 82,900   │ 2,64,900     │
├────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ EXTERNAL SERVICES  │          │          │          │          │              │
├────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ Sentry             │ 0        │ 0        │ 0        │ 2,500    │ 6,000        │
│ PostHog            │ 0        │ 0        │ 0        │ 0        │ 8,000        │
│ Resend (Email)     │ 0        │ 0        │ 500      │ 1,500    │ 4,000        │
│ Anthropic (Claude) │ 500      │ 2,000    │ 5,000    │ 15,000   │ 40,000       │
│ OpenAI (fallback)  │ 200      │ 500      │ 1,000    │ 3,000    │ 8,000        │
│ Domain + SSL       │ 100      │ 100      │ 100      │ 100      │ 100          │
│ GitHub (Team)      │ 0        │ 700      │ 1,500    │ 3,000    │ 5,000        │
│ BetterUptime       │ 0        │ 0        │ 0        │ 1,500    │ 1,500        │
├────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ External Subtotal  │ 800      │ 3,300    │ 8,100    │ 26,600   │ 72,600       │
├────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ GRAND TOTAL        │ 3,850    │ 19,900   │ 36,800   │ 1,09,500 │ 3,37,500     │
│                    │ (~$46)   │ (~$239)  │ (~$442)  │ (~$1,314)│ (~$4,050)    │
├────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ Cost per DAU       │ ~38.50   │ ~39.80   │ ~18.40   │ ~10.95   │ ~6.75        │
│ (INR/month)        │          │          │          │          │              │
└────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘
```

### 1.6.2 Cost Optimization Strategies

**Reserved Instances (when DAU > 2,000):**

| Resource | On-Demand (INR/mo) | 1-Year RI (INR/mo) | Savings |
|----------|-------------------|---------------------|---------|
| EC2 t3.medium x2 | 6,500 | 4,200 | 35% |
| RDS db.t3.medium | 8,000 | 5,200 | 35% |
| ElastiCache t3.small | 2,500 | 1,600 | 36% |
| **Total with RI** | **17,000** | **11,000** | **35%** |

**S3 Lifecycle Policies:**

```json
{
  "Rules": [
    {
      "ID": "ProductImagesLifecycle",
      "Status": "Enabled",
      "Filter": { "Prefix": "product-images/" },
      "Transitions": [
        { "Days": 90, "StorageClass": "STANDARD_IA" },
        { "Days": 365, "StorageClass": "GLACIER" }
      ]
    },
    {
      "ID": "LogsCleanup",
      "Status": "Enabled",
      "Filter": { "Prefix": "logs/" },
      "Expiration": { "Days": 30 }
    },
    {
      "ID": "TempUploadsCleanup",
      "Status": "Enabled",
      "Filter": { "Prefix": "temp-uploads/" },
      "Expiration": { "Days": 1 }
    },
    {
      "ID": "OldVersionCleanup",
      "Status": "Enabled",
      "NoncurrentVersionExpiration": { "NoncurrentDays": 90 }
    }
  ]
}
```

**Right-Sizing Recommendations:**

| Phase | Current Size | Right-Sized | When to Upgrade |
|-------|-------------|-------------|-----------------|
| Phase 1 | t3.small (current) | t3.medium (2 instances) | Immediately (need redundancy) |
| Phase 2 | t3.medium x2 | t3.medium x3 | CPU avg > 50% for 1 week |
| Phase 3 | t3.medium x3+ | t3.large x4 | CPU avg > 60% or p95 > 1s |
| Phase 3 | db.t3.micro | db.t3.medium -> db.r6g.large | RDS CPU > 60% or connections > 70% max |

**Cost Monitoring:**

- AWS Budgets: Alert at 80% and 100% of monthly budget
- Weekly cost report to founder email
- Per-service cost breakdown in CloudWatch dashboard
- Tag all resources: `Environment`, `Service`, `CostCenter=hub4estate`
- Monthly cost review meeting (when team > 3 people)

---

# 2. Testing Strategy

---

## 2.1 Testing Pyramid

```
                          ╱╲
                         ╱  ╲
                        ╱ E2E╲           5-10 critical user journeys
                       ╱______╲          Playwright, real browser
                      ╱        ╲
                     ╱Integration╲       API route tests, DB integration
                    ╱____________╲       Supertest + test database
                   ╱              ╲
                  ╱   Unit Tests   ╲     Pure logic, services, utilities
                 ╱__________________╲    Jest + React Testing Library
                ╱                    ╲
               ╱    Static Analysis   ╲  TypeScript, ESLint, Prisma validate
              ╱________________________╲ Zero runtime cost

  Coverage Targets:
  ─────────────────
  Unit Tests:        80% line coverage (backend), 75% (frontend)
  Integration Tests: 60% of API routes covered
  E2E Tests:         100% of critical paths (auth, inquiry, quote, deal)
  Overall:           75%+ combined line coverage
```

## 2.2 Unit Testing

### 2.2.1 Backend Unit Tests (Jest)

```typescript
// backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/generated/**',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  setupFilesAfterSetup: ['<rootDir>/src/test/setup.ts'],
};

export default config;
```

**Example unit test -- Inquiry Parser Service:**

```typescript
// backend/src/services/__tests__/inquiry-parser.test.ts
import { InquiryParser } from '../inquiry-parser';

describe('InquiryParser', () => {
  let parser: InquiryParser;

  beforeEach(() => {
    parser = new InquiryParser();
  });

  describe('parseInquiryText', () => {
    it('extracts brand and model from plain text', () => {
      const result = parser.parseInquiryText('I need 200 Philips 15W LED panels');

      expect(result).toEqual({
        brand: 'Philips',
        productType: 'LED Panel',
        specifications: { wattage: '15W' },
        quantity: 200,
        confidence: expect.any(Number),
      });
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('handles multiple products in one inquiry', () => {
      const result = parser.parseInquiryText(
        'Need 50m of Havells FRLS 2.5mm cable and 20 Anchor Roma switches'
      );

      expect(result.items).toHaveLength(2);
      expect(result.items[0].brand).toBe('Havells');
      expect(result.items[1].brand).toBe('Anchor');
    });

    it('returns low confidence for ambiguous input', () => {
      const result = parser.parseInquiryText('need some wires');

      expect(result.confidence).toBeLessThan(0.5);
      expect(result.clarificationNeeded).toBe(true);
    });

    it('normalizes brand name variations', () => {
      const variations = ['phillips', 'Philps', 'PHILIPS', 'philips'];
      for (const brand of variations) {
        const result = parser.parseInquiryText(`${brand} 15W panel`);
        expect(result.brand).toBe('Philips');
      }
    });
  });

  describe('parseSlipImage', () => {
    it('extracts line items from OCR text', () => {
      const ocrText = `
        INVOICE #4521
        1. Philips 15W LED Panel x 200   @585   117,000
        2. Havells FRLS 2.5mm x 100m     @95     9,500
        TOTAL: 126,500
      `;

      const result = parser.parseSlipOCR(ocrText);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].unitPrice).toBe(585);
      expect(result.items[0].quantity).toBe(200);
      expect(result.totalAmount).toBe(126500);
    });
  });
});
```

### 2.2.2 Frontend Unit Tests (Vitest + React Testing Library)

```typescript
// frontend/src/components/__tests__/InquiryForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InquiryForm } from '../InquiryForm';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('InquiryForm', () => {
  it('renders all required form fields', () => {
    render(<InquiryForm />, { wrapper });

    expect(screen.getByLabelText(/product description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delivery city/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    render(<InquiryForm />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/product description is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/category is required/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<InquiryForm onSubmit={onSubmit} />, { wrapper });

    await userEvent.type(
      screen.getByLabelText(/product description/i),
      '200 Philips 15W LED panels'
    );
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'lighting');
    await userEvent.type(screen.getByLabelText(/quantity/i), '200');
    await userEvent.type(screen.getByLabelText(/delivery city/i), 'Jaipur');

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: '200 Philips 15W LED panels',
          category: 'lighting',
          quantity: 200,
          city: 'Jaipur',
        })
      );
    });
  });

  it('shows file upload area for slip scanning', () => {
    render(<InquiryForm />, { wrapper });

    expect(screen.getByText(/upload a material slip/i)).toBeInTheDocument();
    expect(screen.getByText(/drag & drop or click/i)).toBeInTheDocument();
  });
});
```

## 2.3 Integration Testing

```typescript
// backend/jest.integration.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.integration.test.ts'],
  globalSetup: '<rootDir>/src/test/integration-setup.ts',
  globalTeardown: '<rootDir>/src/test/integration-teardown.ts',
  testTimeout: 30000,
};

export default config;
```

```typescript
// backend/src/test/integration-setup.ts
import { execSync } from 'child_process';

export default async function setup() {
  // Create test database
  process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/hub4estate_test';
  execSync('npx prisma migrate deploy', { env: process.env });
  execSync('npx prisma db seed', { env: process.env });
}
```

```typescript
// backend/src/routes/__tests__/inquiry.integration.test.ts
import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../lib/prisma';
import { generateTestToken } from '../../test/helpers';

describe('POST /api/inquiries', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await generateTestToken({ role: 'BUYER' });
  });

  afterEach(async () => {
    await prisma.inquiry.deleteMany({ where: { description: { startsWith: 'TEST_' } } });
  });

  it('creates an inquiry and returns parsed specs', async () => {
    const response = await request(app)
      .post('/api/inquiries')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'TEST_200 Philips 15W LED panels for office installation',
        categoryId: 'lighting-led-panels',
        quantity: 200,
        deliveryCity: 'Jaipur',
        deliveryState: 'Rajasthan',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      status: 'PENDING',
      parsedSpecs: expect.objectContaining({
        brand: 'Philips',
        wattage: '15W',
      }),
      matchedDealerCount: expect.any(Number),
    });

    // Verify database
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: response.body.id },
      include: { dealerMatches: true },
    });
    expect(inquiry).not.toBeNull();
    expect(inquiry!.dealerMatches.length).toBeGreaterThan(0);
  });

  it('returns 401 without authentication', async () => {
    await request(app)
      .post('/api/inquiries')
      .send({ description: 'TEST_inquiry' })
      .expect(401);
  });

  it('returns 400 for empty description', async () => {
    await request(app)
      .post('/api/inquiries')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: '', categoryId: 'lighting-led-panels' })
      .expect(400);
  });

  it('rate-limits inquiry creation to 10 per hour', async () => {
    // Create 10 inquiries
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/inquiries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: `TEST_rate_limit_${i}`,
          categoryId: 'lighting-led-panels',
          quantity: 1,
          deliveryCity: 'Jaipur',
        })
        .expect(201);
    }

    // 11th should be rate-limited
    await request(app)
      .post('/api/inquiries')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'TEST_rate_limit_11',
        categoryId: 'lighting-led-panels',
        quantity: 1,
        deliveryCity: 'Jaipur',
      })
      .expect(429);
  });
});

describe('GET /api/inquiries/:id/quotes', () => {
  it('returns quotes only after dealer submits them (blind matching)', async () => {
    const buyerToken = await generateTestToken({ role: 'BUYER' });
    const dealerToken = await generateTestToken({ role: 'DEALER' });

    // Buyer creates inquiry
    const inquiry = await request(app)
      .post('/api/inquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        description: 'TEST_quote_flow Havells FRLS 2.5mm cable 200m',
        categoryId: 'wires-cables',
        quantity: 200,
        deliveryCity: 'Delhi',
      })
      .expect(201);

    // No quotes yet
    const emptyQuotes = await request(app)
      .get(`/api/inquiries/${inquiry.body.id}/quotes`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);
    expect(emptyQuotes.body.quotes).toHaveLength(0);

    // Dealer submits quote
    await request(app)
      .post(`/api/inquiries/${inquiry.body.id}/quotes`)
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({
        unitPrice: 85,
        totalPrice: 17000,
        deliveryDays: 3,
        notes: 'Brand new stock, direct from Havells warehouse',
      })
      .expect(201);

    // Buyer now sees 1 quote (dealer identity is hidden)
    const quotes = await request(app)
      .get(`/api/inquiries/${inquiry.body.id}/quotes`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(quotes.body.quotes).toHaveLength(1);
    expect(quotes.body.quotes[0].unitPrice).toBe(85);
    expect(quotes.body.quotes[0].dealerName).toBeUndefined(); // Blind!
    expect(quotes.body.quotes[0].dealerId).toBeUndefined();   // Blind!
  });
});
```

## 2.4 End-to-End Testing

```typescript
// frontend/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

```typescript
// frontend/e2e/critical-flows/buyer-inquiry-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Buyer Inquiry Flow (Critical Path)', () => {

  test.beforeEach(async ({ page }) => {
    // Login via test account (bypass Google OAuth in e2e)
    await page.goto('/auth/test-login?email=testbuyer@hub4estate.com');
    await expect(page).toHaveURL('/dashboard');
  });

  test('complete inquiry submission and quote comparison', async ({ page }) => {
    // Step 1: Navigate to inquiry form
    await page.click('[data-testid="create-inquiry-btn"]');
    await expect(page).toHaveURL('/inquiries/new');

    // Step 2: Fill inquiry form
    await page.fill('[data-testid="inquiry-description"]',
      '200 Philips 15W LED panels for office installation');
    await page.selectOption('[data-testid="inquiry-category"]', 'lighting');
    await page.fill('[data-testid="inquiry-quantity"]', '200');
    await page.fill('[data-testid="inquiry-city"]', 'Jaipur');
    await page.selectOption('[data-testid="inquiry-state"]', 'Rajasthan');

    // Step 3: Submit
    await page.click('[data-testid="submit-inquiry-btn"]');

    // Step 4: Verify success and AI parsing
    await expect(page.locator('[data-testid="inquiry-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="parsed-brand"]')).toHaveText('Philips');
    await expect(page.locator('[data-testid="matched-dealers"]')).toContainText(/\d+ dealers matched/);

    // Step 5: Navigate to inquiry detail
    await page.click('[data-testid="view-inquiry-btn"]');
    await expect(page.locator('[data-testid="inquiry-status"]')).toHaveText('Pending Quotes');

    // Step 6: Wait for quotes (in test environment, test dealers auto-quote)
    await expect(page.locator('[data-testid="quote-card"]')).toHaveCount(3, { timeout: 10000 });

    // Step 7: Compare quotes
    await page.click('[data-testid="compare-quotes-btn"]');
    await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="best-price-badge"]')).toBeVisible();

    // Step 8: Accept best quote
    await page.click('[data-testid="accept-quote-btn"]:first-child');
    await expect(page.locator('[data-testid="deal-confirmed"]')).toBeVisible();
    await expect(page.locator('[data-testid="dealer-contact"]')).toBeVisible(); // Contact revealed
  });

  test('slip upload and auto-fill', async ({ page }) => {
    await page.goto('/inquiries/new');

    // Upload a test slip image
    const fileInput = page.locator('[data-testid="slip-upload-input"]');
    await fileInput.setInputFiles('e2e/fixtures/test-invoice.png');

    // Wait for OCR processing
    await expect(page.locator('[data-testid="ocr-processing"]')).toBeVisible();
    await expect(page.locator('[data-testid="ocr-complete"]')).toBeVisible({ timeout: 30000 });

    // Verify auto-filled fields
    await expect(page.locator('[data-testid="inquiry-description"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="parsed-items-list"]')).toBeVisible();
  });
});

test.describe('Dealer Quote Flow (Critical Path)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/test-login?email=testdealer@hub4estate.com&role=dealer');
    await expect(page).toHaveURL('/dealer/dashboard');
  });

  test('dealer receives inquiry and submits quote', async ({ page }) => {
    // Step 1: See pending inquiries
    await expect(page.locator('[data-testid="pending-inquiry"]')).toHaveCount(1, { timeout: 5000 });

    // Step 2: Open inquiry (verify buyer identity is hidden)
    await page.click('[data-testid="pending-inquiry"]:first-child');
    await expect(page.locator('[data-testid="buyer-name"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="product-specs"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivery-city"]')).toBeVisible();

    // Step 3: Submit quote
    await page.fill('[data-testid="quote-unit-price"]', '465');
    await page.fill('[data-testid="quote-delivery-days"]', '3');
    await page.fill('[data-testid="quote-notes"]', 'Direct Philips stock, free delivery above 100 units');
    await page.click('[data-testid="submit-quote-btn"]');

    // Step 4: Verify submission
    await expect(page.locator('[data-testid="quote-submitted"]')).toBeVisible();
    await expect(page.locator('[data-testid="quote-status"]')).toHaveText('Submitted');
  });
});

test.describe('Authentication Flow', () => {

  test('Google OAuth redirects correctly', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="login-with-google"]');

    // In test env, this redirects to a mock OAuth provider
    await expect(page).toHaveURL(/accounts\.google\.com|auth\/callback/);
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/auth');
  });

  test('expired token triggers refresh', async ({ page }) => {
    // Login with a token that expires in 1 second
    await page.goto('/auth/test-login?email=testbuyer@hub4estate.com&expires=1');
    await page.waitForTimeout(2000);
    await page.goto('/dashboard');

    // Should still be logged in (refresh token worked)
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## 2.5 Load & Performance Testing

```javascript
// load-tests/k6/inquiry-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const inquiryLatency = new Trend('inquiry_latency');
const quoteLatency = new Trend('quote_latency');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 500 },  // Spike to 500 users
    { duration: '3m', target: 500 },  // Hold spike
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(50)<200', 'p(95)<1000', 'p(99)<2000'],
    errors: ['rate<0.01'],              // < 1% error rate
    inquiry_latency: ['p(95)<1500'],    // Inquiry creation < 1.5s at p95
    quote_latency: ['p(95)<500'],       // Quote submission < 500ms at p95
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.hub4estate.com';
const AUTH_TOKEN = __ENV.AUTH_TOKEN; // Pre-generated test token

export default function () {
  const headers = {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Scenario 1: Browse categories (read-heavy)
  const categories = http.get(`${BASE_URL}/api/categories`, { headers });
  check(categories, { 'categories 200': (r) => r.status === 200 });
  errorRate.add(categories.status !== 200);
  sleep(1);

  // Scenario 2: Search products
  const search = http.get(`${BASE_URL}/api/products?q=Philips+LED&category=lighting`, { headers });
  check(search, { 'search 200': (r) => r.status === 200 });
  sleep(0.5);

  // Scenario 3: Submit inquiry (write operation)
  const inquiryStart = Date.now();
  const inquiry = http.post(`${BASE_URL}/api/inquiries`, JSON.stringify({
    description: `Load test: ${__VU} Philips 15W LED panels`,
    categoryId: 'lighting-led-panels',
    quantity: Math.floor(Math.random() * 500) + 10,
    deliveryCity: ['Jaipur', 'Delhi', 'Mumbai', 'Bangalore'][Math.floor(Math.random() * 4)],
    deliveryState: 'Rajasthan',
  }), { headers });

  inquiryLatency.add(Date.now() - inquiryStart);
  check(inquiry, {
    'inquiry created': (r) => r.status === 201,
    'inquiry has ID': (r) => JSON.parse(r.body).id !== undefined,
  });
  errorRate.add(inquiry.status !== 201);
  sleep(2);

  // Scenario 4: View inquiry quotes
  if (inquiry.status === 201) {
    const inquiryId = JSON.parse(inquiry.body).id;
    const quotes = http.get(`${BASE_URL}/api/inquiries/${inquiryId}/quotes`, { headers });
    check(quotes, { 'quotes 200': (r) => r.status === 200 });
    sleep(1);
  }

  sleep(Math.random() * 3); // Random think time
}
```

**Load test execution:**

```bash
# Run against staging
k6 run --env BASE_URL=https://staging.hub4estate.com \
       --env AUTH_TOKEN=$(node scripts/generate-test-token.js) \
       load-tests/k6/inquiry-load-test.js

# Generate HTML report
k6 run --out json=results.json load-tests/k6/inquiry-load-test.js
```

**Performance targets:**

| Metric | Target | Degraded | Critical |
|--------|--------|----------|----------|
| API p50 latency | < 150ms | 150-500ms | > 500ms |
| API p95 latency | < 500ms | 500ms-1.5s | > 1.5s |
| API p99 latency | < 1.5s | 1.5s-3s | > 3s |
| Error rate | < 0.1% | 0.1-1% | > 1% |
| Inquiry creation | < 800ms | 800ms-2s | > 2s |
| AI parse time | < 3s | 3-8s | > 8s |
| Quote comparison load | < 200ms | 200ms-1s | > 1s |
| Frontend LCP | < 2s | 2-4s | > 4s |
| Frontend FID | < 100ms | 100-300ms | > 300ms |
| Frontend CLS | < 0.1 | 0.1-0.25 | > 0.25 |

## 2.6 Security Testing

### 2.6.1 OWASP ZAP Automated Scan

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly Monday 2 AM UTC
  workflow_dispatch:

jobs:
  zap-scan:
    name: OWASP ZAP Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: ZAP API Scan
        uses: zaproxy/action-api-scan@v0.7.0
        with:
          target: 'https://staging.hub4estate.com/api'
          rules_file_name: 'zap-rules.tsv'
          cmd_options: '-a'

      - name: Upload ZAP report
        uses: actions/upload-artifact@v4
        with:
          name: zap-report
          path: report_html.html

  dependency-scan:
    name: Dependency Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Backend audit
        run: cd backend && npm audit --audit-level=high

      - name: Frontend audit
        run: cd frontend && npm audit --audit-level=high

      - name: Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

### 2.6.2 Dependency Scanning Schedule

| Tool | Frequency | Scope | Alert Threshold |
|------|-----------|-------|-----------------|
| `npm audit` | Every CI run | Direct dependencies | High + Critical |
| Snyk | Weekly | All dependencies (transitive) | High + Critical |
| Dependabot | Daily | Version updates | Auto-PR for patch/minor |
| OWASP ZAP | Weekly | API endpoints | Medium and above |
| Container scan (Trivy) | Every Docker build | Base image vulnerabilities | High + Critical |

## 2.7 Visual Regression Testing

```typescript
// frontend/visual-regression/visual.spec.ts
import { test, expect } from '@playwright/test';

const pages = [
  { name: 'homepage', url: '/' },
  { name: 'login', url: '/auth' },
  { name: 'dashboard', url: '/dashboard', auth: true },
  { name: 'inquiry-form', url: '/inquiries/new', auth: true },
  { name: 'quote-comparison', url: '/inquiries/test-id/compare', auth: true },
  { name: 'dealer-dashboard', url: '/dealer/dashboard', auth: true, role: 'dealer' },
];

for (const page of pages) {
  test(`visual: ${page.name}`, async ({ page: playwrightPage }) => {
    if (page.auth) {
      const role = page.role || 'buyer';
      await playwrightPage.goto(`/auth/test-login?role=${role}`);
    }

    await playwrightPage.goto(page.url);
    await playwrightPage.waitForLoadState('networkidle');

    await expect(playwrightPage).toHaveScreenshot(`${page.name}.png`, {
      maxDiffPixelRatio: 0.01, // 1% tolerance
      animations: 'disabled',
    });
  });

  test(`visual-mobile: ${page.name}`, async ({ page: playwrightPage }) => {
    await playwrightPage.setViewportSize({ width: 375, height: 812 });
    if (page.auth) {
      await playwrightPage.goto('/auth/test-login');
    }
    await playwrightPage.goto(page.url);
    await playwrightPage.waitForLoadState('networkidle');

    await expect(playwrightPage).toHaveScreenshot(`${page.name}-mobile.png`, {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });
}
```

## 2.8 Coverage Targets

```
┌────────────────────────────────────────────────────────────────────┐
│                   TESTING COVERAGE TARGETS                         │
├──────────────────┬─────────┬─────────┬──────────┬─────────────────┤
│ Layer            │ Phase 1 │ Phase 2 │ Phase 3  │ Ultimate Target │
├──────────────────┼─────────┼─────────┼──────────┼─────────────────┤
│ Unit (Backend)   │ 60%     │ 75%     │ 80%      │ 85%             │
│ Unit (Frontend)  │ 50%     │ 65%     │ 75%      │ 80%             │
│ Integration      │ 40%     │ 50%     │ 60%      │ 70%             │
│ E2E (paths)      │ 3 flows │ 8 flows │ 15 flows │ All critical    │
│ Load testing     │ Manual  │ Monthly │ Weekly   │ Per deploy      │
│ Security scans   │ Manual  │ Weekly  │ Weekly   │ Per deploy      │
│ Visual regression│ None    │ Manual  │ Per PR   │ Per PR          │
├──────────────────┼─────────┼─────────┼──────────┼─────────────────┤
│ Combined minimum │ 50%     │ 65%     │ 75%      │ 80%             │
└──────────────────┴─────────┴─────────┴──────────┴─────────────────┘

  DEFINITION OF "CRITICAL PATHS" (must have E2E coverage from Phase 1):
  1. Google OAuth login -> dashboard
  2. Inquiry submission -> AI parsing -> dealer matching
  3. Dealer quote submission -> buyer comparison -> deal acceptance
```

---

# 3. Development Roadmap

---

## 3.1 Phase 1: Foundation (Months 1-3) -- MVP

**Goal:** A working marketplace where buyers submit inquiries, dealers receive them blindly, submit quotes, and buyers compare and accept deals.

**Team:** Founder (Shreshth) + CTO + 2 Fullstack Devs + 1 UI/UX Designer

### Weeks 1-2: Project Setup, Auth, User Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│ WEEK 1                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ Backend:                                                                │
│   - Project scaffold (Express + TypeScript + Prisma)                   │
│   - PostgreSQL schema: User, Admin, OTP, RefreshToken, PasswordReset   │
│   - Google OAuth 2.0 flow (passport-google-oauth20)                    │
│   - JWT + refresh token rotation middleware                            │
│   - Role-based middleware (BUYER, DEALER, ADMIN)                       │
│   - Health check endpoint (/api/health)                                │
│   - Basic rate limiting (express-rate-limit)                           │
│   - Helmet.js security headers                                        │
│                                                                        │
│ Frontend:                                                              │
│   - Vite + React 18 + TypeScript scaffold                              │
│   - Tailwind CSS + design token setup                                  │
│   - React Router v6 routes (public vs protected)                       │
│   - Auth context + Zustand store                                       │
│   - Google OAuth login page                                            │
│   - Axios interceptors (token refresh, error handling)                 │
│                                                                        │
│ Infra:                                                                 │
│   - GitHub repo + branch protection rules                              │
│   - ESLint + Prettier config                                           │
│   - Basic GitHub Actions CI (lint + type check)                        │
│   - Local Docker Compose (PostgreSQL + Redis for dev)                  │
├─────────────────────────────────────────────────────────────────────────┤
│ WEEK 2                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ Backend:                                                                │
│   - User profile CRUD (name, phone, city, state)                       │
│   - Professional profile (for dealers: GST, PAN, business docs)        │
│   - File upload middleware (Multer + S3)                                │
│   - Email verification flow (OTP via Resend)                           │
│   - Phone verification flow (OTP via MSG91)                            │
│   - Admin seed data + superadmin creation script                       │
│                                                                        │
│ Frontend:                                                              │
│   - User onboarding flow (post-Google-login profile completion)        │
│   - Dealer registration multi-step form                                │
│   - Profile settings page                                              │
│   - Toast notification system                                          │
│   - Loading skeletons + error boundaries                               │
│                                                                        │
│ Design:                                                                │
│   - Complete design system in Figma (tokens, components)               │
│   - Mobile-first wireframes for all Phase 1 screens                    │
│                                                                        │
│ DELIVERABLE: Users can sign up, complete profiles, dealers can register │
└─────────────────────────────────────────────────────────────────────────┘
```

### Weeks 3-4: Product Catalog, Categories, Search

```
┌─────────────────────────────────────────────────────────────────────────┐
│ WEEK 3                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ Backend:                                                                │
│   - Schema: Category, SubCategory, ProductType, Product, Brand         │
│   - Category tree API (nested categories with product counts)          │
│   - Brand CRUD + logo upload                                           │
│   - Product type management (specs template per type)                  │
│   - Full-text search on products (PostgreSQL tsvector)                 │
│   - Seed script: 15 categories, 100+ subcategories, 500+ product types│
│   - Category -> brand mapping (which brands sell what)                 │
│                                                                        │
│ Frontend:                                                              │
│   - Category browsing page (grid/list with icons)                      │
│   - Category detail page (subcategories, popular products)             │
│   - Product search with filters (brand, category, price range)         │
│   - Brand directory page                                               │
│   - React Query caching for catalog data                               │
├─────────────────────────────────────────────────────────────────────────┤
│ WEEK 4                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ Backend:                                                                │
│   - Product detail API (specs, available dealers, price range)         │
│   - Related products / "also searched for"                             │
│   - Popular products endpoint (based on inquiry volume)                │
│   - Admin: category/brand/product CRUD panel                           │
│   - Scraper integration: Moglix product data import                    │
│                                                                        │
│ Frontend:                                                              │
│   - Product detail page                                                │
│   - Search results page with sorting                                   │
│   - Admin catalog management UI                                        │
│   - Breadcrumb navigation                                              │
│   - SEO meta tags for product pages                                    │
│                                                                        │
│ DELIVERABLE: Browsable product catalog with 500+ product types          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Weeks 5-6: Inquiry Submission, Dealer Matching

```
┌─────────────────────────────────────────────────────────────────────────┐
│ WEEK 5                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ Backend:                                                                │
│   - Schema: Inquiry, InquiryItem, DealerMatch                          │
│   - Inquiry creation API (text-based + structured)                     │
│   - AI inquiry parser (Claude API):                                    │
│     - Extract brand, model, specs, quantity from free text             │
│     - Handle ambiguous input (ask clarification questions)             │
│     - Normalize brand names (fuzzy matching)                           │
│   - Dealer matching algorithm:                                         │
│     - Match by category + subcategory + brand mappings                 │
│     - Filter by delivery city/state                                    │
│     - Score by conversion rate + response history                      │
│     - Select top 5-15 matched dealers                                  │
│   - Blind inquiry delivery (strip buyer identity)                      │
│                                                                        │
│ Frontend:                                                              │
│   - Inquiry submission form:                                           │
│     - Free text input with AI auto-complete                            │
│     - Category/brand selectors                                         │
│     - Quantity + delivery location fields                              │
│     - Photo upload (product reference images)                          │
│   - Inquiry success screen (shows parsed specs + matched dealer count) │
│   - My Inquiries list (dashboard)                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ WEEK 6                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ Backend:                                                                │
│   - Multi-item inquiry support (bulk material lists)                   │
│   - Inquiry status machine (DRAFT -> PENDING -> QUOTED -> DEAL -> DONE)│
│   - Dealer notification system:                                        │
│     - Email notification (via Resend) on new matched inquiry           │
│     - In-app notification                                              │
│   - Inquiry expiry (auto-close after 7 days with no quotes)           │
│   - Duplicate inquiry detection (prevent spam)                         │
│                                                                        │
│ Frontend:                                                              │
│   - Dealer dashboard: incoming inquiries feed                          │
│   - Inquiry detail view (dealer perspective -- no buyer info visible)  │
│   - Inquiry status tracker (buyer side)                                │
│   - Notification bell + notification center                            │
│                                                                        │
│ DELIVERABLE: Buyers can submit inquiries, AI parses them, dealers      │
│ receive blind matches                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Weeks 7-8: Quote Management, Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│ WEEK 7                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ Backend:                                                                │
│   - Schema: Quote, QuoteItem                                           │
│   - Quote submission API (dealer submits price + delivery + notes)     │
│   - Quote validation (price > 0, within reasonable range)              │
│   - Quote amendment (dealer can update before buyer decision)          │
│   - Buyer quote retrieval (dealer identity masked)                     │
│   - Quote comparison engine:                                           │
│     - Normalize by unit price, total price, delivery days              │
│     - Calculate value score (price + delivery + dealer rating)         │
│     - Highlight best price, fastest delivery, best value               │
│   - Real-time quote count update (buyer sees "3 quotes received")     │
│                                                                        │
│ Frontend:                                                              │
│   - Dealer: quote submission form                                      │
│   - Dealer: my submitted quotes list                                   │
│   - Buyer: quotes received section in inquiry detail                   │
│   - Buyer: side-by-side quote comparison table                         │
│   - Buyer: "Best Price" / "Fastest" / "Best Value" badges             │
├─────────────────────────────────────────────────────────────────────────┤
│ WEEK 8                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ Backend:                                                                │
│   - Deal acceptance API (buyer selects a quote)                        │
│   - Contact reveal (unmask dealer info after deal acceptance)          │
│   - Deal completion flow (buyer confirms transaction happened)         │
│   - Post-deal rating system (buyer rates dealer, dealer rates buyer)   │
│   - Activity logging (all inquiry/quote/deal events)                   │
│   - Email notifications: quote received, deal accepted, reminder       │
│                                                                        │
│ Frontend:                                                              │
│   - Accept quote flow + confirmation modal                             │
│   - Contact reveal screen (dealer name, phone, email, address)         │
│   - Deal tracker (pending -> in progress -> completed)                 │
│   - Rating + review submission                                         │
│   - Email notification preferences                                     │
│                                                                        │
│ DELIVERABLE: Complete inquiry -> quote -> deal -> review cycle works    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Weeks 9-10: Admin Panel, Dealer Verification

```
┌─────────────────────────────────────────────────────────────────────────┐
│ WEEK 9                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ Backend:                                                                │
│   - Admin panel APIs:                                                  │
│     - User management (list, view, suspend, activate)                  │
│     - Dealer verification workflow (pending -> verified -> rejected)   │
│     - Inquiry moderation (flag inappropriate content)                  │
│     - Quote moderation (detect price gouging)                          │
│     - System analytics endpoints                                       │
│   - Dealer verification:                                               │
│     - GST number validation (via API)                                  │
│     - Document upload review (trade license, GST cert)                 │
│     - Manual approval queue                                            │
│     - Verification badge system                                        │
│                                                                        │
│ Frontend:                                                              │
│   - Admin dashboard (KPI cards, charts)                                │
│   - User management table (search, filter, actions)                    │
│   - Dealer verification queue (review docs, approve/reject)           │
│   - Inquiry moderation view                                            │
│   - System health page                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ WEEK 10                                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ Backend:                                                                │
│   - Admin: bulk operations (verify/suspend multiple dealers)           │
│   - Admin: export data (CSV for inquiries, deals, users)              │
│   - CRM basics: dealer notes, follow-up reminders                     │
│   - System settings API (rate limits, feature flags, config)          │
│   - Audit log (who did what, when, from where)                        │
│                                                                        │
│ Frontend:                                                              │
│   - Admin: data export functionality                                   │
│   - Admin: system settings page                                        │
│   - Admin: audit log viewer                                            │
│   - Admin: feature flag toggles                                        │
│   - Dealer: verification status display + re-submission flow          │
│                                                                        │
│ DELIVERABLE: Admin can manage entire platform, dealers can get verified │
└─────────────────────────────────────────────────────────────────────────┘
```

### Weeks 11-12: Testing, Bug Fixing, Soft Launch

```
┌─────────────────────────────────────────────────────────────────────────┐
│ WEEK 11                                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ Testing:                                                                │
│   - Write unit tests for all services (target: 60% coverage)          │
│   - Write integration tests for all API routes                         │
│   - Write 3 critical E2E tests (auth, inquiry flow, deal flow)        │
│   - Manual QA: test every screen on Chrome, Safari, mobile            │
│   - Fix all P0 and P1 bugs                                            │
│   - Performance audit: Lighthouse, WebPageTest                         │
│                                                                        │
│ Infra:                                                                 │
│   - Set up staging environment (separate EC2 + RDS)                   │
│   - Deploy to staging, run full test suite                             │
│   - Set up Sentry for error tracking                                   │
│   - Set up basic CloudWatch alarms (CPU, memory, errors)              │
│   - Configure ALB + 2 EC2 instances (remove single point of failure)  │
│   - Set up GitHub Actions CI/CD pipeline                               │
├─────────────────────────────────────────────────────────────────────────┤
│ WEEK 12                                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ Launch Prep:                                                           │
│   - Fix all remaining P1 bugs                                          │
│   - Load test: simulate 100 concurrent users                           │
│   - Security audit: run npm audit, basic penetration test             │
│   - Seed production with real categories + brands (from existing data) │
│   - Onboard 10 existing manual clients as first users                 │
│   - Onboard 20-30 verified dealers (from existing network)            │
│   - Create user guides (buyer + dealer)                                │
│   - Set up support email workflow                                      │
│   - DNS cutover: hub4estate.com -> new platform                       │
│                                                                        │
│ SOFT LAUNCH:                                                           │
│   - Invite-only for first 50 buyers                                    │
│   - Daily monitoring of all metrics                                    │
│   - Rapid bug fix cycle (same-day fixes for P0)                       │
│   - Daily standup with team                                            │
│   - Collect feedback from every user                                   │
│                                                                        │
│ DELIVERABLE: MVP live with 50 buyers + 30 dealers, monitored closely   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 1 Milestone Summary

| Metric | Target | Measurement |
|--------|--------|-------------|
| Users registered | 50 buyers + 30 dealers | Database count |
| Inquiries submitted | 100+ | Database count |
| Quotes received | 200+ | Database count |
| Deals closed | 20+ | Database count |
| Uptime | > 99% | UptimeRobot |
| API p95 latency | < 500ms | CloudWatch |
| Critical bugs | 0 open | Issue tracker |
| Test coverage | > 50% | Jest + Vitest |

---

## 3.2 Phase 2: Growth (Months 4-6)

**Goal:** Add intelligence features, dealer tools, and viral mechanics to grow from 50 to 2,000 active users.

**Team:** + ML Engineer + 1 Additional Frontend Dev + QA Engineer

### Month 4: AI Features + Dealer Analytics

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AI Slip Scanner                                                        │
│   - Upload photo of material list / invoice / estimate                 │
│   - Tesseract.js OCR + Claude vision for extraction                    │
│   - Auto-create multi-item inquiry from parsed data                    │
│   - Confidence scores per extracted item                               │
│   - Edit-before-submit flow (user corrects OCR mistakes)               │
│                                                                        │
│ Voice Input                                                            │
│   - Browser Web Speech API for voice-to-text                           │
│   - Hindi + English support                                            │
│   - AI cleanup of voice transcription into structured inquiry          │
│                                                                        │
│ Dealer Analytics Dashboard                                             │
│   - Quotes submitted / accepted / rejected breakdown                   │
│   - Conversion rate trends (weekly, monthly)                           │
│   - Average response time analytics                                    │
│   - Revenue tracking (deals closed via platform)                       │
│   - Category performance heatmap                                       │
│   - Competitor pricing insights (anonymized)                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Month 5: Community + Notifications

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Community Forum                                                        │
│   - Product Q&A (linked to product types)                              │
│   - Buying guides (curated by admin)                                   │
│   - Dealer tips and best practices                                     │
│   - Upvote/downvote system                                             │
│   - Search within community                                            │
│   - Moderation tools (admin)                                           │
│                                                                        │
│ Push Notifications                                                     │
│   - Web push (service worker + FCM)                                    │
│   - In-app notification center (already started in Phase 1)            │
│   - Notification preferences (per event type)                          │
│   - Email digest (daily/weekly summary)                                │
│   - SMS alerts for critical events (deal accepted, high-value inquiry) │
│                                                                        │
│ Buyer Features                                                         │
│   - Saved searches + alerts ("notify me when Philips LED < 500")      │
│   - Inquiry templates (save and reuse)                                 │
│   - Favorite dealers (for repeat business)                             │
│   - Purchase history with reorder                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Month 6: Subscriptions + Payments

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Dealer Subscription Plans                                              │
│   - Free tier: 5 inquiries/month, basic profile                       │
│   - Silver (INR 999/mo): 50 inquiries, analytics, priority matching   │
│   - Gold (INR 2,499/mo): unlimited inquiries, advanced analytics,     │
│     featured badge, priority support                                   │
│   - Platinum (INR 4,999/mo): all Gold + dedicated account manager,    │
│     API access, white-label quotes                                     │
│                                                                        │
│ Lead Purchase Credits                                                  │
│   - Pay-per-inquiry model (INR 25-100 per inquiry depending on value) │
│   - Credit packs: 50/100/500 credits                                   │
│   - Auto-top-up option                                                 │
│                                                                        │
│ Payment Integration                                                    │
│   - Razorpay (primary) -- UPI, cards, netbanking, wallets             │
│   - Subscription management (auto-renewal, upgrade/downgrade)          │
│   - Invoice generation (GST compliant)                                 │
│   - Payment failure handling + retry logic                             │
│   - Refund workflow                                                    │
│                                                                        │
│ Infra Upgrades                                                         │
│   - ElastiCache Redis (move sessions + caching to Redis)              │
│   - SQS for email queue (decouple email sending from API)             │
│   - RDS upgrade to db.t3.medium                                        │
│   - Full CI/CD pipeline operational                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 2 Milestone Summary

| Metric | Target | Baseline (Phase 1 end) |
|--------|--------|------------------------|
| Registered users | 2,000 | 80 |
| Monthly active users | 500 | 50 |
| Inquiries/month | 1,000 | 100 |
| Deals closed/month | 200 | 20 |
| Paying dealers | 30 | 0 |
| MRR (INR) | 50,000 | 0 |
| AI slip scan accuracy | > 85% | N/A |
| NPS | > 40 | Baseline survey |

---

## 3.3 Phase 3: Scale (Months 7-12)

**Goal:** Scale to 10,000+ users, add advanced features, optimize performance, and achieve product-market fit.

**Team:** + DevOps Engineer + Data Engineer + Product Manager

```
┌─────────────────────────────────────────────────────────────────────────┐
│ MONTH 7-8: Advanced AI + RFQ System                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Advanced AI Features:                                                  │
│   - Smart pricing suggestions for dealers (based on market data)       │
│   - Inquiry quality scoring (prioritize high-intent inquiries)         │
│   - Automated clarification questions (chatbot-style)                  │
│   - Product recommendation engine                                      │
│   - Anomaly detection (fake inquiries, price manipulation)             │
│                                                                        │
│ RFQ System (Request for Quotation):                                    │
│   - Formal RFQ with multi-item line items                              │
│   - RFQ templates for recurring purchases                              │
│   - Reverse auction mechanics (optional)                               │
│   - Bid comparison matrix                                              │
│   - Auto-award rules (lowest price, best value)                        │
├─────────────────────────────────────────────────────────────────────────┤
│ MONTH 9-10: WhatsApp + Performance                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ WhatsApp Integration:                                                  │
│   - WhatsApp Business API (via Gupshup / Twilio)                      │
│   - Submit inquiries via WhatsApp message                              │
│   - Receive quote notifications on WhatsApp                            │
│   - WhatsApp chatbot for inquiry status checks                         │
│   - Dealer can respond to inquiries via WhatsApp                       │
│                                                                        │
│ Performance Optimization:                                              │
│   - Redis caching for all read-heavy endpoints                         │
│   - Database query optimization (N+1 elimination, indexing)            │
│   - Image optimization pipeline (WebP, lazy loading, CDN)             │
│   - Frontend code splitting + lazy routes                              │
│   - Service worker for offline-first experience                       │
│   - Target: < 150ms p50, < 500ms p95                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ MONTH 11-12: Multi-Language + Data Infrastructure                      │
├─────────────────────────────────────────────────────────────────────────┤
│ Multi-Language Support:                                                 │
│   - Hindi (primary Indian language)                                    │
│   - i18n framework (react-i18next)                                     │
│   - AI-powered translation for dealer/buyer communications             │
│   - RTL support preparation (future Arabic/Urdu)                       │
│                                                                        │
│ Data Infrastructure:                                                   │
│   - Read replicas for analytics queries                                │
│   - ETL pipeline (RDS -> data warehouse)                               │
│   - Business intelligence dashboards                                   │
│   - A/B testing framework                                              │
│                                                                        │
│ Infrastructure Scale-Up:                                                │
│   - ALB + Auto Scaling Group (2-6 instances)                           │
│   - RDS Multi-AZ failover                                              │
│   - Full VPC setup with public/private subnets                         │
│   - WAF + Shield Standard                                              │
│   - Blue/green deployment pipeline                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 3 Milestone Summary

| Metric | Target | Phase 2 End |
|--------|--------|-------------|
| Registered users | 25,000 | 2,000 |
| MAU | 10,000 | 500 |
| Inquiries/month | 8,000 | 1,000 |
| Deals closed/month | 2,000 | 200 |
| Paying dealers | 200 | 30 |
| MRR (INR) | 3,00,000 | 50,000 |
| WhatsApp inquiries | 30% of total | 0% |
| Platform uptime | 99.9% | 99% |
| API p95 latency | < 500ms | < 1s |

---

## 3.4 Phase 4: Intelligence (Months 13-24)

**Goal:** Build defensible AI moats, launch mobile app, and establish Hub4Estate as the go-to procurement intelligence platform.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PREDICTIVE PRICING                                                     │
│   - Historical price database (every quote, every deal, every scrape)  │
│   - Price prediction model: "Philips 15W LED will cost X in Y city"    │
│   - Seasonal trend analysis (festival demand, monsoon supply issues)   │
│   - Price alerts: "Price dropped 15% this week"                        │
│   - Fair price indicator on every inquiry ("market range: 450-550")    │
├─────────────────────────────────────────────────────────────────────────┤
│ DEMAND FORECASTING                                                     │
│   - Regional demand heatmaps (which products are hot where)            │
│   - Dealer inventory advisory ("stock up on LED panels, demand +40%") │
│   - Buyer intent signals (search patterns -> demand prediction)        │
│   - Construction project pipeline tracking (new projects = future      │
│     demand for electrical supplies)                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ AUTO-NEGOTIATION                                                       │
│   - AI agent that negotiates with dealers on buyer's behalf            │
│   - Set target price, AI tries to get it or close                      │
│   - Counter-offer suggestions for buyers                               │
│   - Bulk discount calculator                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ KNOWLEDGE GRAPH                                                        │
│   - Product compatibility graph (which switches fit which panels)      │
│   - Brand substitution recommendations                                 │
│   - "Complete your project" suggestions                                │
│   - Dealer specialization mapping                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ MOBILE APP (React Native)                                              │
│   - iOS + Android from shared codebase                                 │
│   - Offline inquiry drafts                                             │
│   - Camera integration for slip scanning                               │
│   - Push notifications (native)                                        │
│   - Biometric authentication                                           │
│   - Deep linking from WhatsApp notifications                           │
│   - Target: 4.5+ star rating on both stores                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 4 Milestone Summary

| Metric | Target | Phase 3 End |
|--------|--------|-------------|
| Registered users | 1,00,000 | 25,000 |
| MAU | 50,000 | 10,000 |
| Inquiries/month | 40,000 | 8,000 |
| Deals closed/month | 12,000 | 2,000 |
| Paying dealers | 1,000 | 200 |
| MRR (INR) | 15,00,000 | 3,00,000 |
| Mobile app DAU | 10,000 | 0 |
| AI price prediction accuracy | > 85% | N/A |
| App store rating | > 4.5 | N/A |

---

## 3.5 Phase 5: Dominance (Months 25-36)

**Goal:** Become the default procurement platform for electrical supplies in India, then expand.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AUTONOMOUS PROCUREMENT                                                 │
│   - "Set and forget" recurring orders                                  │
│   - AI auto-places orders when price drops below threshold             │
│   - Smart reordering based on consumption patterns                     │
│   - Budget management + approval workflows                             │
│   - Integration with ERP systems (Tally, SAP Business One)            │
├─────────────────────────────────────────────────────────────────────────┤
│ SUPPLY CHAIN PREDICTION                                                │
│   - Supplier reliability scoring (delivery time predictions)           │
│   - Logistics optimization (route planning for multi-vendor orders)    │
│   - Inventory synchronization (dealer stock levels in real-time)       │
│   - Supply disruption alerts (factory shutdown, transport strike)      │
├─────────────────────────────────────────────────────────────────────────┤
│ INDUSTRY EXPANSION                                                     │
│   - Plumbing & sanitary ware (adjacent vertical)                       │
│   - Hardware & tools                                                   │
│   - Paints & coatings                                                  │
│   - Building materials (cement, steel, tiles)                          │
│   - Each vertical follows same playbook: category seed, dealer         │
│     onboard, buyer acquisition, AI training                            │
├─────────────────────────────────────────────────────────────────────────┤
│ API MARKETPLACE                                                        │
│   - Pricing API (third-party apps query Hub4Estate price data)         │
│   - Dealer API (other platforms send inquiries to Hub4Estate dealers)  │
│   - Webhook integrations (Zapier, custom workflows)                    │
│   - Developer portal + documentation                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ WHITE-LABEL PLATFORM                                                   │
│   - Enterprise customers run their own Hub4Estate instance             │
│   - Custom branding, own dealer network                                │
│   - SaaS model: INR 50,000-2,00,000/month per enterprise              │
│   - Target: large construction companies, government agencies          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 5 Milestone Summary

| Metric | Target | Phase 4 End |
|--------|--------|-------------|
| Registered users | 5,00,000 | 1,00,000 |
| MAU | 2,00,000 | 50,000 |
| GMV/month (INR) | 50 Cr | 10 Cr |
| Paying dealers | 5,000 | 1,000 |
| MRR (INR) | 75,00,000 | 15,00,000 |
| ARR (INR) | 9 Cr | 1.8 Cr |
| Verticals live | 5+ | 1 (electricals) |
| Enterprise clients | 10+ | 0 |
| Team size | 50+ | 15 |

---

## 3.6 Roadmap Visual Timeline

```
 2026                          2027                          2028            2029
  Q2    Q3    Q4              Q1    Q2    Q3    Q4          Q1   Q2
  ├─────┼─────┼───────────────┼─────┼─────┼─────┼──────────┼────┼────
  │     │     │               │     │     │     │          │    │
  │ PHASE 1   │  PHASE 2      │    PHASE 3      │   PHASE 4     │ PHASE 5
  │Foundation │  Growth       │    Scale         │  Intelligence │ Dominance
  │ M1-3      │  M4-6         │    M7-12         │  M13-24       │ M25-36
  │           │               │                  │               │
  │ MVP       │ AI Slip       │ WhatsApp         │ Predictive    │ Multi-
  │ Launch    │ Scanner       │ Integration      │ Pricing       │ Vertical
  │           │               │                  │               │
  │ 50 users  │ 2K users      │ 10K users        │ 50K users     │ 2L users
  │           │               │                  │               │
  │ INR 0 MRR │ 50K MRR       │ 3L MRR           │ 15L MRR       │ 75L MRR
  │           │               │                  │               │
  ▼           ▼               ▼                  ▼               ▼
```

---

# 4. Team Structure & Hiring

---

## 4.1 Current State

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CURRENT TEAM (April 2026)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                    ┌──────────────────┐                                 │
│                    │ Shreshth Agarwal │                                 │
│                    │ Founder & CEO    │                                 │
│                    │ Age 18           │                                 │
│                    │ Mesa SoB + NMIMS │                                 │
│                    └──────────────────┘                                 │
│                                                                        │
│  Wears all hats:                                                       │
│  - Product vision + roadmap                                            │
│  - Frontend + backend development                                      │
│  - Dealer onboarding (manual, 10 active clients)                       │
│  - Customer support                                                    │
│  - Finance + legal                                                     │
│  - AWS infrastructure management                                       │
│                                                                        │
│  Strengths: Vision, hustle, deal-closing, real-world validation        │
│  Gaps: Deep backend scaling, ML engineering, design systems, QA        │
│                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Phase-Wise Team Build-Out

### Phase 1 Team (Months 1-3): 5 people

```
                         ┌──────────────────┐
                         │ Shreshth Agarwal │
                         │ CEO / Product    │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
     ┌────────▼───────┐  ┌───────▼────────┐  ┌──────▼──────────┐
     │ CTO / Tech Lead│  │ Fullstack Dev 1│  │ Fullstack Dev 2 │
     │ (Co-founder?)  │  │ (Backend-heavy) │  │ (Frontend-heavy)│
     └────────────────┘  └────────────────┘  └─────────────────┘
                                                       │
                                               ┌───────▼────────┐
                                               │ UI/UX Designer │
                                               │ (Contract)     │
                                               └────────────────┘

  HEADCOUNT: 5 (3 full-time eng + 1 contract design + founder)
  MONTHLY BURN (salaries only):
  ┌────────────────────┬───────────────────┐
  │ CTO / Tech Lead    │ INR 1,50,000/mo   │  (equity + below-market cash)
  │ Fullstack Dev 1    │ INR 80,000/mo     │  (fresh but strong)
  │ Fullstack Dev 2    │ INR 80,000/mo     │  (fresh but strong)
  │ UI/UX Designer     │ INR 40,000/mo     │  (contract, part-time)
  │ Founder (Shreshth) │ INR 0/mo          │  (no salary in Phase 1)
  ├────────────────────┼───────────────────┤
  │ TOTAL              │ INR 3,50,000/mo   │
  └────────────────────┴───────────────────┘
```

### Phase 2 Team (Months 4-6): 8 people

```
                          ┌──────────────────┐
                          │ Shreshth Agarwal │
                          │ CEO / Product    │
                          └────────┬─────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
    ┌─────────▼────────┐  ┌───────▼───────┐   ┌───────▼───────────┐
    │  CTO / Tech Lead │  │   Product     │   │  Growth / Sales   │
    │                  │  │ (Shreshth as  │   │  (Shreshth as     │
    │                  │  │  interim PM)  │   │   interim)        │
    └────────┬─────────┘  └───────────────┘   └───────────────────┘
             │
    ┌────────┼────────────────┬───────────────────┐
    │        │                │                   │
┌───▼────┐ ┌─▼──────────┐ ┌──▼───────────┐ ┌────▼─────────┐
│FS Dev 1│ │FS Dev 2    │ │ Frontend Dev │ │ ML Engineer  │
│(BE)    │ │(FE)        │ │ 3 (new)      │ │ (new)        │
└────────┘ └────────────┘ └──────────────┘ └──────────────┘
                                    │
                           ┌────────▼────────┐
                           │ QA Engineer     │
                           │ (new)           │
                           └─────────────────┘

  + UI/UX Designer (contract continues)

  MONTHLY BURN:
  ┌─────────────────────┬───────────────────┐
  │ CTO                 │ INR 1,80,000/mo   │
  │ Fullstack Dev 1     │ INR 90,000/mo     │
  │ Fullstack Dev 2     │ INR 90,000/mo     │
  │ Frontend Dev 3      │ INR 75,000/mo     │
  │ ML Engineer         │ INR 1,20,000/mo   │
  │ QA Engineer         │ INR 60,000/mo     │
  │ UI/UX Designer      │ INR 50,000/mo     │
  │ Founder             │ INR 25,000/mo     │  (minimal living stipend)
  ├─────────────────────┼───────────────────┤
  │ TOTAL               │ INR 6,90,000/mo   │
  └─────────────────────┴───────────────────┘
```

### Phase 3 Team (Months 7-12): 15 people

```
                           ┌──────────────────┐
                           │ Shreshth Agarwal │
                           │ CEO              │
                           └────────┬─────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
   ┌────────▼──────────┐  ┌────────▼──────────┐  ┌────────▼──────────┐
   │  CTO              │  │ Product Manager   │  │ Head of Growth    │
   │  (Engineering)    │  │ (New hire)        │  │ (New hire)        │
   └────────┬──────────┘  └───────────────────┘  └───────────────────┘
            │
   ┌────────┼────────────┬──────────────┬──────────────┐
   │        │            │              │              │
┌──▼───┐ ┌──▼───┐ ┌─────▼──────┐ ┌────▼───┐ ┌───────▼──────┐
│BE Dev│ │BE Dev│ │ FE Dev x2  │ │ML Eng  │ │ DevOps Eng   │
│  1   │ │  2   │ │            │ │        │ │ (New hire)   │
└──────┘ └──────┘ └────────────┘ └────────┘ └──────────────┘
                                       │
                               ┌───────▼──────┐
                               │ Data Engineer │
                               │ (New hire)    │
                               └──────────────┘

  + QA Engineer + UI/UX Designer (now full-time)

  MONTHLY BURN:
  ┌─────────────────────┬───────────────────┐
  │ CTO                 │ INR 2,50,000/mo   │
  │ Product Manager     │ INR 1,20,000/mo   │
  │ Backend Dev x2      │ INR 2,00,000/mo   │
  │ Frontend Dev x2     │ INR 1,70,000/mo   │
  │ ML Engineer         │ INR 1,50,000/mo   │
  │ DevOps Engineer     │ INR 1,30,000/mo   │
  │ Data Engineer       │ INR 1,20,000/mo   │
  │ QA Engineer         │ INR 70,000/mo     │
  │ UI/UX Designer      │ INR 80,000/mo     │
  │ Head of Growth      │ INR 1,20,000/mo   │
  │ Founder (CEO)       │ INR 50,000/mo     │
  ├─────────────────────┼───────────────────┤
  │ TOTAL (15 people)   │ INR 14,60,000/mo  │
  │                     │ (~INR 1.75 Cr/yr) │
  └─────────────────────┴───────────────────┘
```

## 4.3 Contractor vs Full-Time Decisions

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                    CONTRACTOR vs FULL-TIME DECISION MATRIX                      │
├────────────────────┬──────────┬───────────┬────────────────────────────────────┤
│ Role               │ Phase 1  │ Phase 2+  │ Rationale                          │
├────────────────────┼──────────┼───────────┼────────────────────────────────────┤
│ CTO                │ FT       │ FT        │ Core. Must own architecture.       │
│ Backend Dev        │ FT       │ FT        │ Core. Owns business logic.         │
│ Frontend Dev       │ FT       │ FT        │ Core. Owns user experience.        │
│ UI/UX Designer     │ Contract │ FT (Ph 3) │ Part-time sufficient early.        │
│ ML Engineer        │ --       │ FT        │ AI is a core differentiator.       │
│ QA Engineer        │ --       │ FT        │ Quality is non-negotiable.         │
│ DevOps Engineer    │ --       │ FT (Ph 3) │ Contract OK until infra complex.   │
│ Data Engineer      │ --       │ FT (Ph 3) │ Need when data pipeline is built.  │
│ Product Manager    │ --       │ FT (Ph 3) │ Founder does PM until team > 10.   │
│ Mobile Dev         │ --       │ Contract  │ RN app can be contracted initially.│
│ Content Writer     │ --       │ Contract  │ SEO content, blog, guides.         │
│ Legal / Compliance │ Contract │ Contract  │ Retainer basis, not full-time.     │
│ Accounting         │ Contract │ Contract  │ CA on retainer.                    │
└────────────────────┴──────────┴───────────┴────────────────────────────────────┘
```

## 4.4 Hiring Priorities & Compensation Benchmarks

### CTO Hiring Profile (Priority #1)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                        CTO / TECHNICAL CO-FOUNDER                              │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  MUST HAVE:                                                                    │
│  - 4+ years full-stack (Node.js/TypeScript + React + PostgreSQL)              │
│  - Built and scaled a product to 10,000+ users                                │
│  - AWS production experience (EC2, RDS, S3, CloudFront minimum)              │
│  - Strong opinions on architecture, weakly held                               │
│  - Comfortable with AI/ML integration (not ML research)                      │
│  - Can hire and lead a team of 5-10 engineers                                │
│                                                                                │
│  NICE TO HAVE:                                                                │
│  - B2B marketplace / procurement experience                                   │
│  - India market experience (Razorpay, UPI, GST compliance)                   │
│  - Open source contributions                                                  │
│  - Prior startup experience (0 to 1)                                          │
│                                                                                │
│  COMPENSATION:                                                                │
│  - Cash: INR 12-18 LPA (below market -- startup stage)                       │
│  - Equity: 5-12% vesting over 4 years (1 year cliff)                         │
│  - Note: Requires LLP -> Pvt Ltd conversion for equity (planned)             │
│                                                                                │
│  ANTI-PATTERNS (do not hire):                                                 │
│  - "Architect" who hasn't coded in 2+ years                                  │
│  - Only worked at large companies (no scrappy muscle)                         │
│  - Cannot explain trade-offs in their own past decisions                      │
│  - Dismissive of the problem ("just use IndiaMART")                          │
│                                                                                │
│  WHERE TO FIND:                                                               │
│  - YC co-founder matching                                                     │
│  - Antler India cohort                                                        │
│  - LinkedIn outbound (IIT/IIIT alumni, ex-startup CTOs)                      │
│  - Twitter/X tech community                                                   │
│  - Referrals from mentor network (Tej, Hitesh Sir)                           │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Compensation Benchmarks (INR LPA, Tier 1 City, Startup Stage)

| Role | Junior (0-2 yr) | Mid (2-5 yr) | Senior (5+ yr) | Hub4Estate Range |
|------|-----------------|--------------|-----------------|------------------|
| Fullstack Dev | 4-8 LPA | 8-15 LPA | 15-25 LPA | 8-12 LPA + equity |
| Frontend Dev | 4-7 LPA | 7-12 LPA | 12-20 LPA | 7-10 LPA + equity |
| Backend Dev | 4-8 LPA | 8-15 LPA | 15-25 LPA | 8-12 LPA + equity |
| ML Engineer | 6-10 LPA | 10-20 LPA | 20-35 LPA | 12-18 LPA + equity |
| DevOps Engineer | 5-8 LPA | 8-15 LPA | 15-25 LPA | 10-15 LPA + equity |
| QA Engineer | 3-6 LPA | 6-10 LPA | 10-15 LPA | 6-8 LPA + equity |
| Product Manager | 6-10 LPA | 10-18 LPA | 18-30 LPA | 10-15 LPA + equity |
| UI/UX Designer | 4-7 LPA | 7-12 LPA | 12-18 LPA | 6-10 LPA (contract OK) |
| Data Engineer | 5-8 LPA | 8-15 LPA | 15-25 LPA | 10-15 LPA + equity |

---

# 5. Success Metrics & KPIs

---

## 5.1 North Star Metric

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│    NORTH STAR METRIC: Inquiry-to-Deal Conversion Rate                          │
│                                                                                │
│    Definition: % of submitted inquiries that result in a completed deal        │
│    Formula:    (Deals Completed / Inquiries Submitted) x 100                   │
│                                                                                │
│    Why this metric:                                                            │
│    - Captures the ENTIRE funnel in one number                                  │
│    - If this goes up, EVERYTHING is working:                                   │
│      * Buyers are submitting real inquiries (demand quality)                   │
│      * AI is parsing correctly (technology quality)                            │
│      * Dealers are getting matched well (matching quality)                     │
│      * Dealers are quoting competitively (supply quality)                      │
│      * Buyers are finding value (product-market fit)                           │
│                                                                                │
│    Targets:                                                                    │
│    ┌─────────────┬───────────┬────────────────────────────────────────────┐    │
│    │ Phase       │ Target    │ Context                                    │    │
│    ├─────────────┼───────────┼────────────────────────────────────────────┤    │
│    │ Phase 1     │ > 15%     │ Manual matching, small dealer pool         │    │
│    │ Phase 2     │ > 25%     │ AI matching improves, more dealers         │    │
│    │ Phase 3     │ > 35%     │ WhatsApp, multi-language, big dealer pool  │    │
│    │ Phase 4     │ > 45%     │ Predictive pricing, auto-negotiation       │    │
│    │ Phase 5     │ > 50%     │ Autonomous procurement, deep AI            │    │
│    └─────────────┴───────────┴────────────────────────────────────────────┘    │
│                                                                                │
│    Industry benchmarks:                                                        │
│    - IndiaMART: ~3-5% inquiry-to-deal (spam-heavy, low intent)                │
│    - Alibaba: ~8-12% (higher intent, but global complexity)                   │
│    - Hub4Estate advantage: blind matching + AI parsing = higher intent only    │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Buyer Metrics

| Metric | Definition | Phase 1 Target | Phase 3 Target | Measurement |
|--------|-----------|----------------|----------------|-------------|
| MAU (Monthly Active Users) | Unique buyers who log in per month | 50 | 10,000 | PostHog |
| Inquiry Volume | Inquiries submitted per month | 100 | 8,000 | Database |
| Repeat Inquiry Rate | % of buyers who submit 2+ inquiries | > 30% | > 50% | Database |
| Time to First Inquiry | Minutes from signup to first inquiry | < 10 min | < 5 min | PostHog |
| Quote View Rate | % of inquiries where buyer views quotes | > 80% | > 90% | PostHog |
| NPS (Net Promoter Score) | Survey: "Would you recommend Hub4Estate?" | > 30 | > 50 | In-app survey |
| Average Savings per Deal | (Market price - Deal price) / Market price | > 15% | > 20% | Calculated |
| Inquiry Abandonment Rate | Started but not submitted | < 40% | < 25% | PostHog funnel |
| Support Tickets per 100 Users | Tickets raised per 100 active users | < 10 | < 5 | Support system |

## 5.3 Dealer Metrics

| Metric | Definition | Phase 1 Target | Phase 3 Target | Measurement |
|--------|-----------|----------------|----------------|-------------|
| Dealer Activation Rate | % of registered dealers who submit 1+ quote | > 60% | > 75% | Database |
| Quote Response Time | Median time from inquiry receipt to quote | < 4 hours | < 1 hour | Database |
| Quote-to-Deal Conversion | % of quotes that get accepted | > 20% | > 30% | Database |
| Dealer Churn Rate | % of active dealers who become inactive (30d) | < 10%/mo | < 5%/mo | Database |
| Dealer NPS | "Would you recommend Hub4Estate to other dealers?" | > 20 | > 40 | Survey |
| Average Quotes per Inquiry | Number of quotes each inquiry receives | > 3 | > 5 | Database |
| Dealer Revenue (platform) | Average revenue per dealer per month | INR 500 | INR 3,000 | Database |
| Verified Dealer % | % of active dealers who are verified | > 80% | > 95% | Database |

## 5.4 Platform Metrics

| Metric | Definition | Phase 1 Target | Phase 3 Target | Phase 5 Target |
|--------|-----------|----------------|----------------|----------------|
| GMV (Gross Merchandise Value) | Total value of deals closed on platform/month | INR 5L | INR 2 Cr | INR 50 Cr |
| Take Rate | Revenue / GMV | ~1% | ~2% | ~3% |
| ARPU (Dealer) | Revenue per paying dealer per month | INR 500 | INR 1,500 | INR 3,000 |
| LTV (Dealer) | Lifetime value of a paying dealer | INR 6,000 | INR 36,000 | INR 1,08,000 |
| CAC (Dealer) | Cost to acquire one paying dealer | INR 2,000 | INR 3,000 | INR 5,000 |
| LTV:CAC Ratio | Sustainability indicator | > 3:1 | > 10:1 | > 20:1 |
| MRR (Monthly Recurring Revenue) | Subscription + credits revenue | INR 0 | INR 3,00,000 | INR 75,00,000 |
| Revenue per Inquiry | Total revenue / Total inquiries | INR 5 | INR 40 | INR 150 |
| Liquidity Score | Avg quotes per inquiry x conversion rate | 0.6 | 1.75 | 2.5 |

## 5.5 Technical Metrics

| Metric | Definition | Target | Alert Threshold |
|--------|-----------|--------|-----------------|
| Uptime | % of time API is reachable | > 99.9% | < 99.5% |
| API p50 Latency | 50th percentile response time | < 150ms | > 300ms |
| API p95 Latency | 95th percentile response time | < 500ms | > 1.5s |
| API p99 Latency | 99th percentile response time | < 1.5s | > 3s |
| Error Rate (5xx) | % of requests returning server errors | < 0.1% | > 0.5% |
| Error Rate (4xx) | % of requests returning client errors | < 5% | > 10% |
| Deployment Frequency | Deployments to production per week | > 3 | < 1 |
| Lead Time for Changes | Commit to production time | < 2 hours | > 24 hours |
| Mean Time to Recovery (MTTR) | Time from incident to resolution | < 30 min | > 2 hours |
| Change Failure Rate | % of deploys causing incidents | < 5% | > 15% |
| AI Parse Accuracy | % of inquiries correctly parsed by AI | > 90% | < 80% |
| AI Parse Latency | Time for AI to parse an inquiry | < 3s | > 8s |
| Database Query p95 | 95th percentile DB query time | < 50ms | > 200ms |
| Redis Hit Rate | % of cache requests served from Redis | > 80% | < 60% |
| Frontend LCP | Largest Contentful Paint | < 2s | > 4s |
| Frontend FID | First Input Delay | < 100ms | > 300ms |
| Frontend CLS | Cumulative Layout Shift | < 0.1 | > 0.25 |

## 5.6 KPI Dashboard Layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                   EXECUTIVE KPI DASHBOARD (Real-Time)                          │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─── NORTH STAR ───────────────────────────────────────────────────────────┐  │
│  │  Inquiry-to-Deal Conversion: 24.3% (+2.1% WoW)    [=========>    ] 25% │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  ┌─── GROWTH ──────────────┐  ┌─── REVENUE ──────────────┐                    │
│  │ MAU:         1,234      │  │ MRR:   INR 1,45,000      │                    │
│  │ New Users:   +89 today  │  │ GMV:   INR 42,00,000     │                    │
│  │ Inquiries:   45 today   │  │ Take Rate: 1.8%          │                    │
│  │ Deals:       12 today   │  │ ARPU:  INR 1,200         │                    │
│  └─────────────────────────┘  └──────────────────────────┘                    │
│                                                                                │
│  ┌─── SUPPLY HEALTH ──────────┐  ┌─── TECHNICAL ──────────────┐              │
│  │ Active Dealers:  156       │  │ Uptime:  99.94%            │              │
│  │ Avg Quotes/Inquiry: 4.2   │  │ p95:     312ms             │              │
│  │ Avg Response Time: 2.1h   │  │ Errors:  0.08%             │              │
│  │ Dealer Churn: 3.2%        │  │ Deploys: 5 this week       │              │
│  └────────────────────────────┘  └────────────────────────────┘              │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

# 6. Risk Register

---

## 6.1 Technical Risks

| ID | Risk | Probability | Impact | Severity | Mitigation | Owner |
|----|------|-------------|--------|----------|------------|-------|
| T1 | **Database failure / data loss** | Low | Critical | HIGH | Multi-AZ RDS, automated backups (14d retention), point-in-time recovery (5 min RPO), weekly manual snapshots, cross-region replication for critical data | CTO |
| T2 | **AI parsing accuracy drops below 80%** | Medium | High | HIGH | Fallback to rule-based parser, human-in-the-loop review for low-confidence parses, continuous monitoring of parse accuracy, A/B test AI models, maintain training dataset | ML Engineer |
| T3 | **Single point of failure (current EC2)** | High | Critical | CRITICAL | Phase 1 priority: ALB + 2 instances. Auto Scaling Group. Health checks. Automated instance replacement. | CTO |
| T4 | **Third-party API dependency failure** (Anthropic, Google, Resend) | Medium | Medium | MEDIUM | Multi-provider strategy (Claude + GPT fallback), queue-based email (retry on failure), local OAuth token caching, circuit breaker pattern | Backend Dev |
| T5 | **Security breach / data exfiltration** | Low | Critical | HIGH | WAF, VPC isolation, encryption at rest/transit, IAM least privilege, secrets rotation, audit logging, incident response plan, penetration testing quarterly | CTO + DevOps |
| T6 | **Performance degradation at scale** | Medium | High | HIGH | Redis caching, DB query optimization, CDN for static assets, load testing monthly, auto-scaling, performance budgets enforced in CI | DevOps |
| T7 | **Vendor lock-in (AWS)** | Low | Medium | LOW | Use standard protocols (PostgreSQL not Aurora, standard S3 API), containerize backend (Docker), document all infra as Terraform, evaluate multi-cloud only when needed | CTO |
| T8 | **Technical debt accumulation** | High | Medium | MEDIUM | 20% of each sprint allocated to tech debt. Code review mandatory. Lint + type check in CI. Quarterly architecture review. Refactoring sprints between phases. | CTO |
| T9 | **Mobile app platform fragmentation** | Medium | Medium | MEDIUM | React Native for cross-platform. Test on top 10 Android devices in India (budget + mid-range). Progressive Web App as fallback. | Frontend Lead |
| T10 | **Scraping targets change structure** | High | Low | LOW | Scraper monitoring alerts, modular scraper architecture, manual data entry fallback, multiple scraping sources for same data | Backend Dev |

## 6.2 Business Risks

| ID | Risk | Probability | Impact | Severity | Mitigation | Owner |
|----|------|-------------|--------|----------|------------|-------|
| B1 | **Low dealer adoption** ("why should I pay for leads?") | Medium | Critical | HIGH | Free tier with real value (5 inquiries/mo). Show ROI with data ("you got 15 qualified buyers this month"). Manual onboarding for first 100 dealers. Dealer referral program. Success stories from beta dealers. | CEO |
| B2 | **IndiaMART / JustDial copies the model** | Medium | High | HIGH | Speed to market. AI quality as moat. Blind matching is hard to retrofit on open platforms. Community + trust network effects. Focus on electrical niche depth vs. their breadth. | CEO |
| B3 | **Price war among competitors** | Low | Medium | MEDIUM | Hub4Estate is free for buyers (no price war on buyer side). Dealer subscriptions compete on value (qualified leads), not price. Focus on conversion rate, not cost-per-lead. | CEO |
| B4 | **Regulatory changes** (e-commerce regulations, data protection) | Low | Medium | LOW | Monitor DPIIT and MeitY announcements. Legal counsel on retainer. Data minimization by design. GDPR-like practices even though not required. | CEO + Legal |
| B5 | **Buyer trust deficit** ("is this a scam?") | Medium | High | HIGH | Verified dealer badges. Transparent process (show how blind matching works). Real testimonials with numbers. Shreshth's personal brand. Rotary + community credibility. | CEO |
| B6 | **Key person dependency** (Shreshth as sole operator) | High | Critical | CRITICAL | Priority #1: hire CTO. Document all processes. Redundancy in critical knowledge. Advisory board for strategic decisions. | CEO |
| B7 | **Cash runway exhaustion** | Medium | Critical | HIGH | Keep burn rate low (under 5L/mo in Phase 1). Revenue from Phase 2. Apply to accelerators (YC, Antler, 100X.VC). Family investment as bridge if needed. Government grants (DPIIT recognition enables Startup India benefits). | CEO |
| B8 | **Dealer collusion / price manipulation** | Low | High | MEDIUM | Blind matching prevents dealer coordination. Anomaly detection on pricing patterns. Minimum 3 quotes before comparison. Flag statistically unusual pricing. | CTO + ML |
| B9 | **Scaling beyond electricals fails** | Medium | Medium | MEDIUM | Prove the model works deeply in electricals first. Only expand when conversion rate > 30% in core vertical. Each new vertical is a mini-startup with its own validation cycle. | CEO + PM |

## 6.3 Operational Risks

| ID | Risk | Probability | Impact | Severity | Mitigation | Owner |
|----|------|-------------|--------|----------|------------|-------|
| O1 | **CTO hiring takes too long** (> 3 months) | High | High | HIGH | Start with contract senior developer. Parallel search: YC matching + LinkedIn + referrals. Consider CTO-as-a-service for first 3 months. Fractional CTO option. | CEO |
| O2 | **Team burnout** (small team, big ambition) | Medium | High | MEDIUM | Realistic sprint planning. No crunch culture. Async communication default. Mental health check-ins. Founder leads by example on work-life boundaries. | CEO |
| O3 | **Quality degrades during rapid growth** | Medium | Medium | MEDIUM | QA engineer in Phase 2. Automated test gates in CI. Feature flags for gradual rollout. Canary deployments. | CTO + QA |
| O4 | **AWS account compromise** | Low | Critical | HIGH | MFA on root account. IAM users with least privilege. CloudTrail monitoring. AWS Organizations (when multiple accounts). Regular access audit. | CTO |
| O5 | **Supplier data accuracy** (wrong prices, unavailable products) | Medium | Medium | MEDIUM | Automated freshness checks. Dealer self-service price updates. Scraper validation pipeline. User-reported inaccuracy workflow. | PM |

## 6.4 Contingency Plans

### Contingency Plan A: "No CTO Found in 3 Months"

```
Trigger: CTO position unfilled after 90 days of active search.

Actions:
1. Engage fractional CTO (10-15 hours/week) for architecture guidance
   Cost: INR 80,000-1,20,000/month
2. Hire 2 strong mid-level fullstack developers instead
   Cost: INR 1,60,000/month combined
3. Use pre-built components (Supabase for auth, Inngest for jobs)
   to reduce custom code burden
4. Founder focuses on code review + architecture decisions with
   fractional CTO mentorship
5. Re-evaluate CTO search in 3 more months with expanded criteria
   (remote OK, part-time OK, different seniority level)
```

### Contingency Plan B: "Runway Drops Below 3 Months"

```
Trigger: Bank balance < 3 months of operating expenses.

Actions:
1. IMMEDIATE: Cut all non-essential spending
   - Move from contract designer to Figma templates
   - Pause scraping infrastructure (manual data entry)
   - Downscale AWS to minimum viable (1 EC2 + 1 RDS)
2. WEEK 1: Emergency fundraise
   - Family bridge round (Shreshth's existing network)
   - Revenue acceleration: offer annual dealer plans at 20% discount
   - Apply to emergency grants (NASSCOM, state startup schemes)
3. WEEK 2-4: Revenue sprint
   - Focus exclusively on dealer subscription sales
   - Offer 3-month pilot at 50% off to 50 dealers
   - Target: INR 2,00,000 MRR within 30 days
4. IF STILL CRITICAL after 30 days:
   - Pivot to consulting model (use platform expertise to serve
     large buyers as a service, charge per deal)
   - This generates immediate revenue while platform grows organically
```

### Contingency Plan C: "Major Security Incident"

```
Trigger: Confirmed data breach, unauthorized access, or data exfiltration.

Actions (executed in order, within hours):
1. CONTAIN (0-30 minutes)
   - Rotate ALL secrets (JWT, API keys, DB password)
   - Clear all Redis sessions (force re-login for all users)
   - Enable WAF emergency rule (block all non-Indian IPs)
   - Take RDS snapshot immediately

2. ASSESS (30 min - 2 hours)
   - Review CloudTrail for scope of breach
   - Identify affected data (PII? financial? just operational?)
   - Engage AWS support (if Business tier)
   - Determine entry vector

3. COMMUNICATE (2-4 hours)
   - Internal notification to all team members
   - Draft user communication (email)
   - If PII exposed: prepare CERT-In notification (72-hour requirement)
   - If financial data: prepare RBI notification

4. REMEDIATE (4-48 hours)
   - Patch vulnerability
   - Deploy fix with emergency pipeline
   - Enhanced monitoring for 30 days
   - Third-party security audit (one-time)

5. POST-MORTEM (within 1 week)
   - Root cause analysis document
   - Process changes to prevent recurrence
   - Update security architecture if needed
   - Team training on incident lessons
```

### Contingency Plan D: "IndiaMART Launches Competing Feature"

```
Trigger: IndiaMART or similar launches blind-matching / AI pricing.

Actions:
1. DO NOT PANIC. Their scale is their weakness:
   - They cannot un-train 200 million users who expect open spam
   - Blind matching requires trust infrastructure they don't have
   - Their revenue model (seller-pays-for-visibility) conflicts with
     blind matching

2. DOUBLE DOWN on differentiators:
   - Speed: AI parsing + instant dealer matching (they'll be slow)
   - Quality: 100% verified dealers (they have millions of unverified)
   - Focus: Electricals-deep expertise (they're breadth-first)
   - Experience: Zero spam guarantee (their core product IS spam)

3. ACCELERATE Phase 2 features:
   - WhatsApp integration (meet users where they are)
   - Voice input (their app is text-only)
   - Predictive pricing (they don't have this data depth)

4. MESSAGING:
   - "We built blind matching from day one. They're retrofitting it."
   - "Would you trust the platform that sold your data for 10 years
     to now protect it?"
```

---

# Appendix A: Glossary

| Term | Definition |
|------|-----------|
| ALB | Application Load Balancer (AWS) |
| ASG | Auto Scaling Group (AWS) |
| ARPU | Average Revenue Per User (per month) |
| CAC | Customer Acquisition Cost |
| CDN | Content Delivery Network |
| CLS | Cumulative Layout Shift (Core Web Vital) |
| DAU | Daily Active Users |
| DLQ | Dead Letter Queue (failed SQS messages) |
| FID | First Input Delay (Core Web Vital) |
| GMV | Gross Merchandise Value (total deal value on platform) |
| HSTS | HTTP Strict Transport Security |
| IAM | Identity and Access Management (AWS) |
| LCP | Largest Contentful Paint (Core Web Vital) |
| LTV | Lifetime Value (of a customer) |
| MAU | Monthly Active Users |
| MRR | Monthly Recurring Revenue |
| MTTR | Mean Time to Recovery |
| NACL | Network Access Control List (AWS) |
| NPS | Net Promoter Score |
| OAI | Origin Access Identity (CloudFront -> S3) |
| RFQ | Request for Quotation |
| RPO | Recovery Point Objective (max data loss) |
| RTO | Recovery Time Objective (max downtime) |
| SQS | Simple Queue Service (AWS) |
| SNS | Simple Notification Service (AWS) |
| SSE | Server-Side Encryption |
| VPC | Virtual Private Cloud (AWS) |
| WAF | Web Application Firewall |

---

# Appendix B: Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-02 | Shreshth Agarwal | Initial version |
| 2.0 | 2026-04-07 | CTO Office | Complete rewrite -- all 6 sections expanded with diagrams, code, costs |

---

**END OF DOCUMENT**

**Classification:** Internal -- Confidential
**Hub4Estate LLP** | LLPIN: ACW-4269
**This document is a living artifact. It evolves with every sprint.**
