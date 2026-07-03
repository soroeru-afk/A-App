@echo off
chcp 65001 > NUL

echo =======================================================
echo    SOLID REFORGE ANGLE CHANGER - Launcher
echo =======================================================
echo.

cd /d "%~dp0"

:: Check node_modules
if exist "node_modules\" goto :skip_install
echo [INFO] Installing dependencies (Express, etc.)...
cmd /c npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed. Please ensure Node.js is installed.
    pause
    exit /b 1
)
:skip_install

echo [INFO] Starting backend proxy server on port 3010...
start /b node server.js

:: Wait for server boot
timeout /t 2 /nobreak > nul

echo [INFO] Opening app in browser...
start http://localhost:3010

echo.
echo =======================================================
echo  App started successfully. Close this window to exit.
echo =======================================================
echo.

pause
