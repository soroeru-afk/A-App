import os

file_path = r"c:\Users\soroe\A-App\SUPER-FOLDER-LOG-VIEWER-\src\components\MainContent.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find renderContent call or where isEditing is used
for i, line in enumerate(lines):
    if "rendercontent" in line.lower() or "isediting" in line.lower():
        print(f"Line {i+1}: {line.strip()}")
        
print("\n--- Let's find return statements of the main component ---")
# Usually the main component return statement is near the bottom
for i in range(len(lines) - 100, len(lines)):
    if "return" in lines[i]:
        print(f"Line {i+1}: {lines[i].strip()}")
        # print next 30 lines
        end = min(len(lines), i + 30)
        for j in range(i, end):
            print(f"  {j+1}: {lines[j].rstrip()}")
        print("="*40)
        break
