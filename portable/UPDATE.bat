@echo off
setlocal
echo =======================================================
echo          Omnidesk OS - Safe Update Utility (Windows)
echo =======================================================

cd ..

echo [CHECK] Verifying Git Status...
git status --porcelain > git_status.tmp
for /f "usebackq" %%A in ("git_status.tmp") do set IS_DIRTY=1
del git_status.tmp

if defined IS_DIRTY (
    echo [WARNING] Working directory is not clean. Uncommitted changes exist.
    echo [WARNING] Aborting update to protect your local development changes.
    pause
    exit /b 1
)

echo [INFO] Pulling latest changes from repository...
git pull
if %errorlevel% neq 0 (
    echo [ERROR] Failed to pull from git.
    pause
    exit /b 1
)

echo [INFO] Running Database Backup...
cd portable
call BACKUP.bat
cd ..

echo [INFO] Updating Backend Dependencies...
cd backend
call .venv\Scripts\activate.bat
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)

echo [INFO] Running Database Migrations...
set PYTHONPATH=.
alembic upgrade head
if %errorlevel% neq 0 (
    echo [ERROR] Failed to run database migrations.
    pause
    exit /b 1
)
cd ..

echo [INFO] Updating Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies.
    pause
    exit /b 1
)
cd ..

echo =======================================================
echo [SUCCESS] Omnidesk OS updated successfully!
echo =======================================================
pause
