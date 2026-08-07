import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_keydown = """        } else if (key === "ArrowUp") {
          e.preventDefault();
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ top: -40, behavior: "auto" });
          }
        } else if (key === "ArrowDown") {
          e.preventDefault();
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ top: 40, behavior: "auto" });
          }
        } else if (key === "Enter") {"""

new_keydown = """        } else if (key === "Enter") {"""

app = app.replace(old_keydown, new_keydown)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
