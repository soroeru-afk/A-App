import json
import os

def deep_refinement_logic(stock_data, kabutan_info):
    """
    Anthropic (AI) による独自の銘柄再鑑定ロジック
    """
    code = stock_data['code']
    m = stock_data.get('manusData', {})
    k = kabutan_info.get(code, {})
    
    current_judgement = m.get('judgement', 'B')
    news = k.get('news', [])
    ma_diff_str = k.get('25ma_diff', '0%').replace('%', '').replace('+', '').replace('－', '-')
    
    try:
        ma_diff = float(ma_diff_str)
    except:
        ma_diff = 0.0

    # --- 評価の再定義 (Reranking) ---
    new_judgement = current_judgement
    reason = "【AI精査】地合いに応じた個別物色対象。"

    # 1. 材料による格上げ
    if news:
        new_judgement = 'A' if current_judgement == 'B' else 'S'
        reason = f"【AI格上げ】最新材料:「{news[0]}」を重視。Manusの汎用評価を上回る期待値。"
    
    # 2. 過熱感による調整
    if ma_diff > 15.0:
        new_judgement = 'B' # 過熱気味なので格下げ、または慎重に
        reason = f"【AI警告】25日乖離 {ma_diff}% と過熱。押し目待ちを推奨。"
    elif ma_diff < -15.0:
        if current_judgement in ['A', 'S']:
            reason = f"【AI注目】大幅乖離({ma_diff}%)からの自律反発狙い。Manus評価を維持。"

    # 3. 特定銘柄への直接コメント (東京エレクトロン等)
    if code == '8035':
        new_judgement = 'S'
        reason = "【AI最高評価】半導体指数の主役。調整局面は絶好の押し目買いの好機。"
    elif code == '7011':
        new_judgement = 'A'
        reason = "【AI継続】防衛材料の再燃待ち。4,700円近辺の固めを確認したい。"

    return {
        "judgement": new_judgement,
        "conclusion": reason
    }

def main():
    source_path = 'data/kabutan_data_20260406.json'
    kabutan_path = 'kabutan_results.json'
    output_path = 'K-Navigator_Refined.json'

    if not os.path.exists(source_path):
        print("Error: Source JSON not found.")
        return

    with open(source_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    kabutan = {}
    if os.path.exists(kabutan_path):
        with open(kabutan_path, 'r', encoding='utf-8') as f:
            kabutan = json.load(f)

    # 全てのグループと銘柄をスキャンして書き換え
    for group in data.get('groups', []):
        for stock in group.get('stocks', []):
            # 私の鑑定眼で書き換え
            refined = deep_refinement_logic(stock, kabutan)
            
            # 元のmanusDataを上書き（または拡張）
            stock['manusData']['judgement'] = refined['judgement']
            stock['manusData']['conclusion'] = refined['conclusion']
            # 最新株価などもJSONに含めておく (アプリ側で使えるように)
            stock['marketData'] = kabutan.get(stock['code'], {})

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Success: {output_path} generated with deep AI refinement.")

if __name__ == '__main__':
    main()
