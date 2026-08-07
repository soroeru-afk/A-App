import re

with open("src/App.tsx", "r") as f:
    app = f.read()

app = app.replace('className="w-24 flex items-center"', 'className="w-32 flex items-center"')

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
