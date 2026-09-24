@echo off
title CRIMENET AI - Frontend Server (Port 5173)
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0frontend"
echo ========================================================
echo   CRIMENET AI - VITE REACT FRONTEND
echo   Serving at: http://localhost:5173
echo ========================================================
npm run dev
pause
