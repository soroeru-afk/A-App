import re

with open("src/App.tsx", "r") as f:
    app = f.read()

app = app.replace('layout={false}', 'layout={viewMode === "grid-sq" || viewMode === "grid-ma"}')

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
