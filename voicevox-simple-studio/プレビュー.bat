@echo off
cd /d "%~dp0"
echo ==================================================
echo VOICEVOX Simple Studio - 本番プレビュー起動
echo ==================================================
echo.
call npm run preview
pause
