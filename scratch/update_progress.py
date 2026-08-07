import sys
import os
import re
from datetime import datetime

file_path = r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\00_【進行】_プロジェクト進捗マップ.txt"
local_backup_path = r"c:\Users\soroe\A-App\data\00_【進行】_プロジェクト進捗マップ.txt"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the previous insert to mention version v3.15
old_str = "[x] 編集モード起動時、ファイル編集用テキストエリアの初期の高さ（最小高さ）を500pxから800pxに拡大し、いちいち枠を広げる手間を省くよう改善。"
new_str = "[x] 編集モード起動時、ファイル編集用テキストエリアの初期の高さ（最小高さ）を500pxから800pxに拡大し、いちいち枠を広げる手間を省くよう改善（これに伴い、バージョンを v3.15 にアップデート）。"

if old_str in content:
    content = content.replace(old_str, new_str)
    print("Updated progress map text to include version v3.15.")
else:
    print("Target progress map text not found for modification.")

# Save both in UTF-8
with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Saved to Google Drive: {file_path}")

with open(local_backup_path, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Saved to local backup: {local_backup_path}")
