import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"c:\Users\soroe\A-App\data\00_【進行】_プロジェクト進捗マップ.txt"

with open(file_path, "rb") as f:
    raw_bytes = f.read()

# Let's search for "2 0 2 6 - 0 6 - 3 0" pattern in bytes.
# In UTF-16LE, "2026-06-30" is:
# 2: 0x32 0x00
# 0: 0x30 0x00
# 2: 0x32 0x00
# 6: 0x36 0x00
# -: 0x2d 0x00
# 0: 0x30 0x00
# 6: 0x36 0x00
# -: 0x2d 0x00
# 3: 0x33 0x00
# 0: 0x30 0x00
target_pattern = bytes([0x32, 0x00, 0x30, 0x00, 0x32, 0x00, 0x36, 0x00, 0x2d, 0x00, 0x30, 0x00, 0x36, 0x00, 0x2d, 0x00, 0x33, 0x00, 0x30, 0x00])

idx = raw_bytes.find(target_pattern)
if idx != -1:
    print(f"Found UTF-16LE target pattern at byte index {idx}")
    # Let's try decoding the rest of the file from here as UTF-16LE
    utf16_part = raw_bytes[idx:]
    try:
        decoded_part = utf16_part.decode('utf-16-le', errors='replace')
        print("--- Decoded Part (UTF-16LE) ---")
        print(decoded_part[:1500])
    except Exception as e:
        print("UTF-16LE decode failed:", e)
else:
    print("UTF-16LE target pattern not found.")
    # Show hex dump of the last 200 bytes
    print("Last 200 bytes in hex:")
    print(raw_bytes[-200:].hex())
