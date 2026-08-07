import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_deps = """    imgY,
    isAppFullscreen,
  ]);"""

new_deps = """    imgY,
    isAppFullscreen,
    isPortraitMode,
  ]);"""

app = app.replace(old_deps, new_deps)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("Applied deps fix")
