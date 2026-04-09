#!/bin/bash
# Hub4Estate Local Development Setup
# Run: bash infrastructure/scripts/setup-local.sh

set -e

echo "Starting Hub4Estate local services..."
docker compose up -d

echo "Waiting for PostgreSQL..."
until docker compose exec postgres pg_isready -U hub4estate 2>/dev/null; do sleep 1; done

echo "Installing dependencies..."
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

echo "Running database migrations..."
cd backend && npx prisma migrate deploy && cd ..

echo "Seeding database..."
cd backend && npx prisma db seed 2>/dev/null || echo "No seed script configured" && cd ..

echo ""
echo "Hub4Estate local environment is ready!"
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
echo "  MinIO: localhost:9000 (console: localhost:9001)"
echo ""
echo "Start the app:"
echo "  Backend: cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
