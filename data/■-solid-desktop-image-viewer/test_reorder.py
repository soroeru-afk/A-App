import re
with open("src/App.tsx", "r") as f:
    app = f.read()

print("Reorder.Item" in app)
