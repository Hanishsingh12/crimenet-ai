@echo off
title CRIMENET AI - Frontend Server (Port 5173)
cd /d "%~dp0frontend"

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "C:\Program Files\nodejs" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
    )
)

echo ========================================================
echo   CRIMENET AI - VITE REACT FRONTEND
echo   Serving at: http://localhost:5173
echo ========================================================
call npm run dev
pause

