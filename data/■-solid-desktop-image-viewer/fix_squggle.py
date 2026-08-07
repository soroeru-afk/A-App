import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_reorder = """                      <Reorder.Item
                        key={ds.id}
                        value={ds}"""

new_reorder = """                      <Reorder.Item
                        key={ds.id}
                        value={ds}
                        layout="position"
                        style={{ width: "100%" }}"""

if old_reorder in app:
    app = app.replace(old_reorder, new_reorder)
    print("Replaced Reorder.Item successfully")
else:
    print("Could not find Reorder.Item block")

with open("src/App.tsx", "w") as f:
    f.write(app)

