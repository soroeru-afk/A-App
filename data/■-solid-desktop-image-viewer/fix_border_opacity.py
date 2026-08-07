import re

with open("src/App.tsx", "r") as f:
    app = f.read()

app = app.replace("border-text-muted/50", "border-text-muted")

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
