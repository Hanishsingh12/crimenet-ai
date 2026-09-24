@echo off
setlocal
echo ========================================================
echo   CRIMENET AI - Push Code to GitHub
echo   Target: https://github.com/Hanishsingh12/crimenet-ai
echo ========================================================
set PATH=C:\Users\gouri\AppData\Local\Programs\Git\cmd;%PATH%
cd /d "%~dp0"

echo.
echo Remote configuration:
git remote -v

echo.
echo Pushing local 'main' branch to GitHub...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! Your project has been uploaded to GitHub:
    echo  https://github.com/Hanishsingh12/crimenet-ai
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  Authentication required or push rejected.
    echo  If prompted:
    echo    Username: Hanishsingh12
    echo    Password: Use a GitHub Personal Access Token (classic)
    echo              with 'repo' scope.
    echo ========================================================
)
echo.
pause
