#!/bin/bash
echo "======================================================="
echo "       Omnidesk OS - Safe Update Utility (Linux/Mac)   "
echo "======================================================="

cd ..

echo "[CHECK] Verifying Git Status..."
if ! git diff-index --quiet HEAD --; then
    echo "[WARNING] Working directory is not clean. Uncommitted changes exist."
    echo "[WARNING] Aborting update to protect your local development changes."
    exit 1
fi

echo "[INFO] Pulling latest changes from repository..."
if ! git pull; then
    echo "[ERROR] Failed to pull from git."
    exit 1
fi

echo "[INFO] Running Database Backup..."
cd portable || exit 1
./BACKUP.sh
cd ..

echo "[INFO] Updating Backend Dependencies..."
cd backend || exit 1
source .venv/bin/activate
if ! pip install -r requirements.txt; then
    echo "[ERROR] Failed to install backend dependencies."
    exit 1
fi

echo "[INFO] Running Database Migrations..."
export PYTHONPATH=.
if ! alembic upgrade head; then
    echo "[ERROR] Failed to run database migrations."
    exit 1
fi
cd ..

echo "[INFO] Updating Frontend Dependencies..."
cd frontend || exit 1
if ! npm install; then
    echo "[ERROR] Failed to install frontend dependencies."
    exit 1
fi
cd ..

echo "======================================================="
echo "[SUCCESS] Omnidesk OS updated successfully!"
echo "======================================================="
