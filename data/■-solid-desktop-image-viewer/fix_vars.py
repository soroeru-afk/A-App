import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_vars = """      };

      const key = e.key;
      const code = e.code;
      
      let isNext = key === "ArrowRight";"""

new_vars = """      };

      let isNext = key === "ArrowRight";"""

app = app.replace(old_vars, new_vars)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
