@echo off
title CRIMENET AI - Backend Server (Port 8000)
cd /d "%~dp0"

set "PYTHON_EXE="
if exist "%~dp0..\.env\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0..\.env\Scripts\python.exe"
) else if exist "%~dp0.env\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0.env\Scripts\python.exe"
) else (
    where python >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        set "PYTHON_EXE=python"
    )
)

if "%PYTHON_EXE%"=="" (
    echo [ERROR] Python environment not found! Please check that .env is installed.
    pause
    exit /b 1
)

cd /d "%~dp0backend"
echo ========================================================
echo   CRIMENET AI - FASTAPI BACKEND GATEWAY
echo   Serving at: http://127.0.0.1:8000
echo   Swagger Docs: http://127.0.0.1:8000/docs
echo   Python: %PYTHON_EXE%
echo ========================================================
"%PYTHON_EXE%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause

