@echo off
:: Check for administrator privileges
openfiles >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: Change current directory to where this batch file is located
cd /d "%~dp0"

py setup_protocol.py
pause
