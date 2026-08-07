import re

with open("AGENTS.md", "r") as f:
    content = f.read()

old_text = "      - 閉じる：フルスクリーン時に`Esc`または`Backspace`キーで一覧画面に戻る。"
new_text = "      - UI表示切替：フルスクリーン時に`U`キーでボタンやファイル名などのUI表示/非表示を切り替え。\n      - 閉じる：フルスクリーン時に`Esc`または`Backspace`キーで一覧画面に戻る。"

content = content.replace(old_text, new_text)

with open("AGENTS.md", "w") as f:
    f.write(content)
print("AGENTS.md updated for hide UI")
