import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# 1. Update getDragBounds
old_bounds = """        const cw = window.innerWidth * (isAppFullscreen ? 1 : 0.95);
        const ch = window.innerHeight * (isAppFullscreen ? 1 : 0.95);"""

new_bounds = """        const cw = (isPortraitMode ? window.innerHeight : window.innerWidth) * (isAppFullscreen ? 1 : 0.95);
        const ch = (isPortraitMode ? window.innerWidth : window.innerHeight) * (isAppFullscreen ? 1 : 0.95);"""

app = app.replace(old_bounds, new_bounds)

# 2. Update cW and cH
old_c = """  const cW = typeof window !== "undefined" ? window.innerWidth * (isAppFullscreen ? 1 : 0.95) : 1000;
  const cH = typeof window !== "undefined" ? window.innerHeight * (isAppFullscreen ? 1 : 0.95) : 1000;"""

new_c = """  const cW = typeof window !== "undefined" ? (isPortraitMode ? window.innerHeight : window.innerWidth) * (isAppFullscreen ? 1 : 0.95) : 1000;
  const cH = typeof window !== "undefined" ? (isPortraitMode ? window.innerWidth : window.innerHeight) * (isAppFullscreen ? 1 : 0.95) : 1000;"""

app = app.replace(old_c, new_c)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("Applied portrait bounds fixes")
