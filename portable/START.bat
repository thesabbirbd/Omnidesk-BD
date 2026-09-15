@echo off
setlocal
title Omnidesk OS Start Sequence
echo =======================================================
echo           Omnidesk OS - Portable Start Sequence
echo =======================================================

echo [CHECK] Verifying Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

echo [CHECK] Verifying Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    exit /b 1
)

echo [INFO] Starting Backend...
cd ..\backend
if not exist ".venv\Scripts\activate.bat" (
    echo [ERROR] Backend .venv not found. Please run install scripts first.
    pause
    exit /b 1
)
start "Omnidesk Backend" cmd /c "call .venv\Scripts\activate.bat && set PYTHONPATH=. && python main.py"
cd ..

echo [INFO] Starting Frontend...
cd frontend
start "Omnidesk Frontend" cmd /c "npm run dev -- --host 0.0.0.0 --port 5173"
cd ..

echo [INFO] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo [INFO] Opening browser...
start http://localhost:5173

echo =======================================================
echo System is running. Close the terminal windows to exit.
echo =======================================================
pause
