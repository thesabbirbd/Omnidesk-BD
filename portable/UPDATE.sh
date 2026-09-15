#!/bin/bash
echo "Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    echo "Uncommitted changes detected. Stash before updating."
    exit 1
fi
echo "Pulling latest changes..."
git pull origin main

echo "Updating Root Dependencies..."
npm install

echo "Updating Frontend Dependencies..."
cd frontend && npm install && cd ..

echo "Updating Backend Dependencies & Migrations..."
cd backend
python -m pip install -r requirements.txt
alembic upgrade head
cd ..

echo "Update complete. You can now start the application."
