#!/usr/bin/env python3
import os
import shutil
import time
from pathlib import Path

# Target Omnidesk BD Data Directory
APP_DATA_DIR = Path.home() / ".omnidesk"
DB_PATH = APP_DATA_DIR / "studyos.db"
BACKUP_DIR = APP_DATA_DIR / "backups"

def backup_database():
    if not DB_PATH.exists():
        print(f"[INFO] No database found at {DB_PATH}. Skipping backup.")
        return True

    try:
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        backup_path = BACKUP_DIR / f"studyos_backup_{timestamp}.db"
        
        # Copy the database safely
        shutil.copy2(DB_PATH, backup_path)
        print(f"[SUCCESS] Database safely backed up to {backup_path}")
        
        # Cleanup old backups (keep last 5)
        backups = sorted(BACKUP_DIR.glob("studyos_backup_*.db"))
        if len(backups) > 5:
            for old_backup in backups[:-5]:
                old_backup.unlink()
                print(f"[CLEANUP] Removed old backup: {old_backup.name}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to backup database: {e}")
        return False

def restore_latest_backup():
    try:
        backups = sorted(BACKUP_DIR.glob("studyos_backup_*.db"))
        if not backups:
            print("[ERROR] No backups found to restore.")
            return False
        
        latest_backup = backups[-1]
        shutil.copy2(latest_backup, DB_PATH)
        print(f"[RESTORE] Safely restored database from {latest_backup.name}")
        return True
    except Exception as e:
        print(f"[ERROR] Critical failure restoring database: {e}")
        return False

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--restore":
        if not restore_latest_backup():
            sys.exit(1)
    else:
        if not backup_database():
            sys.exit(1)
