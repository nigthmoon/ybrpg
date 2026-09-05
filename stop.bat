@echo off
title YBRPG Stop Server
cd /d "%~dp0"

REM Kill the server process listening on port 3000
powershell -NoProfile -Command "$p=3000; (Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue).OwningProcess | Sort-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" 2>nul

echo Server on port 3000 stopped.
pause
