@echo off
chcp 65001 >nul 2>&1
title YBRPG Stop Server
cd /d "%~dp0"

REM Kill processes listening on ports 3000 (web) and 4000 (api)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr /i ":3000" ^| findstr /i "LISTENING"') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr /i ":4000" ^| findstr /i "LISTENING"') do taskkill /F /PID %%a >nul 2>nul

echo Server on ports 3000 / 4000 stopped.
pause
