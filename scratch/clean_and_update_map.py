import sys
import os
import re
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

src_file = r"c:\Users\soroe\A-App\data\00_【進行】_プロジェクト進捗マップ.txt"
dest_file_drive = r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\00_【進行】_プロジェクト進捗マップ.txt"
dest_file_local = r"c:\Users\soroe\A-App\data\00_【進行】_プロジェクト進捗マップ.txt"

with open(src_file, "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

# Search using raw null bytes in python string representation: \x00
# "2\x000\x002\x006"
start_idx = content.find("2\x000\x002\x006")
# If that fails, let's try with other potential representations or search for "\x00"
if start_idx == -1:
    # Try finding any large concentration of \x00
    # Let's search for \x00 directly
    start_idx = content.find("\x00")

bad_end_marker = "[x] 誤用を防ぐため"

if start_idx != -1:
    # Adjust start index to start at the beginning of the line or at least near the bad section
    # Let's search backwards to find the start of that line (new line before the null chars)
    line_start = content.rfind("\n", 0, start_idx)
    if line_start != -1:
        start_idx = line_start + 1
        
    end_idx = content.find(bad_end_marker, start_idx)
    if end_idx != -1:
        content = content[:start_idx] + content[end_idx:]
        print(f"Successfully cut out the corrupted block starting at index {start_idx} using null byte detection.")
    else:
        print("End marker not found after null byte detection.")
else:
    print("No null bytes found in the file.")

# Update date in line 1
now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
content = re.sub(r"更新日時:\s*\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2}", f"更新日時: {now_str}", content, count=1)
content = re.sub(r"進捗マップ 更新日時:\s*\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2}", f"進捗マップ 更新日時: {now_str}", content, count=1)

# Remove duplicate inserts of K-NAVIGATOR progress from today
content = re.sub(r"\n\s*【完了・進捗】\(2026-07-01 \d{2}:\d{2}\).*?再調整。", "", content, flags=re.DOTALL)

# Find "15. SOLID K-NAVIGATOR" and insert progress
target_marker = "15. SOLID K-NAVIGATOR"
match = re.search(r"15\.\s*SOLID\s*K-NAVIGATOR", content, re.IGNORECASE)
if match:
    idx = match.start()
    dash_match = re.search(r"-{4,}", content[idx:])
    if dash_match:
        insert_pos = idx + dash_match.end()
        new_progress = f"\n  【完了・進捗】({now_str})\n    [x] 検索窓にクリア用の「×」ボタンを追加。1クリックで検索内容を消去し、検索を解除できるよう改善。\n    [x] 検索機能において、どのカテゴリが選択されていても登録済みの全銘柄からコード番号や銘柄名で横断検索できるよう修正。\n    [x] 銘柄登録時に、他のカテゴリに登録されていても、同一カテゴリ内で重複していなければ登録できるようバリデーションを緩和。なお、銘柄追加・移動・ミニ画面の各カテゴリー選択プルダウン内での「未割り当て」の並び順は、利便性（デフォルト選択肢としての配置）を考慮し、一番上のままとするよう再調整。"
        content = content[:insert_pos] + new_progress + content[insert_pos:]
        print("Successfully updated K-NAVIGATOR progress.")
else:
    print("Warning: K-NAVIGATOR section not found.")

# Save files in UTF-8
with open(dest_file_drive, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Saved to Google Drive: {dest_file_drive}")

with open(dest_file_local, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Saved to local backup: {dest_file_local}")
