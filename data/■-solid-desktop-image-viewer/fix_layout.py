import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_layout = 'layout={viewMode === "grid-sq" || viewMode === "grid-ma"}'
new_layout = 'layout={false}'

app = app.replace(old_layout, new_layout)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
