#!/bin/bash

# Petfendy Database Deployment Script
# This script runs database migrations on Coolify

echo "🔄 Starting database deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "✅ DATABASE_URL is configured"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push database schema (creates tables if they don't exist)
echo "🗄️  Pushing database schema..."
npx prisma db push --accept-data-loss

echo "✅ Database deployment completed successfully!"
