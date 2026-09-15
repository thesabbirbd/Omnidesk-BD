@echo off
setlocal
echo =======================================================
echo       Omnidesk OS - Database Backup Utility (Windows)
echo =======================================================

set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_DIR=..\data\backups

if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

if exist "..\backend\studyos.db" (
    echo [INFO] Backing up SQLite database...
    copy "..\backend\studyos.db" "%BACKUP_DIR%\studyos_%TIMESTAMP%.db" > nul
    echo [SUCCESS] Backup saved to %BACKUP_DIR%\studyos_%TIMESTAMP%.db
) else (
    echo [WARNING] No studyos.db found. Skipping SQLite backup.
)

:: If PostgreSQL is used in the future, you could add pg_dump commands here.

echo Backup complete.
pause
