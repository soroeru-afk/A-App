import os
import sys
import json
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import uuid

PORT = 8000

POTPLAYER_CANDIDATES = [
    r"C:\Program Files\DAUM\PotPlayer\PotPlayer64.exe",
    r"C:\Program Files (x86)\DAUM\PotPlayer\PotPlayer.exe",
    r"C:\Program Files\PotPlayer\PotPlayer64.exe",
    r"C:\Program Files (x86)\PotPlayer\PotPlayer.exe",
]

KMPLAYER_CANDIDATES = [
    r"C:\Program Files\KMPlayer 64X\KMPlayer64.exe",
    r"C:\Program Files\KMPlayer\KMPlayer.exe",
    r"C:\Program Files (x86)\The KMPlayer\KMPlayer.exe",
    r"C:\Program Files (x86)\KMPlayer\KMPlayer.exe",
    r"C:\KMPlayer\KMPlayer.exe",
    r"C:\KMPlayer 64X\KMPlayer64.exe",
]

def find_player(preference="auto"):
    potplayer = next((p for p in POTPLAYER_CANDIDATES if os.path.exists(p)), None)
    kmplayer = next((p for p in KMPLAYER_CANDIDATES if os.path.exists(p)), None)

    if preference == "potplayer" and potplayer:
        return potplayer
    if preference == "kmplayer" and kmplayer:
        return kmplayer
    return potplayer or kmplayer or None

class CORSRequestHandler(BaseHTTPRequestHandler):
    def _send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        if self.path == '/status':
            potplayer = next((p for p in POTPLAYER_CANDIDATES if os.path.exists(p)), None)
            kmplayer = next((p for p in KMPLAYER_CANDIDATES if os.path.exists(p)), None)
            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "potplayer": potplayer,
                "kmplayer": kmplayer
            }).encode('utf-8'))
        elif self.path == '/select-folder':
            try:
                import tkinter as tk
                from tkinter import filedialog
                root = tk.Tk()
                root.withdraw()
                root.attributes('-topmost', True)
                folder_path = filedialog.askdirectory(title="動画フォルダーを選択")
                root.destroy()
            except Exception:
                folder_path = None
            
            if not folder_path:
                self.send_response(400)
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Cancelled"}).encode('utf-8'))
                return
            
            supported = {'.mp4', '.mkv', '.avi', '.webm', '.ts', '.wmv', '.flv', '.m2ts'}
            videos = []
            base = Path(folder_path)
            
            for f in base.rglob('*'):
                if f.is_file() and f.suffix.lower() in supported:
                    try:
                        rel = f.relative_to(base)
                        cat_name = rel.parent.name if len(rel.parts) > 1 else base.name
                        size_mb = f"{f.stat().st_size / (1024 * 1024):.1f} MB"
                        videos.append({
                            "id": "vid_" + str(uuid.uuid4())[:8],
                            "title": f.stem,
                            "categoryId": cat_name,
                            "localPath": str(f.resolve()),
                            "originalName": f.name,
                            "extension": f.suffix.lower().replace('.', '').upper(),
                            "fileSize": size_mb,
                            "createdAt": int(f.stat().st_mtime * 1000)
                        })
                    except Exception:
                        pass
                        
            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"folder": str(base), "videos": videos}).encode('utf-8'))
        else:
            self.send_response(404)
            self._send_cors()
            self.end_headers()

    def do_POST(self):
        content_len = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_len).decode('utf-8')
        try:
            data = json.loads(body) if body else {}
        except Exception:
            data = {}

        if self.path == '/play':
            filepath = data.get('path') or data.get('filePath')
            preferred = data.get('player', 'auto')
            if filepath and os.path.exists(filepath):
                player = find_player(preferred)
                if player:
                    subprocess.Popen([player, filepath])
                    launched_name = os.path.basename(player)
                else:
                    os.startfile(filepath)
                    launched_name = "Default Player"
                self.send_response(200)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "playing", "player": launched_name}).encode('utf-8'))
            else:
                self.send_response(404)
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "File not found"}).encode('utf-8'))
        elif self.path == '/open-folder':
            filepath = data.get('path') or data.get('filePath')
            if filepath:
                subprocess.Popen(f'explorer /select,"{filepath}"')
                self.send_response(200)
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
            else:
                self.send_response(400)
                self._send_cors()
                self.end_headers()
        else:
            self.send_response(404)
            self._send_cors()
            self.end_headers()

if __name__ == '__main__':
    server_address = ('127.0.0.1', PORT)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    print("\n==================================================")
    print(" [ SOLID MOVIE MAKER ]")
    print(" ローカル通信サーバー（PotPlayer / KMPlayer 連携）")
    print(f" ポート: {PORT} で待機中...")
    print(" --------------------------------------------------")
    print(" 状態: ONLINE")
    print(" PotPlayer / KMPlayer 検出機能: 有効")
    print(" ==================================================")
    print(" ※この画面を開いたまま、Webブラウザを操作してください。\n")
    httpd.serve_forever()
