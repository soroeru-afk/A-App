import os
import shutil
from datetime import datetime

src_dir = r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用"
dst_dir = r"C:\Users\soroe\Documents\A-App\data\00_AI-SEARCH\00_AIエージェント専用"

def run_backup():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] バックアップ処理を開始します...")
    
    if not os.path.exists(src_dir):
        print(f"エラー: コピー元ディレクトリが見つかりません: {src_dir}")
        return
        
    os.makedirs(dst_dir, exist_ok=True)
    
    copied = 0
    errors = 0
    
    for filename in os.listdir(src_dir):
        src_path = os.path.join(src_dir, filename)
        dst_path = os.path.join(dst_dir, filename)
        
        # We only copy files, not folders (flat structure as per protocol)
        if os.path.isfile(src_path):
            try:
                # If target does not exist or size/mtime is different, copy
                if not os.path.exists(dst_path) or os.path.getmtime(src_path) > os.path.getmtime(dst_path):
                    shutil.copy2(src_path, dst_path)
                    print(f"コピー完了: {filename}")
                    copied += 1
            except Exception as e:
                print(f"エラー発生 ({filename}): {e}")
                errors += 1
                
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] バックアップ完了。新規・更新コピー: {copied} 件, エラー: {errors} 件")

if __name__ == '__main__':
    run_backup()
