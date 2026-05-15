#!/bin/bash
set -e

echo "⚡ ZMR Mobility — VPS Setup"
echo ""

# Install Docker if missing
if ! command -v docker &>/dev/null; then
  echo "→ Docker not found. Installing..."
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker "$USER"
  echo ""
  echo "✅ Docker installed. Log out, log back in, then run this script again."
  exit 0
fi

# Make scripts executable
chmod +x scripts/backup.sh scripts/restore.sh 2>/dev/null || true

# Build and launch everything
echo "→ Building and starting containers (this takes a few minutes on first run)..."
docker compose --env-file .env.production up -d --build

echo ""
echo "✅ ZMR Mobility is live!"
DOMAIN_VAL=$(grep '^DOMAIN=' .env.production | cut -d= -f2)
echo "   Visit: https://$DOMAIN_VAL"
echo ""
echo "📋 Useful commands:"
echo "   Logs:            docker compose logs -f app"
echo "   Redeploy:        git pull && docker compose --env-file .env.production up -d --build"
echo "   List backups:    docker compose exec backup ls /backups/"
echo "   Restore backup:  ./scripts/restore.sh <backup-filename>"
echo "   Stop:            docker compose down"
