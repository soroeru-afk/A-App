import os
import re

search_path = r"c:\Users\soroe\A-App\SUPER-FOLDER-LOG-VIEWER-\src"

for root, dirs, files in os.walk(search_path):
    for file in files:
        if file.endswith((".ts", ".tsx", ".json", ".html", ".js")):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                if "3.14" in content:
                    print(f"Found '3.14' in file: {file_path}")
                    # Find line numbers
                    for i, line in enumerate(content.split("\n")):
                        if "3.14" in line:
                            print(f"  Line {i+1}: {line.strip()}")
