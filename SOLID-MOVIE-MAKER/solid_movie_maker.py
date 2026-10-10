import os
import sys
import json
import subprocess
import webbrowser
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import uuid

class DummyStream:
    def write(self, s):
        try:
            if sys.__stdout__:
                sys.__stdout__.write(s)
        except Exception:
            pass
    def flush(self):
        try:
            if sys.__stdout__:
                sys.__stdout__.flush()
        except Exception:
            pass

if sys.stdout is None or not hasattr(sys.stdout, 'write'):
    sys.stdout = DummyStream()
if sys.stderr is None or not hasattr(sys.stderr, 'write'):
    sys.stderr = DummyStream()

def safe_print(*args, **kwargs):
    try:
        print(*args, **kwargs)
    except Exception:
        pass

PORT = 3009

POTPLAYER_CANDIDATES = [
    r"C:\Program Files\DAUM\PotPlayer\PotPlayer64.exe",
    r"C:\Program Files (x86)\DAUM\PotPlayer\PotPlayer.exe",
    r"C:\Program Files\PotPlayer\PotPlayer64.exe",
    r"C:\Program Files (x86)\PotPlayer\PotPlayer.exe",
    r"D:\PotPlayer\PotPlayer64.exe",
    r"E:\PotPlayer\PotPlayer64.exe",
]

KMPLAYER_CANDIDATES = [
    r"C:\Program Files\KMPlayer 64X\KMPlayer64.exe",
    r"C:\Program Files\KMPlayer\KMPlayer.exe",
    r"C:\Program Files (x86)\The KMPlayer\KMPlayer.exe",
    r"C:\Program Files (x86)\KMPlayer\KMPlayer.exe",
    r"C:\KMPlayer\KMPlayer.exe",
    r"C:\KMPlayer 64X\KMPlayer64.exe",
    r"D:\KMPlayer 64X\KMPlayer64.exe",
    r"E:\KMPlayer 64X\KMPlayer64.exe",
]

def find_player(preference="auto"):
    potplayer = next((p for p in POTPLAYER_CANDIDATES if os.path.exists(p)), None)
    kmplayer = next((p for p in KMPLAYER_CANDIDATES if os.path.exists(p)), None)

    if preference == "potplayer" and potplayer:
        return potplayer
    if preference == "kmplayer" and kmplayer:
        return kmplayer
    return potplayer or kmplayer or None

import re
import urllib.parse

def clean_path_string(path_str):
    if not path_str:
        return ""
    s = str(path_str).strip('\'"')
    if '%2' in s or '%C' in s or '%E' in s:
        try:
            s = urllib.parse.unquote(s)
        except Exception:
            pass
    s = re.sub(r'[\u0080-\u009f\u200b-\u200d\ufeff]', '', s)
    return s.strip()

def norm_str(s):
    if not s:
        return ""
    cleaned = clean_path_string(s)
    return re.sub(r'[\s\[\]【】\-_()（）.\'\"／/]', '', cleaned.lower())

