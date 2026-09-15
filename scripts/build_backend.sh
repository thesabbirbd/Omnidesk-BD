#!/bin/bash
echo "Building Python Backend with PyInstaller..."
cd backend
python -m pip install pyinstaller
pyinstaller --name backend-api --onefile --hidden-import="app" main.py
echo "Build complete. Executable is in backend/dist/"
