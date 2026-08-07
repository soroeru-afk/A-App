import sys
import os

# Configure stdout to handle UTF-8 properly to avoid console print errors
sys.stdout.reconfigure(encoding='utf-8')

file_path = r"c:\Users\soroe\A-App\data\00_【進行】_プロジェクト進捗マップ.txt"

if not os.path.exists(file_path):
    print("Error: File not found")
    sys.exit(1)

with open(file_path, "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

print("File Length (Chars):", len(content))
# Find occurrences of the replacement char 
corrupt_indices = [i for i, char in enumerate(content) if char == '']
print("Number of corrupt characters ():", len(corrupt_indices))

if corrupt_indices:
    first_corrupt = corrupt_indices[0]
    print(f"First corruption starts at index {first_corrupt} around:")
    start = max(0, first_corrupt - 200)
    end = min(len(content), first_corrupt + 500)
    print(content[start:end])
else:
    print("No corrupted characters found using replacement check.")
    # Show the last 1500 characters anyway
    print("LAST 1500 CHARS:")
    print(content[-1500:])
