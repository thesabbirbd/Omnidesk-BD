import os
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db

router = APIRouter()

@router.get("/pre-update-check")
def pre_update_check(db: Session = Depends(get_db)):
    """
    Phase 29: Update Safety Gates.
    Verifies database health and available disk space before allowing Tauri update.
    """
    safe = True
    errors = []
    
    # 1. Check DB Health
    try:
        db.execute(text("SELECT 1")).fetchone()
    except Exception as e:
        safe = False
        errors.append(f"Database health check failed: {str(e)}")

    # 2. Check Disk Space (App Data Dir)
    try:
        app_data_dir = Path.home() / ".omnidesk"
        app_data_dir.mkdir(parents=True, exist_ok=True)
        total, used, free = shutil.disk_usage(str(app_data_dir))
        free_mb = free // (2**20)
        
        # Require at least 500MB free for safe update and backup
        if free_mb < 500:
            safe = False
            errors.append(f"Insufficient disk space. Required: 500MB, Available: {free_mb}MB")
    except Exception as e:
        safe = False
        errors.append(f"Disk space check failed: {str(e)}")

    return {
        "safe_to_update": safe,
        "disk_space_mb": free_mb if 'free_mb' in locals() else 0,
        "errors": errors
    }
