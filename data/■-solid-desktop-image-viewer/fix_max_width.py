import re
with open("src/App.tsx", "r") as f:
    app = f.read()

app = app.replace("setSidebarWidth(Math.max(300, startWidth + delta));", "setSidebarWidth(Math.min(650, Math.max(300, startWidth + delta)));")

with open("src/App.tsx", "w") as f:
    f.write(app)
