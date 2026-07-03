@echo off
chcp 65001 > NUL
setlocal enabledelayedexpansion

echo =======================================================
echo    SOLID REFORGE ANGLE CHANGER - 起動ランチャー
echo =======================================================
echo.

cd /d "%~dp0"

:: node_modules の存在チェック
if exist "node_modules\" goto :skip_install
echo [INFO] 初回起動のため、依存パッケージ(Express等)をインストールしています...
cmd /c npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install に失敗しました。Node.jsがインストールされているか確認してください。
    pause
    exit /b 1
)
:skip_install

echo [INFO] バックエンドプロキシサーバーを起動中 (ポート 3010)...
start /b node server.js

:: サーバーの起動待ち (2秒)
timeout /t 2 /nobreak > nul

echo [INFO] ブラウザでアプリを表示します...
start http://localhost:3010

echo.
echo =======================================================
echo  アプリが起動しました。このウィンドウを閉じると終了します。
echo =======================================================
echo.

:: nodeプロセスの終了監視（手動終了まで待機）
pause
