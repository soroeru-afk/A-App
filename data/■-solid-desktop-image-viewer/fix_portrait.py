import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# 1. Stateの変更
old_state = "  const [isPortraitMode, setIsPortraitMode] = useState(false);"
new_state = """  const [portraitMode, setPortraitMode] = useState<"off" | "left" | "right">("off");
  const isPortraitMode = portraitMode !== "off";"""
app = app.replace(old_state, new_state)

# 2. handleKeyDownの変更
old_keydown = """      let isNext = key === "ArrowRight";
      let isPrev = key === "ArrowLeft";
      let isPanRight = code === "Numpad6" || key === "6";
      let isPanLeft = code === "Numpad4" || key === "4";
      let isPanUp = key === "ArrowUp" || code === "Numpad8" || key === "8";
      let isPanDown = key === "ArrowDown" || code === "Numpad2" || key === "2";

      if (isPortraitMode) {
        // Map logical keys to physical portrait directions
        isNext = key === "ArrowDown";
        isPrev = key === "ArrowUp";
        isPanRight = key === "ArrowDown" || code === "Numpad2" || key === "2";
        isPanLeft = key === "ArrowUp" || code === "Numpad8" || key === "8";
        isPanUp = key === "ArrowLeft" || code === "Numpad4" || key === "4";
        isPanDown = key === "ArrowRight" || code === "Numpad6" || key === "6";
      }

      if (isNext && fullscreenScale <= 1) {
        e.preventDefault();
        goToNextImage();
      } else if (isPrev && fullscreenScale <= 1) {
        e.preventDefault();
        goToPrevImage();
      } else if (isPanRight) {
        e.preventDefault();
        isPortraitMode ? panY(20) : panX(-20);
      } else if (isPanLeft) {
        e.preventDefault();
        isPortraitMode ? panY(-20) : panX(20);
      } else if (isPanUp) {
        e.preventDefault();
        isPortraitMode ? panX(20) : panY(20);
      } else if (isPanDown) {
        e.preventDefault();
        isPortraitMode ? panX(-20) : panY(-20);
      }"""

new_keydown = """      let isNext = key === "ArrowRight";
      let isPrev = key === "ArrowLeft";
      let isPanRight = code === "Numpad6" || key === "6";
      let isPanLeft = code === "Numpad4" || key === "4";
      let isPanUp = key === "ArrowUp" || code === "Numpad8" || key === "8";
      let isPanDown = key === "ArrowDown" || code === "Numpad2" || key === "2";

      if (portraitMode === "left") {
        isPanRight = key === "ArrowDown" || code === "Numpad2" || key === "2";
        isPanLeft = key === "ArrowUp" || code === "Numpad8" || key === "8";
        isPanUp = code === "Numpad4" || key === "4";
        isPanDown = code === "Numpad6" || key === "6";
      } else if (portraitMode === "right") {
        isPanRight = key === "ArrowUp" || code === "Numpad8" || key === "8";
        isPanLeft = key === "ArrowDown" || code === "Numpad2" || key === "2";
        isPanUp = code === "Numpad6" || key === "6";
        isPanDown = code === "Numpad4" || key === "4";
      }

      if (isNext) {
        e.preventDefault();
        goToNextImage();
      } else if (isPrev) {
        e.preventDefault();
        goToPrevImage();
      } else if (isPanRight) {
        e.preventDefault();
        if (portraitMode === "left") panY(20);
        else if (portraitMode === "right") panY(-20);
        else panX(-20);
      } else if (isPanLeft) {
        e.preventDefault();
        if (portraitMode === "left") panY(-20);
        else if (portraitMode === "right") panY(20);
        else panX(20);
      } else if (isPanUp) {
        e.preventDefault();
        if (portraitMode === "left") panX(20);
        else if (portraitMode === "right") panX(-20);
        else panY(20);
      } else if (isPanDown) {
        e.preventDefault();
        if (portraitMode === "left") panX(-20);
        else if (portraitMode === "right") panX(20);
        else panY(-20);
      }"""
app = app.replace(old_keydown, new_keydown)

# 3. Modal への transform 適用
old_transform = """              style={
                isPortraitMode
                  ? {
                      width: isAppFullscreen ? "100vh" : "95vh",
                      height: isAppFullscreen ? "100vw" : "95vw",
                      transform: "rotate(-90deg)",
                    }
                  : {"""

