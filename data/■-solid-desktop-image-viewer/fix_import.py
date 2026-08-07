import re

with open("src/App.tsx", "r") as f:
    app = f.read()

app = app.replace("}  Palette,\n} from \"lucide-react\";", "  Palette,\n} from \"lucide-react\";")

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
