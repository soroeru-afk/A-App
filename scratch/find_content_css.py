import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"c:\Users\soroe\A-App\SUPER-FOLDER-LOG-VIEWER-\src\index.css"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "#content-area" in line or "#content-inner" in line:
        print(f"Line {i+1}: {line.strip()}")
        end = min(len(lines), i + 20)
        print("--- Context ---")
        for j in range(i, end):
            print(f"{j+1}: {lines[j].rstrip()}")
        print("=" * 40)
