#!/bin/bash
echo "======================================================="
echo "          Omnidesk OS - Portable Start Sequence        "
echo "======================================================="

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "[INFO] Shutting down Omnidesk OS..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "[CHECK] Verifying Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH."
    exit 1
fi

echo "[CHECK] Verifying Python..."
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[ERROR] Python is not installed or not in PATH."
    exit 1
fi

echo "[INFO] Starting Backend..."
cd ../backend || exit 1
if [ ! -f ".venv/bin/activate" ]; then
    echo "[ERROR] Backend .venv not found. Please run install scripts first."
    exit 1
fi
source .venv/bin/activate
export PYTHONPATH=.
python main.py &
BACKEND_PID=$!
cd ..

echo "[INFO] Starting Frontend..."
cd frontend || exit 1
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
cd ..

echo "[INFO] Waiting for servers to initialize..."
sleep 5

echo "[INFO] Opening browser..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
elif command -v open &> /dev/null; then
    open http://localhost:5173
else
    echo "[INFO] Please manually open http://localhost:5173 in your browser."
fi

echo "======================================================="
echo "System is running. Press Ctrl+C to shut down."
echo "======================================================="

# Wait indefinitely until interrupted
wait
