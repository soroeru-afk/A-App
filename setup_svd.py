import os
import sys
import urllib.request
import time

COMFYUI_PATH = r"C:\StabilityMatrix\Data\Packages\comfyui"
url = "https://huggingface.co/FrancisRing/StableAnimator/resolve/main/stable-video-diffusion-img2vid-xt/svd_xt.safetensors"
path = os.path.join(COMFYUI_PATH, "models", "checkpoints", "svd_xt.safetensors")

os.makedirs(os.path.dirname(path), exist_ok=True)
temp_path = path + ".tmp"

print(f"SVD Target Path: {path}")
print(f"SVD Temp Path: {temp_path}")

def get_remote_file_size(url):
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req, timeout=15) as resp:
            return int(resp.headers.get('Content-Length', 0))
    except Exception as e:
        print(f"Warning: Could not get remote file size: {e}")
        return 0

expected_size = get_remote_file_size(url)
if expected_size == 0:
    # フォールバック (SVD-XTの標準サイズ 約9.56GB)
    expected_size = 10265267156

print(f"Expected Size: {expected_size / (1024*1024*1024):.2f} GB ({expected_size} bytes)")

# Check if already completed
if os.path.exists(path):
    if os.path.getsize(path) == expected_size:
        print("[OK] SVD model already fully downloaded.")
        sys.exit(0)
    else:
        print("Existing file size mismatch. Re-downloading...")
        os.remove(path)

def download():
    downloaded = 0
    if os.path.exists(temp_path):
        downloaded = os.path.getsize(temp_path)
        if downloaded > expected_size:
            print("Temp file larger than expected. Re-creating.")
            os.remove(temp_path)
            downloaded = 0

    req = urllib.request.Request(url)
    if downloaded > 0:
        req.add_header('Range', f"bytes={downloaded}-")
        mode = 'ab'
        print(f"Resuming download from byte {downloaded}...")
    else:
        mode = 'wb'
        print("Starting SVD model download (Public Mirror)...")

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(temp_path, mode) as f:
                block_size = 1024 * 1024 # 1MB
                while True:
                    chunk = response.read(block_size)
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    percent = (downloaded / expected_size) * 100
                    sys.stdout.write(f"\rProgress: {percent:.2f}% ({downloaded / (1024*1024):.1f} MB / {expected_size / (1024*1024):.1f} MB)")
                    sys.stdout.flush()
    except Exception as e:
        print(f"\nError during network stream reading: {e}")
        raise e

    print("\nDownload batch finished.")
    if os.path.getsize(temp_path) == expected_size:
        if os.path.exists(path):
            os.remove(path)
        os.rename(temp_path, path)
        print("[SUCCESS] SVD model successfully verified and saved!")
        return True
    return False

# Retry loop in case of connection drop
for attempt in range(1, 11):
    try:
        if download():
            break
    except Exception as e:
        print(f"\n[Attempt {attempt}/10] Error occurred: {e}")
        if attempt < 10:
            print("Waiting 5 seconds before retrying...")
            time.sleep(5)
        else:
            print("Failed after 10 attempts.")
            sys.exit(1)
