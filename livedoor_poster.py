from playwright.sync_api import sync_playwright
import time
import os

def main():
    user_data_dir = os.path.join(os.getcwd(), "blog_browser_profile")
    
    # 投稿する内容
    title_text = "■ SOLID LOGO & TYPOGRAPHY CREATOR"
    body_text = "プロフェッショナルな3Dタイポグラフィスタジオ。テキストを入力し、アルゴリズム効果（ボクセル、ネオン、サイバーなど）を選択して、編集済みロゴを生成できます。"

    print("Starting Livedoor Blog Auto-Poster...")
    with sync_playwright() as p:
        # 可視モードで起動（ログイン状態保持）
        context = p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=False
        )
        
        page = context.pages[0] if context.pages else context.new_page()
        
        print("Navigating to Livedoor CMS...")
        page.goto("https://livedoor.blogcms.jp/")
        
        print("--------------------------------------------------")
        print("ブラウザが立ち上がりました！")
        print("※もしログイン画面が出た場合は、ログインをお願いします。")
        print("そのまま「記事を書く」画面（新規作成画面）まで進んでください。")
        print("システムが画面を検知するまで待機しています...")
        print("--------------------------------------------------")
        
        # 記事作成画面に到達するまで待機（URLに 'article/edit' が含まれるかチェック）
        try:
            page.wait_for_url("**/article/edit**", timeout=0)  # 無限待機
            print("記事作成画面を検知しました！自動入力を開始します。")
            
            # 念のためページが完全に読み込まれるのを待つ
            page.wait_for_load_state("networkidle")
            time.sleep(2)
            
            # タイトルの入力（タイトル入力欄の一般的なname属性）
            if page.locator("input[name='title']").is_visible():
                page.locator("input[name='title']").fill(title_text)
                print("タイトルを入力しました。")
            
            # 本文の入力
            # ライブドアブログの「見たままモード」はiframe（TinyMCE等）を利用していることが多いため、
            # 最も確実な「キーボード操作での流し込み」または「iframeの特定」を行います。
            
            # iframe（エディタ本体）を探す
            frames = page.frames
            editor_frame = None
            for frame in frames:
                if frame.name == "body_ifr" or "editor" in frame.url or "wysiwyg" in frame.name.lower():
                    editor_frame = frame
                    break
            
            # 確実にiframeが見つからない場合のフォールバック（HTMLタブを探してクリックする）
            html_tab = page.locator("text='HTMLタグ編集'")
            if html_tab.is_visible():
                html_tab.click()
                time.sleep(1)
                page.locator("textarea[name='body']").fill(body_text)
                print("HTMLタグ編集モードに切り替えて本文を入力しました。")
            else:
                # 見たままモードのiframeが見つかった場合
                if editor_frame:
                    editor_frame.locator("body").fill(body_text)
                    print("見たままモードで本文を入力しました。")
                else:
                    print("エディタ欄が見つからなかったため、手動で本文エリアをクリックしてください。3秒後に入力します。")
                    time.sleep(3)
                    page.keyboard.type(body_text)

            print("==================================================")
            print("自動入力が完了しました！内容を確認し、問題なければ下書き保存してください。")
            print("※ブラウザはこのまま開いておきます。終了する場合は手動で閉じてください。")
            print("==================================================")
            
            # ブラウザを開いたままにする
            page.wait_for_event("close", timeout=0)
            
        except Exception as e:
            print(f"エラーが発生しました: {e}")

if __name__ == "__main__":
    main()
