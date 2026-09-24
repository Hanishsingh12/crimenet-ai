@echo off
title CRIMENET AI - Master Launcher
echo ========================================================
echo   Launching CRIMENET AI Investigation Platform
echo ========================================================
echo 1. Launching Backend on Port 8000...
start "CRIMENET AI - Backend" cmd /k "%~dp0run_backend.bat"
timeout /t 3 /nobreak > nul

echo 2. Launching Frontend on Port 5173...
start "CRIMENET AI - Frontend" cmd /k "%~dp0run_frontend.bat"
timeout /t 2 /nobreak > nul

echo 3. Opening Browser at http://localhost:5173/login ...
start http://localhost:5173/login

echo Done! Both services are now running.
