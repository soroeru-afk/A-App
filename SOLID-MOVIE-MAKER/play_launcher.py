import os
import sys
import subprocess
import urllib.parse
from pathlib import Path

# Debug logging
log_path = Path(__file__).parent / "launcher_debug.log"
with open(log_path, "a", encoding="utf-8") as log:
    log.write("\n===================================\n")
    log.write("Solid Play Launcher triggered\n")
    log.write(f"Raw arguments: {sys.argv}\n")

PLAYERS = [
    r"C:\Program Files\DAUM\PotPlayer\PotPlayer64.exe",
    r"C:\Program Files (x86)\DAUM\PotPlayer\PotPlayer.exe",
    r"C:\Program Files\KMPlayer 64X\KMPlayer64.exe",
    r"C:\KMPlayer\KMPlayer.exe",
    r"C:\Program Files\KMPlayer\KMPlayer.exe"
]

def find_player():
    for p in PLAYERS:
        if os.path.exists(p):
            return p
    return None

def main():
    if len(sys.argv) < 2:
        with open(log_path, "a", encoding="utf-8") as log:
            log.write("Error: No arguments passed to launcher.\n")
        return

    uri = sys.argv[1]
    with open(log_path, "a", encoding="utf-8") as log:
        log.write(f"Received URI: {uri}\n")

    video_path = None

    # Parse query parameter if present (e.g. solid-play://?path=C%3A%5C...)
    if "path=" in uri:
        try:
            # Simple manual query extraction to be safe from urlparse nuances
            # Find the path= part
            idx = uri.find("path=")
            path_val = uri[idx + 5:]
            # Strip trailing slash Chrome might append
            path_val = path_val.rstrip("/\\")
            video_path = urllib.parse.unquote(path_val)
            with open(log_path, "a", encoding="utf-8") as log:
                log.write(f"Extracted path from query: {video_path}\n")
        except Exception as e:
            with open(log_path, "a", encoding="utf-8") as log:
                log.write(f"Query parsing error: {e}\n")

    if not video_path:
        # Fallback to direct parsing
        if uri.startswith("solid-play://"):
            encoded_path = uri[len("solid-play://"):]
            video_path = urllib.parse.unquote(encoded_path)
        else:
            video_path = uri

    # Clean up and normalize
    video_path = video_path.rstrip("/\\")
    video_path = os.path.normpath(video_path)

    with open(log_path, "a", encoding="utf-8") as log:
        log.write(f"Decoded and normalized video path: {video_path}\n")

    if not os.path.exists(video_path):
        # Retry with URL decode twice just in case of double encoding
        video_path = urllib.parse.unquote(video_path).rstrip("/\\")
        video_path = os.path.normpath(video_path)
        with open(log_path, "a", encoding="utf-8") as log:
            log.write(f"Retry decode check path: {video_path}\n")
            
        if not os.path.exists(video_path):
            with open(log_path, "a", encoding="utf-8") as log:
                log.write(f"Error: File does not exist: {video_path}\n")
            import ctypes
            ctypes.windll.user32.MessageBoxW(0, f"ファイルが見つかりません:\n{video_path}", "Solid Movie Maker Error", 0x10 | 0x0)
            return

    player = find_player()
    if player:
        with open(log_path, "a", encoding="utf-8") as log:
            log.write(f"Launching video with player: {player}\n")
        subprocess.Popen([player, video_path])
    else:
        with open(log_path, "a", encoding="utf-8") as log:
            log.write("No player found. Fallback to os.startfile\n")
        os.startfile(video_path)

if __name__ == "__main__":
    main()
