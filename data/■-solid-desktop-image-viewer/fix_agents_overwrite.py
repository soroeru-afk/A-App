import re

with open("AGENTS.md", "r") as f:
    content = f.read()

new_rule = """
23. **同じ名前の画像がドロップされた時の更新（上書き）機能**
    - 同じ名前の画像（すでにリストに登録されている画像）をドラッグ＆ドロップした際、これまでは自動的にスキップ（弾かれる）仕様でしたが、専用の確認モーダルダイアログを表示して、ユーザーが「更新する（UPDATE）」か「キャンセル（CANCEL）」を選択できるように改善。
    - 「更新する」を選択した場合は、以前の画像の並び順（orderIndex）を保持したまま、新しい画像データで上書き（再登録）されるように最適化。"""

content += new_rule

with open("AGENTS.md", "w") as f:
    f.write(content)
print("AGENTS.md updated for overwrite feature")
