import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"c:\Users\soroe\A-App\SUPER-FOLDER-LOG-VIEWER-\src\components\MainContent.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "height" in line.lower() and ("style" in line.lower() or "ref" in line.lower() or "element" in line.lower()):
        print(f"Line {i+1}: {line.strip()}")
        # Context
        start = max(0, i - 3)
        end = min(len(lines), i + 4)
        print("--- Context ---")
        for j in range(start, end):
            print(f"  {j+1}: {lines[j].rstrip()}")
        print("-" * 50)
