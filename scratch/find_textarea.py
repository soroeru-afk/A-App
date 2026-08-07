import os

file_path = r"c:\Users\soroe\A-App\SUPER-FOLDER-LOG-VIEWER-\src\components\MainContent.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "textarea" in line.lower():
        print(f"Line {i+1}: {line.strip()}")
        # print 5 lines before and after
        start = max(0, i - 5)
        end = min(len(lines), i + 6)
        print("--- Context ---")
        for j in range(start, end):
            print(f"{j+1}: {lines[j].strip()}")
        print("-" * 40)
