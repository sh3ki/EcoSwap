@echo off
title EcoSwap Frontend
echo.
echo  ==========================================
echo   eco-swap  ^|  React Frontend (Vite)
echo  ==========================================
echo.

cd /d "%~dp0frontend"

:: Install npm packages if node_modules missing
if not exist node_modules (
    echo  [setup] Installing npm packages...
    npm install
)

echo.
echo  [start] Starting frontend on http://localhost:5173
echo  [start] Admin panel : http://localhost:5173/admin
echo.
echo  Press Ctrl+C to stop.
echo.

npm run dev
pause
