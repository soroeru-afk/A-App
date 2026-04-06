import urllib.request
import re
import json
import time
import os

def fetch_html(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req, timeout=10) as response:
        return response.read().decode('utf-8')

def extract_kabutan(code):
    url = f"https://kabutan.jp/stock/?code={code}"
    try:
        html = fetch_html(url)
    except Exception as e:
        return {"code": code, "error": str(e)}

    data = {"code": code}
    
    # 銘柄名やコードが書かれているメインタイトル以降のHTMLを取得
    # これにより、ページ上部の指数情報を完全に除外する
    main_content_match = re.search(r'<(h1|h2)[^>]*>.*?' + re.escape(code) + r'.*?</\1>(.*)', html, re.S)
    if main_content_match:
        search_area = main_content_match.group(2)
    else:
        search_area = html

    # 1. 株価 (メインコンテンツ以降から探す)
    price = "不明"
    m1 = re.search(r'kobetu_siha_val\">([\d,\.]+)</span>', search_area)
    if m1: price = m1.group(1)
    
    if price == "不明":
        m2 = re.search(r'id=\"kobetu_price\"[^>]*>([\d,\.]+)<', search_area, re.S)
        if m2: price = m2.group(1)

    if price == "不明":
        m3 = re.search(r'>([\d,]+\.\d+|[\d,]+)</span>\s*円', search_area)
        if not m3: m3 = re.search(r'([\d,]+\.\d+|[\d,]+)円', search_area)
        if m3: price = m3.group(1)

    data['price'] = price

    # 2. 前日比
    change = "不明"
    mc = re.search(r'kobetu_siha_change[^>]*>(.*?)</span>', search_area, re.S)
    if mc:
        change = re.sub(r'<[^>]+>', '', mc.group(1)).strip()
    data['change'] = change

    # 3. 決算日
    me = re.search(r'決算発表予定日.*?(\d{4}/\d{2}/\d{2}|\d{2}/\d{2})', search_area, re.S)
    data['earnings'] = me.group(1) if me else "不明"

    # 4. 乖離率
    ma = re.search(r'25日線乖離率.*?([+－\-]?[\d\.]+)%', search_area, re.S)
    data['25ma_diff'] = ma.group(1) + "%" if ma else "不明"

    # 5. ニュース
    news_matches = re.findall(r'<td class=\"news_title_b\">.*?<a[^>]*>(.*?)</a>', search_area, re.S)
    data['news'] = [re.sub(r'<[^>]+>', '', t).strip() for t in news_matches][:3]

    return data

def main():
    json_path = 'data/kabutan_data_20260406.json'
    if not os.path.exists(json_path): return

    with open(json_path, 'r', encoding='utf-8') as f:
        manus_data = json.load(f)
    
    codes = [s['code'] for g in manus_data['groups'] for s in g['stocks'] if s.get('code')]

    print(f"--- Scraping {len(codes)} stocks (CODE-SCOPED MODE) ---")
    results = {}
    for i, code in enumerate(codes):
        print(f"[{i+1}/{len(codes)}] {code} ...", end="", flush=True)
        res = extract_kabutan(code)
        results[code] = res
        print(f" OK (Price: {res['price']})")
        time.sleep(1.8)
        if (i+1) % 10 == 0: time.sleep(3)
    
    with open('kabutan_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("--- Finished ---")

if __name__ == "__main__":
    main()
