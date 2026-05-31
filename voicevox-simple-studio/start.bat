@echo off
echo =========================================
echo Voicevox Simple Studio Launcher
echo =========================================
echo.
echo Please ensure VOICEVOX app is running first.
echo.
echo Starting servers... The browser will open automatically.
echo Keep this window open. Close it to stop the server.
echo.

call npm run dev

echo.
echo Server stopped. Press any key to close this window.
pause
