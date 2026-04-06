import json
import os

def main():
    data_path = 'final_data.json'
    if not os.path.exists(data_path):
         print("Error: final_data.json not found")
         return

    with open(data_path, 'r', encoding='utf-8') as f:
        stocks = json.load(f)

    # HTMLのテンプレート
    html_template = """<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>K-Navigator Pro - AI Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root { --bg: #0b0c10; --card: rgba(31, 40, 51, 0.8); --accent: #66fcf1; --pos: #4cd137; --neg: #e84118; }
        body { background: var(--bg); color: #c5c6c7; font-family: 'Inter', 'Noto Sans JP', sans-serif; margin: 0; padding: 20px; min-height: 100vh; }
        .container { max-width: 1400px; margin: 0 auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-top: 30px; }
        .card { background: var(--card); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 12px; padding: 20px; transition: 0.3s; position: relative; }
        .card:hover { transform: translateY(-5px); border-color: var(--accent); box-shadow: 0 10px 30px rgba(102, 252, 241, 0.1); }
        .badge { padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; position: absolute; top: 20px; right: 20px; }
        .S { background: #ffd700; color: #000; box-shadow: 0 0 10px rgba(255,215,0,0.3); }
        .A { background: #ff4757; color: #fff; }
        .B { background: #2f3542; color: #fff; }
        .price { font-size: 1.8rem; font-weight: 700; color: #fff; margin: 15px 0 5px; }
        .comment { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; font-size: 0.85rem; margin-top: 15px; border-left: 3px solid var(--accent); color: #ecf0f1; line-height: 1.5; }
        h1 { background: linear-gradient(90deg, #66fcf1, #45a29e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <header style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(102, 252, 241, 0.1); padding-bottom:20px;">
            <div>
                <h1>K-Navigator <span style="color:var(--accent)">PRO</span></h1>
                <p style="font-size:0.75rem; color:#8c92ac; margin-top:5px;">AI Enhanced Market Insights (Embedded Edition)</p>
            </div>
            <div style="text-align:right; font-size:0.75rem; color:#8c92ac;">
                Updated: 2026-04-06<br>
                Source: Kabutan & AI Refined
            </div>
        </header>
        <div class="grid" id="grid"></div>
    </div>
    <script>
        const data = REPLACE_DATA;
        const grid = document.getElementById('grid');
        grid.innerHTML = data.map(s => {
            const j = s.judgement || 'B';
            const priceDisplay = (s.price === '---' || !s.price || s.price === '不明') ? '---' : '¥' + s.price;
            return `
            <div class="card">
                <span class="badge ${j}">${j}判定</span>
                <div style="color:var(--accent); font-size:0.8rem; font-weight:bold; letter-spacing:1px;">${s.code}</div>
                <div style="font-weight:bold; color:#fff; font-size:1.2rem; margin-top:2px;">${s.name}</div>
                <div class="price">${priceDisplay}</div>
                <div style="color:${(s.change.includes('－') || s.change.includes('-')) ? 'var(--neg)' : 'var(--pos)'}; font-size:0.9rem; font-weight:bold;">${s.change === '不明' ? '' : s.change}</div>
                <div class="comment">${s.conclusion}</div>
                <div style="margin-top:15px; font-size:0.7rem; color:#8c92ac;">
                    決算日: ${s.earnings || '---'} | 25日乖離: ${s.ma_diff || '---'}
                </div>
            </div>
        `}).join('');
    </script>
</body>
</html>"""

    final_html = html_template.replace('REPLACE_DATA', json.dumps(stocks, ensure_ascii=False))
    
    with open('stock_dashboard.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    
    print("Success: stock_dashboard.html has been generated with embedded data.")

if __name__ == '__main__':
    main()
