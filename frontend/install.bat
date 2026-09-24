@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo PATH set, running npm install...
"C:\Program Files\nodejs\npm.cmd" install
