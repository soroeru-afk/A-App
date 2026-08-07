import os

file_path = r"c:\Users\soroe\A-App\SUPER-FOLDER-LOG-VIEWER-\src\index.css"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "#edit-area" in line:
        print(f"Line {i+1}: {line.strip()}")
        # print 20 lines after
        end = min(len(lines), i + 21)
        print("--- Context ---")
        for j in range(i, end):
            print(f"{j+1}: {lines[j].strip()}")
        print("-" * 40)
