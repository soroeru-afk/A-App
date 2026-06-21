from pathlib import Path

map_path = Path(r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\00_【進行】_プロジェクト進捗マップ.txt")

if not map_path.exists():
    print("Error: Progress map not found!")
    exit(1)

content = map_path.read_text(encoding="utf-8", errors="replace")

# No.14 概要のPWA対応を ❌ 未実装 から 🟢 完了 に更新
content = content.replace("● PWA対応: ❌ 未実装", "● PWA対応: 🟢 完了 (PWA化済み)")

# 追記するログ
target_log = """    [x] 黒い画面（コマンドプロンプト）を出さずにサーバーをバックグラウンドで起動する「起動.vbs」と、プロセス終了用の「停止.bat」を整備。"""

replacement_log = target_log + """
    [x] 「参照...」ボタンを実装し、Windows標準フォルダー選択ダイアログ経由で絶対パスを自動取得・入力できるように改善。
    [x] manifest.json、サービスワーカー（sw.js）、PWAアイコン（pwa-icon.jpg）を実装し、面倒な設定なしでブラウザから1クリックでPWAインストールできるように対応。"""

if target_log in content:
    content = content.replace(target_log, replacement_log)
    map_path.write_text(content, encoding="utf-8", errors="replace")
    print("Successfully updated PWA progress in map!")
else:
    print("Warning: Target log not found for replacement.")
