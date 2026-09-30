@echo off
title CRIMENET AI - Master Launcher
cd /d "%~dp0"

echo ========================================================
echo   Launching CRIMENET AI Investigation Platform
echo ========================================================

echo 1. Launching Backend on Port 8000...
start "CRIMENET AI - Backend" cmd /k "call "%~dp0run_backend.bat""
ping 127.0.0.1 -n 4 >nul

echo 2. Launching Frontend on Port 5173...
start "CRIMENET AI - Frontend" cmd /k "call "%~dp0run_frontend.bat""
ping 127.0.0.1 -n 3 >nul

echo 3. Opening Browser at http://localhost:5173/login ...
start http://localhost:5173/login

echo ========================================================
echo   Done! Both services are now running.
echo ========================================================

