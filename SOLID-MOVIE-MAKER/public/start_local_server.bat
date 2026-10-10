@echo off
chcp 65001 > nul
title SOLID MOVIE MAKER - Local Link Assistant
echo ==================================================
echo  [ SOLID MOVIE MAKER ] 映画データ管理システム
echo  外部プレイヤー連携 (PotPlayer / KMPlayer)
echo ==================================================
echo.
echo 起動方法を選択してください:
echo   [1] Node.js サーバーを起動 (推奨: WebUI + プレイヤー連携すべて内包)
echo   [2] Python 軽量ブリッジのみ起動 (ポート 8000)
echo.
set /p CHOICE="番号を入力してください (1 または 2、Enterで1): "

if "%CHOICE%"=="2" goto PYTHON_MODE

:NODE_MODE
echo.
echo Node.js サーバーを起動します (http://localhost:3000)...
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    call npm run dev
) else (
    echo npm が見つかりませんでした。Python モードを試行します...
    goto PYTHON_MODE
)
goto END

:PYTHON_MODE
echo.
echo Python スクリプトを実行しています...
python solid_movie_maker.py
goto END

:END
echo.
echo ==================================================
echo プログラムが終了しました。
echo ==================================================
pause
