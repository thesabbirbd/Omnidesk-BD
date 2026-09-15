#!/bin/bash
echo "======================================================="
echo "      Omnidesk OS - Database Backup Utility (Linux/Mac)"
echo "======================================================="

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="../data/backups"

mkdir -p "$BACKUP_DIR"

if [ -f "../backend/studyos.db" ]; then
    echo "[INFO] Backing up SQLite database..."
    cp "../backend/studyos.db" "$BACKUP_DIR/studyos_$TIMESTAMP.db"
    echo "[SUCCESS] Backup saved to $BACKUP_DIR/studyos_$TIMESTAMP.db"
else
    echo "[WARNING] No studyos.db found. Skipping SQLite backup."
fi

# If PostgreSQL is used in the future, pg_dump commands can be added here.

echo "Backup complete."
