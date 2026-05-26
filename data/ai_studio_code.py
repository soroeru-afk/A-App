import json

def categorize_location(item):
    text = (item.get("folderName", "") + " " + item.get("title", "")).lower()

    # 05_海外 名所・絶景
    if any(k in text for k in ["海外", "ハワイ", "グアム", "イングランド", "ロンドン", "ノルウェー", "アイスランド", "fylkesvei", "kleifarvegur", "norway", "iceland", "england", " fv", "fv "]):
        return "05_海外 名所・絶景 / 海外スポット"

    # 01_群馬エリア
    if any(k in text for k in ["群馬", "渋川", "伊香保", "榛名", "赤城", "高山村", "前橋", "高崎", "玉村", "石原", "有馬", "市役所", "マロニエ", "駒形"]):
        if "蔵前橋" in text or "駒形橋" in text:
            pass # 東京エリアへ
        else:
            if any(k in text for k in ["渋川", "マロニエ", "有馬", "熊野", "石原", "市役所"]):
                return "01_群馬エリア / 渋川市街・駅周辺"
            elif any(k in text for k in ["伊香保", "榛名", "赤城", "高山村"]):
                return "01_群馬エリア / 伊香保・榛名・赤城・高山村"
            else:
                return "01_群馬エリア / 前橋・高崎・その他群馬県内"

    # 02_東京エリア（東部）・千葉
    if any(k in text for k in ["錦糸町", "墨田", "両国", "浅草", "上野", "台東", "江東", "江戸川", "葛飾", "千葉", "市川", "浦安", "船橋", "木場", "猿江", "葛西", "水元公園", "三番瀬", "スカイツリー", "北斎", "深川", "富岡", "蔵前橋", "京葉道路", "大横川", "タワービュー", "駒形橋"]):
        if any(k in text for k in ["錦糸町", "両国", "墨田", "北斎", "大横川", "スカイツリー", "タワービュー"]):
            return "02_東京エリア（東部）・千葉 / 錦糸町・両国・墨田区"
        elif any(k in text for k in ["浅草", "上野", "台東", "蔵前橋", "駒形橋"]):
            return "02_東京エリア（東部）・千葉 / 浅草・上野・台東区"
        elif any(k in text for k in ["千葉", "市川", "浦安", "船橋", "湾岸"]):
            return "02_東京エリア（東部）・千葉 / 千葉県"
        else:
            return "02_東京エリア（東部）・千葉 / 江東区・江戸川区・葛飾区"

    # 03_東京エリア（都心・西部）
    if any(k in text for k in ["東京", "千代田", "丸の内", "日本橋", "銀座", "有楽町", "日比谷", "大手町", "汐留", "虎ノ門", "六本木", "渋谷", "原宿", "表参道", "青山", "新宿", "杉並", "世田谷", "池袋", "落合", "桜上水", "下北沢", "浜田山", "西永福", "秋葉原", "神田", "御茶の水", "靖国通り", "四ツ谷", "九段"]):
        if any(k in text for k in ["渋谷", "原宿", "表参道", "青山"]):
            return "03_東京エリア（都心・西部） / 渋谷・原宿・表参道"
        elif any(k in text for k in ["新宿", "杉並", "世田谷", "池袋", "落合", "桜上水", "下北沢", "浜田山", "西永福"]):
            return "03_東京エリア（都心・西部） / 新宿・杉並・その他"
        else:
            return "03_東京エリア（都心・西部） / 丸の内・日本橋・銀座・汐留"

    # 04_国内 名所・絶景・リゾート
    if any(k in text for k in ["別荘", "高級住宅街", "豪邸", "軽井沢", "那須", "富士山", "立山", "上高地", "尾瀬", "礼文島", "渡名喜島", "南島", "絶景", "国立公園", "鯨波", "片瀬漁港", "ワンハンドレッドヒルズ", "新潟", "三条", "見附", "苗場", "湯沢", "信州", "長野", "北海道", "沖縄", "サーフィン", "海岸", "スキー", "スノーパーク"]):
        return "04_国内 名所・絶景・リゾート / 国内リゾート・絶景"

    # 06_ショップ・サロン・企業
    if any(k in text for k in ["企業", "本社", "サロン", "ショップ", "美容室", "hair", "atelier", "クリニック", "事務所", "不動産", "snow peak", "店舗", "エステ"]):
        return "06_ショップ・サロン・企業"

    # デフォルト（もし漏れがあった場合）
    return "00_未分類"

def main():
    input_file = "streetview_locations_2026-05-15.json"
    output_file = "streetview_locations_organized.json"

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for item in data:
        item["folderName"] = categorize_location(item)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"整理が完了しました！ {output_file} をご確認ください。")

if __name__ == "__main__":
    main()