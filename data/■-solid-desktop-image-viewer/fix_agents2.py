import re

with open("AGENTS.md", "r") as f:
    content = f.read()

old_text = "      - スクロール追従：キーボードで画像を選択した際、その画像が常に画面内に見えるように自動スクロール。"
new_text = "      - スクロール追従：キーボードで画像を選択した際、その画像が常に画面内に見えるように自動スクロール。連続移動時に突っかかり（カクつき）が発生しないよう、スムーズスクロール（behavior: 'smooth'）ではなく即時スクロール（behavior: 'auto'）に変更。"

content = content.replace(old_text, new_text)

with open("AGENTS.md", "w") as f:
    f.write(content)
print("AGENTS.md updated for scroll fix")
