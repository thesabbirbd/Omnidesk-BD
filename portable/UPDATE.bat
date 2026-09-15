@echo off
echo Checking for uncommitted changes...
git diff-index --quiet HEAD --
if %ERRORLEVEL% NEQ 0 (
    echo Uncommitted changes detected. Stash before updating.
    exit /b 1
)
echo Pulling latest changes...
git pull origin main

echo Updating Root Dependencies...
call npm install

echo Updating Frontend Dependencies...
cd frontend
call npm install
cd ..

echo Updating Backend Dependencies & Migrations...
cd backend
call pip install -r requirements.txt
call alembic upgrade head
cd ..

echo Update complete. You can now start the application.
