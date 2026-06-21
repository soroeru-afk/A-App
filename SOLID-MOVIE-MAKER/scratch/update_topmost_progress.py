from pathlib import Path

map_path = Path(r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\00_【進行】_プロジェクト進捗マップ.txt")

if not map_path.exists():
    print("Error: Progress map not found!")
    exit(1)

content = map_path.read_text(encoding="utf-8", errors="replace")

# 追記するログ
target_log = """    [x] 「参照...」ボタンを実装し、Windows標準フォルダー選択ダイアログ経由で絶対パスを自動取得・入力できるように改善。"""

replacement_log = target_log + """
    [x] フォルダー選択ダイアログがブラウザの背面に隠れないよう、「最前面（TopMost）」で強制表示させるように PowerShell 起動ロジックを最適化。"""

if target_log in content:
    content = content.replace(target_log, replacement_log)
    map_path.write_text(content, encoding="utf-8", errors="replace")
    print("Successfully updated topmost progress in map!")
else:
    print("Warning: Target log not found for replacement.")
