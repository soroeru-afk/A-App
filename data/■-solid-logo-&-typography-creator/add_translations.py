with open('/app/applet/App.tsx', 'r') as f:
    content = f.read()

import re

# Insert confirmClearAll into TRANSLATIONS.en
content = re.sub(
    r'(tab3dLabel:\s*"3D ENGINE",)',
    r'\1\n    confirmClearAll: "Are you sure you want to clear all tabs?",',
    content
)

# Insert confirmClearAll into TRANSLATIONS.ja
content = re.sub(
    r'(tab3dLabel:\s*"3Dエンジン",)',
    r'\1\n    confirmClearAll: "すべてのタブを削除してもよろしいですか？",',
    content
)

with open('/app/applet/App.tsx', 'w') as f:
    f.write(content)
