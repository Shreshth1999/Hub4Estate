# Deployment Guide

This guide covers deploying Hub4Estate to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Options](#deployment-options)
- [Docker Deployment](#docker-deployment)
- [Vercel + Render Deployment](#vercel--render-deployment)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)

## Prerequisites

- Node.js 20.x
- PostgreSQL 14+
- Domain name (optional but recommended)
- SSL certificate (handled by platform or use Let's Encrypt)

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Authentication Secrets (generate strong random strings)
SESSION_SECRET=your-super-secret-session-key-min-32-chars
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback

# Anthropic AI (optional)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
NOTIFICATION_EMAIL=noreply@yourdomain.com

# SMS (optional - choose one)
MSG91_AUTH_KEY=your-msg91-key
MSG91_TEMPLATE_ID=your-template-id
# OR
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_URL=https://api.yourdomain.com
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

Best for: VPS, AWS EC2, DigitalOcean Droplets, or any server with Docker support.

### Option 2: Vercel (Frontend) + Render (Backend)

Best for: Quick deployment with minimal configuration.

### Option 3: AWS / GCP / Azure

Best for: Enterprise deployments with specific scaling needs.

## Docker Deployment

### 1. Prepare the Server

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

sudo apt-get install docker-compose-plugin
```

### 2. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/hub4estate.git
cd hub4estate
```

### 3. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
nano backend/.env  # Edit with production values

# Frontend
cp frontend/.env.example frontend/.env
nano frontend/.env  # Edit with production API URL
```

### 4. Update docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: hub4estate
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: hub4estate
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hub4estate"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://hub4estate:${POSTGRES_PASSWORD}@postgres:5432/hub4estate?schema=public
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro  # For SSL certificates

volumes:
  postgres_data:
```

### 5. Deploy

```bash
# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec backend npm run db:migrate

# Seed database (optional, first time only)
docker-compose exec backend npm run db:seed

# Check logs
docker-compose logs -f
```

### 6. SSL/HTTPS Setup

Use Let's Encrypt with Certbot:

```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Update nginx config to use SSL certificates
# Certificates will be in /etc/letsencrypt/live/yourdomain.com/
```

## Vercel + Render Deployment

### Frontend (Vercel)

1. **Push to GitHub** (already done after this cleanup)

2. **Import to Vercel**:
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Environment Variables** (Vercel Dashboard):
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

4. **Deploy**: Vercel will auto-deploy on every push to main

### Backend (Render)

1. **Create New Web Service**:
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure**:
   - Name: `hub4estate-backend`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

3. **Environment Variables** (Render Dashboard):
   Add all backend environment variables from the list above

4. **Database** (Render):
   - Create PostgreSQL database on Render
   - Copy the Internal Database URL
   - Set as `DATABASE_URL` in backend environment variables

5. **Deploy**: Render will auto-deploy on every push

## Database Setup

### PostgreSQL Production Setup

#### Option 1: Render PostgreSQL

- Automatically backed up
- Free tier available (limited)
- Easy integration with Render web service

#### Option 2: AWS RDS

```bash
# Create RDS PostgreSQL instance
# Get connection string
# Format: postgresql://username:password@endpoint:5432/database

# Set DATABASE_URL environment variable
DATABASE_URL="postgresql://username:password@endpoint:5432/database?sslmode=require"
```

#### Option 3: Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE hub4estate;
CREATE USER hub4estate_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE hub4estate TO hub4estate_user;
\q
```

### Database Migrations

After deploying backend:

```bash
# If using Render
# Add to build command: npx prisma migrate deploy

# If using Docker
docker-compose exec backend npm run db:migrate

# If using VPS
cd backend
npm run db:migrate
```

### Database Seeding (Optional)

```bash
# Seed initial data (only run once)
npm run db:seed
```

## Post-Deployment

### 1. Verify Deployment

- [ ] Frontend loads correctly
- [ ] Backend health check: `https://api.yourdomain.com/health`
- [ ] Database connection works
- [ ] Google OAuth redirects correctly
- [ ] File uploads work
- [ ] Email sending works (if configured)

### 2. Google OAuth Configuration

Update Google Cloud Console:
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://api.yourdomain.com/api/auth/google/callback`

### 3. DNS Configuration

Point your domain to the deployment:

```
A Record:
yourdomain.com → Vercel IP / Server IP

CNAME:
api.yourdomain.com → your-backend.onrender.com
```

### 4. Monitoring Setup

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking (Sentry)
- Set up log aggregation
- Monitor database performance

### 5. Backup Strategy

- **Database**: Daily automated backups
- **Uploads**: Sync to S3 or cloud storage
- **Configuration**: Keep .env in secure location (not in git)

## Scaling Considerations

### Horizontal Scaling

- Use load balancer for multiple backend instances
- Session storage in Redis for multi-instance deployments
- CDN for static assets (Cloudflare, CloudFront)

### Database Scaling

- Connection pooling (configured in Prisma)
- Read replicas for heavy read workloads
- Regular index optimization

### File Storage

- Move uploads to S3/GCS for distributed deployments
- Use signed URLs for secure access
- Configure CDN for uploaded files

## Troubleshooting

### Backend won't start

- Check DATABASE_URL is correct
- Verify all required environment variables are set
- Check database is accessible
- Review logs for specific errors

### Frontend shows API errors

- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend is running and accessible

### Database migration fails

- Ensure database is accessible
- Check migration files for errors
- Review Prisma schema for issues
- Try: `npx prisma migrate reset` (WARNING: deletes data)

### File uploads not working

- Check UPLOAD_DIR exists and is writable
- Verify MAX_FILE_SIZE is set
- Check file type restrictions
- Review nginx/server file size limits

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Strong SESSION_SECRET and JWT_SECRET
- [ ] Database uses SSL connection
- [ ] CORS configured for specific origins only
- [ ] Rate limiting enabled
- [ ] File upload size limits set
- [ ] Environment variables not committed to git
- [ ] Regular dependency updates
- [ ] Database backups automated
- [ ] Monitoring and alerts configured

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update
npm audit fix

# Update Prisma
npm install @prisma/client@latest prisma@latest
npx prisma generate
```

### Log Management

```bash
# View logs (Docker)
docker-compose logs -f backend

# View logs (Render)
# Use Render dashboard logs viewer

# Rotate logs
# Configure logrotate for production
```

---

For additional help, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
