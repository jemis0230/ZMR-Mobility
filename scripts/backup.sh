#!/bin/sh
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/zmr_backup_${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting backup..."
pg_dump -h db -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$FILE"
echo "[$(date)] Backup saved: $FILE"

# Retain only the last 30 backups
ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +31 | xargs rm -f
echo "[$(date)] Cleanup done. Retained: $(ls "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l) backups"
