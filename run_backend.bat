@echo off
title CRIMENET AI - Backend Server (Port 8000)
cd /d "%~dp0..\.env\Scripts"
call activate.bat
cd /d "%~dp0backend"
echo ========================================================
echo   CRIMENET AI - FASTAPI BACKEND GATEWAY
echo   Serving at: http://127.0.0.1:8000
echo   Swagger Docs: http://127.0.0.1:8000/docs
echo ========================================================
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
