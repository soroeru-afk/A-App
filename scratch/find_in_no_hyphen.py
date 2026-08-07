import os

# Check if super-folder-log-viewer (no trailing hyphen) exists and search for version "3.14" or index.css
path_no_hyphen = r"c:\Users\soroe\A-App\super-folder-log-viewer"

if os.path.exists(path_no_hyphen):
    print("Folder super-folder-log-viewer (no hyphen) exists.")
    # Search for "3.14" inside
    found = False
    for root, dirs, files in os.walk(path_no_hyphen):
        for file in files:
            if file.endswith((".ts", ".tsx", ".json", ".html", ".js", ".css")):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    if "3.14" in content:
                        print(f"Found '3.14' in: {file_path}")
                        found = True
    if not found:
        print("No '3.14' found in the no-hyphen directory.")
else:
    print("Folder super-folder-log-viewer (no hyphen) does not exist.")
