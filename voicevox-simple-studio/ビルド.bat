@echo off
cd /d "%~dp0"
echo ==================================================
echo VOICEVOX Simple Studio - 本番ビルド実行
echo ==================================================
echo.
call npm run build
echo.
echo ビルドが完了しました。
pause