def resolve_existing_path(path_str):
    if not path_str:
        return path_str
    clean = clean_path_string(path_str)
    if os.path.exists(clean):
        return clean

    # 1. Deduplicate duplicated folder names (e.g. E:\Movies\MOVIE\... -> E:\MOVIE\... or E:\Movies\...)
    parts = clean.split('\\')
    if len(parts) >= 3:
        dedup_parts = []
        for p in parts:
            if not dedup_parts or p.lower() != dedup_parts[-1].lower():
                dedup_parts.append(p)
        dedup_path = '\\'.join(dedup_parts)
        if os.path.exists(dedup_path):
            return dedup_path

    # 2. Try skipping second folder (e.g. E:\Movies\MOVIE\file.mkv -> E:\Movies\file.mkv or E:\■HD映画\file.mkv)
    if len(parts) >= 4:
        alt_parts = [parts[0]] + parts[2:]
        alt_path = '\\'.join(alt_parts)
        if os.path.exists(alt_path):
            return alt_path

    # 3. Drive letter replacement
    if len(clean) > 2 and clean[1] == ':':
        for drive in ['E:', 'D:', 'F:', 'C:']:
            cand = drive + clean[2:]
            if os.path.exists(cand):
                return cand

    filename = os.path.basename(clean)
    candidate_dirs = [
        r"E:\■HD映画", r"E:\Movies", r"E:\MOVIE", r"D:\Movies", r"D:\MOVIE", r"F:\Movies", r"F:\MOVIE", "E:\\", "D:\\", "F:\\"
    ]

    # 4. Exact filename match in candidate dirs
    for cd in candidate_dirs:
        if os.path.exists(cd):
            cand = os.path.join(cd, filename)
            if os.path.exists(cand):
                return cand
            try:
                for root, dirs, files in os.walk(cd):
                    if filename in files:
                        return os.path.join(root, filename)
            except Exception:
                pass

    # 5. Smart Fuzzy Match (Normalized title/filename comparison)
    norm_target = norm_str(filename)
    if norm_target:
        for cd in candidate_dirs:
            if os.path.exists(cd):
                try:
                    for root, dirs, files in os.walk(cd):
                        for f in files:
                            norm_f = norm_str(f)
                            if norm_target in norm_f or norm_f in norm_target or (len(norm_target) >= 8 and norm_target[:10] in norm_f):
                                return os.path.join(root, f)
                except Exception:
                    pass

    return clean

class SolidMovieHandler(SimpleHTTPRequestHandler):
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
        if self.path in ('/status', '/api/status', '/api/player-status'):
            potplayer = next((p for p in POTPLAYER_CANDIDATES if os.path.exists(p)), None)
            kmplayer = next((p for p in KMPLAYER_CANDIDATES if os.path.exists(p)), None)
            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "connected": True,
                "potplayer": potplayer,
                "kmplayer": kmplayer,
                "potplayerFound": bool(potplayer),
                "kmplayerFound": bool(kmplayer)
            }).encode('utf-8'))
        elif self.path in ('/select-folder', '/api/select-folder'):
            folder_path = None
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
            
            supported = {'.mp4', '.mkv', '.m4v', '.mov', '.avi', '.webm', '.ts', '.wmv', '.flv', '.m2ts', '.mp4v', '.3gp'}
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
            self.wfile.write(json.dumps({"folder": str(base), "folderPath": str(base), "videos": videos}).encode('utf-8'))
        else:
            dist_dir = Path(__file__).parent / 'dist'
            if dist_dir.exists():
                req_path = self.path.split('?')[0].lstrip('/')
                target_file = (dist_dir / req_path).resolve()
                if req_path and target_file.is_file() and str(target_file).startswith(str(dist_dir.resolve())):
                    mime_type, _ = mimetypes.guess_type(str(target_file))
                    mime_type = mime_type or 'application/octet-stream'
                    self.send_response(200)
                    self._send_cors()
                    self.send_header("Content-Type", f"{mime_type}; charset=utf-8" if "text" in mime_type or "javascript" in mime_type or "json" in mime_type else mime_type)
                    self.end_headers()
                    self.wfile.write(target_file.read_bytes())
                    return
                else:
                    self.send_response(200)
                    self._send_cors()
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.end_headers()
                    index_file = dist_dir / 'index.html'
                    if index_file.exists():
                        self.wfile.write(index_file.read_bytes())
                    return
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

        if self.path in ('/play', '/api/play'):
            raw_path = data.get('path') or data.get('filePath')
            preferred = data.get('player') or data.get('preferredPlayer') or 'auto'
            if raw_path:
                target_path = resolve_existing_path(raw_path)
                player = find_player(preferred)
                launched_name = "Player"

                try:
                    if player and os.path.exists(player):
                        cmd = f'"{player}" "{target_path}"'
                        subprocess.Popen(cmd, shell=True)
                        launched_name = os.path.basename(player)
                    else:
                        os.startfile(target_path)
                        launched_name = "Windows Default Player"
                except Exception as e:
                    try:
                        subprocess.Popen(f'start "" "{target_path}"', shell=True)
                        launched_name = "Default Launcher"
                    except Exception:
                        pass

                self.send_response(200)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "playing", "player": launched_name, "path": target_path}).encode('utf-8'))
                return
            else:
                self.send_response(400)
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing filepath"}).encode('utf-8'))

        elif self.path in ('/check-files', '/api/check-files', '/api/verify-paths'):
            paths = data.get('paths', [])
            results = {}
            for p in paths:
                resolved = resolve_existing_path(p) if p else None
                results[p] = bool(resolved and os.path.exists(resolved))
            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"results": results}).encode('utf-8'))

        elif self.path in ('/open-folder', '/api/open-folder'):
            raw_path = data.get('path') or data.get('filePath')
            if raw_path:
                target_path = resolve_existing_path(raw_path)
                try:
                    subprocess.Popen(f'explorer /select,"{target_path}"')
                except Exception:
                    pass
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

