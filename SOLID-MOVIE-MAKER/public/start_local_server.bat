@echo off
chcp 65001 > nul
title SOLID MOVIE MAKER - Local Link Server
echo ==================================================
echo  [ SOLID MOVIE MAKER ]
echo  ローカル通信サーバー起動スクリプト
echo ==================================================
echo.
echo Python スクリプトを実行しています...
python solid_movie_maker.py

echo.
echo ==================================================
echo プログラムが終了しました。何らかのエラーが表示された場合は、
echo 上記のエラーメッセージをご確認ください。
echo （Pythonがインストールされていない、などの原因が考えられます）
echo ==================================================
pause

