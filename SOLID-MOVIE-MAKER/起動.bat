@echo off
cd /d "%~dp0"
title SOLID MOVIE MAKER
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start /b "" python solid_movie_maker.py
    timeout /t 1 /nobreak > nul
    start http://localhost:3009
    exit /b 0
)
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start /b "" node server.cjs
    timeout /t 1 /nobreak > nul
    start http://localhost:3009
    exit /b 0
)