import socket

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

def free_port(port):
    try:
        # 1. Quick check if port is already free
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.1)
        res = s.connect_ex(('127.0.0.1', port))
        s.close()
        if res != 0:
            return  # Port is completely free, no netstat needed!
    except Exception:
        pass

    # 2. If port is occupied by stale process, terminate it
    try:
        import subprocess
        out = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True).decode()
        for line in out.strip().split('\n'):
            parts = line.strip().split()
            if len(parts) >= 5 and parts[1].endswith(f':{port}') and parts[3] == 'LISTENING':
                pid = parts[4]
                if pid != '0' and str(os.getpid()) != pid:
                    subprocess.call(f'taskkill /F /PID {pid}', shell=True)
    except Exception:
        pass

def register_startup():
    try:
        import winreg
        py_exe = sys.executable
        if 'python.exe' in py_exe.lower():
            pyw = py_exe.lower().replace('python.exe', 'pythonw.exe')
            if os.path.exists(pyw):
                py_exe = pyw
        script_path = str(Path(__file__).resolve())
        cmd_str = f'"{py_exe}" "{script_path}"'
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Run", 0, winreg.KEY_SET_VALUE)
        winreg.SetValueEx(key, "SolidMovieMakerEngine", 0, winreg.REG_SZ, cmd_str)
        winreg.CloseKey(key)
    except Exception:
        pass

def is_already_running(port=3009):
    try:
        import urllib.request
        req = urllib.request.urlopen(f'http://127.0.0.1:{port}/status', timeout=0.3)
        if req.status == 200:
            return True
    except Exception:
        pass
    return False

if __name__ == '__main__':
    os.chdir(Path(__file__).parent)
    register_startup()
    if is_already_running(3009):
        safe_print("Solid Movie Maker engine is already running on port 3009.")
        sys.exit(0)
    free_port(3009)
    active_port = 3009
    httpd = None
    for try_port in [3009, 8000, 3000, 8080]:
        try:
            server_address = ('0.0.0.0', try_port)
            httpd = HTTPServer(server_address, SolidMovieHandler)
            active_port = try_port
            break
        except Exception:
            continue

    if not httpd:
        safe_print("Error: Could not bind to any port.")
        sys.exit(1)

    local_ip = get_local_ip()

    safe_print("\n==================================================")
    safe_print(" [ SOLID MOVIE MAKER ]")
    safe_print(" ローカルファイル管理＆プレイヤー直結エンジン")
    safe_print(f" ポート: {active_port} で待機中...")
    safe_print(" --------------------------------------------------")
    safe_print(" 状態: ONLINE")
    safe_print(f" PC用URL     : http://localhost:{active_port}")
    safe_print(f" iPhone用URL  : http://{local_ip}:{active_port}")
    safe_print(" PotPlayer / KMPlayer 検出機能: 有効")
    safe_print(" ==================================================\n")

    dist_index = Path(__file__).parent / 'dist' / 'index.html'
    if '--open-browser' in sys.argv and dist_index.exists():
        webbrowser.open(f'http://localhost:{active_port}')
    
    httpd.serve_forever()

