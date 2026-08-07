import os

file_path = r"c:\Users\soroe\A-App\SUPER-FOLDER-LOG-VIEWER-\src\components\MainContent.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "{rendercontent()}" in line.lower() or "rendercontent()" in line.lower():
        print(f"Line {i+1}: {line.strip()}")
        # print context
        start = max(0, i - 15)
        end = min(len(lines), i + 15)
        for j in range(start, end):
            print(f"{j+1}: {lines[j].rstrip()}")
        print("-" * 50)
