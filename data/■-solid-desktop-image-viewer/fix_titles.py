import re

with open("src/App.tsx", "r") as f:
    app = f.read()

app = app.replace('title="Flip Horizontal"', 'title={t("Flip Horizontal (H)", "左右反転 (H)")}')
app = app.replace('title="Rotate 90°"', 'title={t("Rotate 90° (R)", "90度回転 (R)")}')
app = app.replace('title="TOGGLE PORTRAIT MODE"', 'title={t("Portrait Mode (P)", "ポートレート切替 (P)")}')
app = app.replace('title="TOGGLE BORDERLESS"', 'title={t("Borderless (F)", "ボーダレス (F)")}')

# 閉じるボタンのtitle追加
old_close = """              {/* Close Button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className={cn(
                  "absolute top-6 right-4 w-12 h-12 flex items-center justify-center rounded-full transition-all hover:scale-110 outline-none focus:outline-none backdrop-blur-sm border shadow-sm",
                  isFullscreenDarkText
                    ? "bg-white/20 border-black/10 text-black/70 hover:text-black hover:bg-white/40"
                    : "bg-black/20 border-white/10 text-white/70 hover:text-white hover:bg-black/40"
                )}
              >
                <X size={26} />
              </button>"""

new_close = """              {/* Close Button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className={cn(
                  "absolute top-6 right-4 w-12 h-12 flex items-center justify-center rounded-full transition-all hover:scale-110 outline-none focus:outline-none backdrop-blur-sm border shadow-sm",
                  isFullscreenDarkText
                    ? "bg-white/20 border-black/10 text-black/70 hover:text-black hover:bg-white/40"
                    : "bg-black/20 border-white/10 text-white/70 hover:text-white hover:bg-black/40"
                )}
                title={t("Close (Esc)", "閉じる (Esc)")}
              >
                <X size={26} />
              </button>"""

app = app.replace(old_close, new_close)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("titles fixed")
