from pathlib import Path

map_path = Path(r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\00_【進行】_プロジェクト進捗マップ.txt")

if not map_path.exists():
    print("Error: Progress map not found!")
    exit(1)

content = map_path.read_text(encoding="utf-8", errors="replace")

# 追記するログ
target_log = """    [x] 動画リスト内の再生ボタンの横に「外部再生（テレビ型）」ボタンを追加し、1クリックで KMPlayer / PotPlayer を起動して音声多重や字幕付き動画を再生できるように連携。"""

replacement_log = target_log + """
    [x] 単体ファイル入力時でも「フォルダーの絶対パス」が入力されていれば localPath を自動合成し、外部再生が使えるように機能拡張。
    [x] 黒い画面（コマンドプロンプト）を出さずにサーバーをバックグラウンドで起動する「起動.vbs」と、プロセス終了用の「停止.bat」を整備。"""

if target_log in content:
    content = content.replace(target_log, replacement_log)
    map_path.write_text(content, encoding="utf-8", errors="replace")
    print("Successfully updated final progress map!")
else:
    print("Warning: Target log not found for replacement.")
