@echo off
chcp 65001 >nul 2>&1
title YBRPG Dev Server
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
    echo [ERROR] npm install failed. Check network / npm config.
    pause
    exit /b 1
  )
) else (
  echo [INFO] Dependencies already installed.
)

REM Free port 3000 (kill any old process holding it)
echo [INFO] Freeing port 3000 ...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr /i ":3000" ^| findstr /i "LISTENING"') do (
  if not "%%a"=="" taskkill /F /PID %%a >nul 2>nul
)
powershell -NoProfile -Command "$p=3000; (Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue).OwningProcess | Sort-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" 2>nul

REM Locate Google Chrome (prefer it over default browser)
set "CHROME="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
  set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
  set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
  set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)
if defined CHROME (
  echo [INFO] Chrome found: %CHROME%
) else (
  echo [WARN] Chrome not found, will use default browser.
)

REM Background poller: once the server is up, open it in Chrome (or default browser)
echo [INFO] Starting dev server, browser opens automatically when ready ...
start "YBRPG-OPEN" /min powershell -NoProfile -Command "for($i=0;$i -lt 90;$i++){ foreach($p in 3000,3001,3002){ try { Invoke-WebRequest -Uri ('http://localhost:'+ $p +'/') -UseBasicParsing -TimeoutSec 1 | Out-Null; if($env:CHROME){ Start-Process $env:CHROME ('http://localhost:'+ $p +'/') } else { Start-Process ('http://localhost:'+ $p +'/') }; exit } catch {} }; Start-Sleep -Seconds 2 }"
REM Foreground run vite (this window is the live server log; close it to stop)
call npm run dev
if errorlevel 1 (
  echo.
  echo [ERROR] Vite failed to start (exit %errorlevel%).
  pause
  exit /b 1
)

echo.
echo [INFO] Dev server stopped.
pause
