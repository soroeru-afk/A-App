import os
import sys
import json
import re

# Configure output to show UTF-8 properly in console
sys.stdout.reconfigure(encoding='utf-8')

app_data_dir = r"C:\Users\soroe\AppData\Roaming" # Wait, appDataDir from metadata is C:\Users\soroe\.gemini\antigravity
# Let's use the exact path from <user_information> and <artifacts>
app_data_dir = r"C:\Users\soroe\.gemini\antigravity"
conversation_id = "4665ab5a-5a17-419e-bf4a-83a39e056209"

log_file = os.path.join(app_data_dir, "brain", conversation_id, ".system_generated", "logs", "transcript_full.jsonl")

if not os.path.exists(log_file):
    # Try alternative paths just in case
    print(f"Log file not found at: {log_file}")
    sys.exit(1)

print(f"Reading log file: {log_file}")

corrupted_lines = []

with open(log_file, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            # Find the step that contains the view_file tool output for the map
            # Look for indicators of the first tool call
            content = data.get("content", "")
            if "00_【進行】_プロジェクト進捗マップ.txt" in content and "Showing lines 1 to 482" in content:
                # Found the tool output line!
                # It might be in content or tool_calls depending on format. Let's parse it.
                print("Found matching log entry containing the file content!")
                
                # Extract the lines
                # The format in content has line numbers like: "1: 騾ｲ謐励・..."
                lines_matches = re.findall(r"^\d+:\s*(.*)$", content, re.MULTILINE)
                if lines_matches:
                    corrupted_lines = lines_matches
                    print(f"Extracted {len(corrupted_lines)} lines from the log.")
                    break
        except Exception as e:
            continue

if not corrupted_lines:
    print("Failed to extract corrupted file lines from the log.")
    sys.exit(1)

# Reconstruct the string
corrupted_text = "\n".join(corrupted_lines)

# Now, reverse the encoding.
# The original file was UTF-8. 
# The view_file tool read it and decoded it using CP932 (or similar) into Python string, which was printed as UTF-8.
# Therefore:
# 1. Encode the string to CP932 bytes (which recovers the original UTF-8 bytes)
# 2. Decode the bytes as UTF-8 to get the correct Japanese text!
try:
    original_bytes = corrupted_text.encode('cp932', errors='replace')
    restored_text = original_bytes.decode('utf-8', errors='replace')
    
    print("--- Sample of Restored Text ---")
    print(restored_text[:1000])
    
    # Save the restored map back to Google Drive (and local backup)
    drive_path = r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\00_【進行】_プロジェクト進捗マップ.txt"
    local_backup_path = r"c:\Users\soroe\A-App\data\00_【進行】_プロジェクト進捗マップ.txt"
    
    # Let's ensure directories exist
    os.makedirs(os.path.dirname(drive_path), exist_ok=True)
    os.makedirs(os.path.dirname(local_backup_path), exist_ok=True)
    
    # Save to both locations in UTF-8
    with open(drive_path, "w", encoding="utf-8") as out_f:
        out_f.write(restored_text)
    print(f"Successfully restored file to Google Drive: {drive_path}")
    
    with open(local_backup_path, "w", encoding="utf-8") as out_f:
        out_f.write(restored_text)
    print(f"Successfully saved backup to local data: {local_backup_path}")
    
except Exception as e:
    print(f"Error during reverse encoding: {e}")
