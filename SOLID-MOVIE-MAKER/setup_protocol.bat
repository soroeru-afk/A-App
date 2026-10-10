@echo off
chcp 65001 > nul
title SOLID MOVIE MAKER - プロトコル登録

:: Check for administrator privileges
openfiles >nul 2>&1
if %errorlevel% neq 0 (
    echo [管理者権限の要求] 管理者権限で再起動しています...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo ======================================================================
echo  [ SOLID MOVIE MAKER ] 直結プロトコル登録処理 (レジストリ)
echo ======================================================================
echo.

where py >nul 2>&1
if %errorlevel% equ 0 (
    py setup_protocol.py
    goto FINISH
)

where python >nul 2>&1
if %errorlevel% equ 0 (
    python setup_protocol.py
    goto FINISH
)

echo [情報] Python が見つからないため、PowerShell でレジストリに登録します...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$dir = Get-Location; $launcher = Join-Path $dir 'play_launcher.py'; $cmd = '\"' + (Get-Command py, python -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path) + '\" \"' + $launcher + '\" \"%1\"'; Set-ItemProperty -Path 'HKCR:\solid-play' -Name '(default)' -Value 'URL:Solid Play Protocol' -Force -ErrorAction SilentlyContinue; New-Item -Path 'HKCR:\solid-play' -Force | Out-Null; New-ItemProperty -Path 'HKCR:\solid-play' -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null; New-Item -Path 'HKCR:\solid-play\shell\open\command' -Force | Out-Null; Set-ItemProperty -Path 'HKCR:\solid-play\shell\open\command' -Name '(default)' -Value $cmd -Force | Out-Null; Write-Host '登録完了' -ForegroundColor Green"

:FINISH
echo.
echo ======================================================================
echo  【設定完了】キーを押すとウィンドウを閉じます。
echo ======================================================================
pause