new_transform = """              style={
                isPortraitMode
                  ? {
                      width: isAppFullscreen ? "100vh" : "95vh",
                      height: isAppFullscreen ? "100vw" : "95vw",
                      transform: portraitMode === "left" ? "rotate(-90deg)" : "rotate(90deg)",
                    }
                  : {"""
app = app.replace(old_transform, new_transform)

# 4. ボタンのスタイル変更
old_buttons = """              {/* Portrait Mode Toggle Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsPortraitMode(!isPortraitMode); }}
                className={cn(
                  "absolute top-6 right-[136px] p-2 transition-colors drop-shadow-md hover:scale-110 outline-none focus:outline-none",
                  isFullscreenDarkText
                    ? (isPortraitMode ? "text-black" : "text-black/50 hover:text-black")
                    : (isPortraitMode ? "text-white" : "text-white/50 hover:text-white"),
                )}
                title="TOGGLE PORTRAIT MODE"
              >
                <MonitorSmartphone size={28} />
              </button>

              {/* Borderless Toggle Button */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleAppFullscreen(); }}
                className={cn(
                  "absolute top-6 right-20 p-2 transition-colors drop-shadow-md hover:scale-110 outline-none focus:outline-none",
                  isFullscreenDarkText
                    ? "text-black/50 hover:text-black"
                    : "text-white/50 hover:text-white",
                )}
                title="TOGGLE BORDERLESS"
              >
                {isAppFullscreen ? <Minimize size={28} /> : <Maximize size={28} />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className={cn(
                  "absolute top-6 right-6 p-2 transition-colors drop-shadow-md hover:scale-110 outline-none focus:outline-none",
                  isFullscreenDarkText
                    ? "text-black/50 hover:text-black"
                    : "text-white/50 hover:text-white",
                )}
              >
                <X size={32} />
              </button>"""

new_buttons = """              {/* Portrait Mode Toggle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (portraitMode === "off") setPortraitMode("left");
                  else if (portraitMode === "left") setPortraitMode("right");
                  else setPortraitMode("off");
                }}
                className={cn(
                  "absolute top-6 right-[136px] w-12 h-12 flex items-center justify-center rounded-full transition-all hover:scale-110 outline-none focus:outline-none backdrop-blur-sm border shadow-sm",
                  isFullscreenDarkText
                    ? "bg-white/20 border-black/10 text-black/70 hover:text-black hover:bg-white/40"
                    : "bg-black/20 border-white/10 text-white/70 hover:text-white hover:bg-black/40",
                  portraitMode !== "off" && (isFullscreenDarkText ? "bg-white/50 text-black border-black/20" : "bg-black/50 text-white border-white/20")
                )}
                title="TOGGLE PORTRAIT MODE"
              >
                <MonitorSmartphone size={24} className={cn("transition-transform duration-300", portraitMode === "left" ? "-rotate-90" : portraitMode === "right" ? "rotate-90" : "")} />
              </button>

              {/* Borderless Toggle Button */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleAppFullscreen(); }}
                className={cn(
                  "absolute top-6 right-[76px] w-12 h-12 flex items-center justify-center rounded-full transition-all hover:scale-110 outline-none focus:outline-none backdrop-blur-sm border shadow-sm",
                  isFullscreenDarkText
                    ? "bg-white/20 border-black/10 text-black/70 hover:text-black hover:bg-white/40"
                    : "bg-black/20 border-white/10 text-white/70 hover:text-white hover:bg-black/40",
                  isAppFullscreen && (isFullscreenDarkText ? "bg-white/50 text-black border-black/20" : "bg-black/50 text-white border-white/20")
                )}
                title="TOGGLE BORDERLESS"
              >
                {isAppFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>

              {/* Close Button */}
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

app = app.replace(old_buttons, new_buttons)

# 依存配列 isPortraitMode を portraitMode に修正 (2箇所)
app = app.replace("isPortraitMode, isAppFullscreen]);", "portraitMode, isAppFullscreen]);")
app = app.replace("    isPortraitMode,\n  ]);", "    portraitMode,\n  ]);")

with open("src/App.tsx", "w") as f:
    f.write(app)

print("Applied fixes")
