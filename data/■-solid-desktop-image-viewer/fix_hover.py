with open("src/App.tsx", "r") as f:
    app = f.read()

target = """      whileHover={{
        scale: viewMode !== "free" ? 1.01 : 1.02,
      }}"""

replacement = """      whileHover={
        viewMode === "free" ? { scale: 1.02 } : {}
      }"""

if target in app:
    app = app.replace(target, replacement)
    with open("src/App.tsx", "w") as f:
        f.write(app)
    print("Replaced successfully.")
else:
    print("Target not found.")

