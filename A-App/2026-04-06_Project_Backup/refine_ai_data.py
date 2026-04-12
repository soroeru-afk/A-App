import json
import os

def refine_data():
    # データの読み込み
    kabutan_path = 'kabutan_results.json'
    manus_path = 'data/kabutan_data_20260406.json'
    
    if not os.path.exists(kabutan_path) or not os.path.exists(manus_path):
        print("Waiting for data files...")
        return

    try:
        with open(kabutan_path, 'r', encoding='utf-8') as f:
            kabutan_data = json.load(f)
        with open(manus_path, 'r', encoding='utf-8') as f:
            manus_json = json.load(f)
    except Exception as e:
        print(f"Error loading files: {e}")
        return

    # 全データの統合と精査
    for group in manus_json.get('groups', []):
        for stock in group.get('stocks', []):
            code = stock['code']
            if code in kabutan_data:
                k = kabutan_data[code]
                # 最新市場データを結合
                stock['price'] = k.get('price')
                stock['change'] = k.get('change')
                stock['earnings'] = k.get('earnings')
                stock['news'] = k.get('news')
                
                manus = stock.get('manusData', {})
                # 使いにくいテンプレ文章を検知し、最新の材料ベースへの書き換え（または補足）
                conclusion = manus.get('conclusion', '')
                if 'ボリンジャー' in conclusion or '軟調' in conclusion or not conclusion:
                    latest_news = k.get('news', [])
                    if latest_news:
                        # Anthropicとしての知見を仮に統合（ニュースから判断材料を抽出）
                        stock['manusData']['conclusion'] = f"【最新材料】{latest_news[0]}。Manusの汎用評価に対し、直近のニュースを反映した見直しを推奨します。"
                    else:
                        stock['manusData']['conclusion'] = "個別材料に乏しく、外部環境（金利・地合い）に左右されやすい状況です。"
                
                stock['manusData'] = manus

    # 精査済みデータとして保存（ダッシュボードはこれを読み込むように後で修正します）
    with open('refined_results.json', 'w', encoding='utf-8') as f:
        json.dump(manus_json, f, ensure_ascii=False, indent=2)
    print("Refinement complete. Results saved to refined_results.json")

if __name__ == "__main__":
    refine_data()
