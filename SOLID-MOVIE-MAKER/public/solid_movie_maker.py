import os
import sys
import json
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
import tkinter as tk
from tkinter import filedialog
from pathlib import Path
import uuid

PORT = 8000

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
            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
        
        elif self.path == '/select-folder':
            root = tk.Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            folder_path = filedialog.askdirectory(title="動画フォルダーを選択")
            root.destroy()
            
            if not folder_path:
                self.send_response(400)
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Cancelled"}).encode('utf-8'))
                return
            
            supported = {'.mp4', '.mkv', '.avi', '.webm', '.ts', '.wmv', '.flv'}
            videos = []
            base = Path(folder_path)
            
            for f in base.rglob('*'):
                if f.is_file() and f.suffix.lower() in supported:
                    try:
                        rel = f.relative_to(base)
                        cat_name = rel.parent.name if len(rel.parts) > 1 else base.name
                        videos.append({
                            "id": "vid_" + str(uuid.uuid4())[:8],
                            "title": f.stem,
                            "categoryId": cat_name,
                            "localPath": str(f.resolve()),
                            "originalName": f.name
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
        if self.path == '/play':
            content_len = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_len).decode('utf-8')
            try:
                data = json.loads(body)
                filepath = data.get('path')
                if filepath and os.path.exists(filepath):
                    player = find_player()
                    if player:
                        subprocess.Popen([player, filepath])
                    else:
                        os.startfile(filepath)
                    self.send_response(200)
                    self._send_cors()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "playing"}).encode('utf-8'))
                else:
                    self.send_response(404)
                    self._send_cors()
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "File not found"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

if __name__ == '__main__':
    server_address = ('127.0.0.1', PORT)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    print("\n==================================================")
    print(" [ SOLID MOVIE MAKER ]")
    print(" ローカルリンクサーバーが起動しました！")
    print(f" ポート: {PORT} で待機中...")
    print(" --------------------------------------------------")
    print(" 状態: ONLINE")
    print(" 外部プレイヤー連携 (KMPlayer / PotPlayer) : 準備完了")
    print(" フォルダ自動抽出 API : 準備完了")
    print(" ==================================================")
    print(" ※この黒い画面（コマンドプロンプトやターミナル）を開いたまま、")
    print("   Webブラウザのアプリを操作してください。")
    print(" ※終了する場合は、このウィンドウを閉じるか Ctrl+C を押してください。\n")
    httpd.serve_forever()
