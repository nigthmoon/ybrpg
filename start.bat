@echo off
chcp 65001 >nul 2>&1
title YBRPG Launcher
cd /d "%~dp0" || (
  echo [ERROR] Cannot change to script directory.
  pause
  exit /b 1
)

REM Check node / npm
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Please install Node.js and add it to PATH.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found. Please reinstall Node.js.
  pause
  exit /b 1
)

REM Auto install dependencies if missing
if not exist "%~dp0node_modules" (
  echo [INFO] Dependencies missing, running npm install ...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

REM Free ports 3000 (web) and 4000 (api)
echo [INFO] Freeing ports 3000 / 4000 ...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr /i ":3000" ^| findstr /i "LISTENING"') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr /i ":4000" ^| findstr /i "LISTENING"') do taskkill /F /PID %%a >nul 2>nul

REM Locate Google Chrome
set "CHROME="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"

REM Start backend API (port 4000) and web dev server (port 3000) in minimized windows
echo [INFO] Starting backend API (4000) and web dev server (3000) ...
start "YBRPG-API" /min cmd /c "node --no-warnings server\index.js"
start "YBRPG-WEB" /min cmd /c "npm run dev"

REM Poll until web is up, then open Chrome (or default browser)
echo [INFO] Waiting for web server, browser will open automatically ...
for /l %%i in (1,1,120) do (
  curl -s -o nul "http://localhost:3000/" 2>nul && (
    if defined CHROME ( start "" "%CHROME%" "http://localhost:3000/" ) else ( start "" "http://localhost:3000/" )
    goto :opened
  )
  ping -n 2 127.0.0.1 >nul
)

:opened
echo [OK] Services started. If the browser did not open, visit http://localhost:3000
echo [INFO] To stop, run stop.bat or close the "YBRPG-API" / "YBRPG-WEB" windows.
timeout /t 4 >nul
exit
