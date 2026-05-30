@echo off
title EcoSwap Backend
echo.
echo  ==========================================
echo   eco-swap  ^|  Python Backend
echo  ==========================================
echo.

cd /d "%~dp0backend"

:: Copy .env.example if .env doesn't exist
if not exist .env (
    echo  [setup] .env not found. Copying from .env.example...
    copy .env.example .env >nul
    echo  [setup] Please edit backend\.env with your settings before continuing.
    echo.
)

:: Install dependencies if needed
echo  [setup] Checking Python dependencies...
pip install -r requirements.txt -q

echo.
echo  [start] Starting backend on http://localhost:8000
echo  [start] Video feed : http://localhost:8000/video_feed
echo  [start] API docs   : http://localhost:8000/docs
echo  [start] Admin API  : http://localhost:8000/admin/...
echo.
echo  Press Ctrl+C to stop.
echo.

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
