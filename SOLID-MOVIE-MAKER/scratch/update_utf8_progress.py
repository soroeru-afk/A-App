from pathlib import Path

map_path = Path(r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\00_【進行】_プロジェクト進捗マップ.txt")

if not map_path.exists():
    print("Error: Progress map not found!")
    exit(1)

content = map_path.read_text(encoding="utf-8", errors="replace")

# 追記するログ
target_log = """    [x] フォルダー選択ダイアログがブラウザの背面に隠れないよう、「最前面（TopMost）」で強制表示させるように PowerShell 起動ロジックを最適化。"""

replacement_log = target_log + """
    [x] フォルダー選択ダイアログの日本語出力（「デスクトップ」等）の文字化けを解消するため、PowerShell出力をUTF-8に強制設定。
    [x] ポート競合（他のPWAアプリとの衝突）を回避してインストールマークをURLバーに出現させるため、アプリのポートを 3009 に変更。"""

if target_log in content:
    content = content.replace(target_log, replacement_log)
    map_path.write_text(content, encoding="utf-8", errors="replace")
    print("Successfully updated final layout progress in map!")
else:
    print("Warning: Target log not found for replacement.")
