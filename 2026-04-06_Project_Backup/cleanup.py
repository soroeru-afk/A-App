import os
import shutil

def main():
    backup_dir = '2026-04-06_Project_Backup'
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)

    files_to_move = [
        'scrape_kabutan.py',
        'refine_to_js.py',
        'kabutan_results.json',
        'stock_dashboard.html',
        'final_data.json',
        'prepare_data.py',
        'generate_final_dashboard.py',
        'deep_refine_json.py',
        'final_refine_json.py',
        'K-Navigator_Refined.json',
        'K-Navigator_PRO_Final.json',
        'final_data.json',
        'generate_final_dashboard.py',
        'final_data.json',
        'K-Navigator_PRO_Final.json'
    ]

    for f in files_to_move:
        if os.path.exists(f):
            try:
                shutil.move(f, os.path.join(backup_dir, f))
                print(f"Moved: {f}")
            except Exception as e:
                print(f"Error moving {f}: {e}")

    print("\n大掃除が完了しました。")

if __name__ == '__main__':
    main()
