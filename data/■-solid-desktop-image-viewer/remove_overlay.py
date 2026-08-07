import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# Replace the drag overlay with empty string
overlay_pattern = re.compile(r'\{\/\* Drag & Drop Overlay \*\/\}.*?<\/AnimatePresence>', re.DOTALL)
app = overlay_pattern.sub('', app)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
