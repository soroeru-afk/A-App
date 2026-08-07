import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\00_【進行】_プロジェクト進捗マップ.txt"

with open(file_path, "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

print("File Length (Chars):", len(content))
# Find occurrences of raw corrupt strings
print("LAST 2000 CHARS OF CLEANED MAP:")
print(content[-2000:])
