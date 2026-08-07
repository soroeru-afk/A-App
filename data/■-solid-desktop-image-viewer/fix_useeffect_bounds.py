import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_bounds = """      const currentCW = typeof window !== "undefined" ? window.innerWidth * 0.95 : 1000;
      const currentCH = typeof window !== "undefined" ? window.innerHeight * 0.95 : 1000;"""

new_bounds = """      const currentCW = typeof window !== "undefined" ? (isPortraitMode ? window.innerHeight : window.innerWidth) * (isAppFullscreen ? 1 : 0.95) : 1000;
      const currentCH = typeof window !== "undefined" ? (isPortraitMode ? window.innerWidth : window.innerHeight) * (isAppFullscreen ? 1 : 0.95) : 1000;"""

app = app.replace(old_bounds, new_bounds)

# 依存配列に isPortraitMode を追加
old_dep2 = """  }, [imgDims, isFullscreen, fullscreenScale, fullscreenRotation, imgControls, imgX, imgY]);"""
new_dep2 = """  }, [imgDims, isFullscreen, fullscreenScale, fullscreenRotation, imgControls, imgX, imgY, isPortraitMode, isAppFullscreen]);"""

app = app.replace(old_dep2, new_dep2)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("Applied useEffect bounds fix")
