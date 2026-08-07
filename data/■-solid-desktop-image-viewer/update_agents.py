import re

with open("AGENTS.md", "r") as f:
    content = f.read()

old_text = """      - モード切替：`P`または`R`キーでポートレートモードの回転切替、`F`キーでボーダレスフルスクリーンの切替。"""
new_text = """      - モード切替等：`P`キーでポートレートモードの回転切替、`F`キーでボーダレスフルスクリーンの切替、`R`キーで画像の90度回転、`H`キーで画像の左右反転。各ボタンのツールチップにもショートカットキーと日本語の説明を表示。"""

content = content.replace(old_text, new_text)

with open("AGENTS.md", "w") as f:
    f.write(content)
print("AGENTS.md updated")
