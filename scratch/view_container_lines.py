import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"c:\Users\soroe\A-App\SUPER-FOLDER-LOG-VIEWER-\src\components\MainContent.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Print lines 400 to 500
for j in range(400, min(len(lines), 500)):
    print(f"{j+1}: {lines[j].rstrip()}")
