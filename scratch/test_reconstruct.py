import sys
import os

file_path = r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\00_【進行】_プロジェクト進捗マップ.txt"

# Read as cp932 to get the string, then convert back to bytes as cp932, and decode as utf-8
with open(file_path, "r", encoding="cp932", errors="ignore") as f:
    text = f.read()

try:
    reconstructed_bytes = text.encode("cp932", errors="ignore")
    utf8_text = reconstructed_bytes.decode("utf-8", errors="ignore")
    
    # Print first 500 chars to see if it is readable now
    print("--- Reconstructed UTF-8 Text (Sample) ---")
    print(utf8_text[:1000])
except Exception as e:
    print(f"Error during reconstruction: {e}")
