@echo off
cd /d "%~dp0"
echo ==================================================
echo VOICEVOX Simple Studio - 開発スタート
echo ==================================================
echo.
echo ※事前にVOICEVOXアプリが起動していることを確認してください。
echo.
call npm run dev
pause
