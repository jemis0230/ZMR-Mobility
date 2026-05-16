#!/bin/sh
set -e

echo "⚡ ZMR Mobility — Starting..."

echo "→ Running database migrations..."
node ./node_modules/prisma/build/index.js migrate deploy

echo "→ Seeding superadmin (safe if already exists)..."
node prisma/seed-admin.js

echo "→ Launching Next.js server..."
exec node server.js
