#!/bin/bash
# Usage: ./scripts/restore.sh zmr_backup_20260101_020001.sql.gz
set -e

BACKUP_FILE="$1"
if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-filename>"
  echo ""
  echo "Available backups:"
  docker compose exec backup ls /backups/
  exit 1
fi

echo "⚠️  This will OVERWRITE the current database with: $BACKUP_FILE"
echo "Continue? (yes/no)"
read -r confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

# shellcheck source=/dev/null
source .env.production

echo "→ Restoring from $BACKUP_FILE..."
docker compose exec -T backup \
  sh -c "gunzip -c /backups/$BACKUP_FILE | psql -h db -U $POSTGRES_USER $POSTGRES_DB"

echo "✅ Restore complete. Restart the app:"
echo "   docker compose restart app"
