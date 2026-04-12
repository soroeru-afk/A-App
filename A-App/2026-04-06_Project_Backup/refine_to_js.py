import json
import os

def main():
    manus_path = 'data/kabutan_data_20260406.json'
    results_path = 'kabutan_results.json'
    output_path = 'data.js'

    if not os.path.exists(manus_path):
        print(f"Error: {manus_path} not found.")
        return

    with open(manus_path, 'r', encoding='utf-8') as f:
        manus_data = json.load(f)
    
    kabutan = {}
    if os.path.exists(results_path):
        try:
            with open(results_path, 'r', encoding='utf-8') as f:
                kabutan = json.load(f)
        except:
            pass

    final_list = []
    for group in manus_data.get('groups', []):
        for stock in group.get('stocks', []):
            code = stock['code']
            name = stock['name']
            m = stock.get('manusData', {})
            k = kabutan.get(code, {})
            
            conc = m.get('conclusion', '')
            # テンプレ文章のより広範囲な検知
            template_keywords = ['ボリンジャー', '軟調', '堅調', '動きを意識', 'ボックス']
            if any(kw in conc for kw in template_keywords) or not conc:
                if k.get('news'):
                    conc = f"【AI精査】最新材料: {k['news'][0]}。Manusの汎用評価に対し、直近のニュースを反映した見直しを推奨します。"
                else:
                    conc = "【AI精査】目立った材料はありません。テクニカル的な節目での反発を待つ展開です。"
            
            final_list.append({
                "code": code,
                "name": name,
                "judgement": m.get('judgement', 'B'),
                "price": k.get('price', '---'),
                "change": k.get('change', '---'),
                "conclusion": conc,
                "news": k.get('news', []),
                "earnings": k.get('earnings', '---'),
                "ma_diff": k.get('25ma_diff', '---')
            })

    # JavaScriptファイルとして書き出し
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("const STOCK_DATA = " + json.dumps(final_list, ensure_ascii=False, indent=2) + ";")
    
    print(f"Success: {output_path} created with {len(final_list)} stocks.")

if __name__ == '__main__':
    main()
