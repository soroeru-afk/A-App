@echo off
title Space Robotman World Server

echo Checking for Flask...
python -c "import flask" 2>nul
if errorlevel 1 (
    echo Flask is not installed. Installing it now...
    python -m pip install flask
)

echo Starting Server...
start http://localhost:5000
python server.py

pause
