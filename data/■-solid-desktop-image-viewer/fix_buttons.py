import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# Replace the specific class for CANVAS and THEME buttons
# I will just use a regex to replace the ones within the specific block
# Actually, they are all currently `className="px-3 py-0 text-[10px]"`
# I will replace all of them with `className="w-12 px-0 py-0 text-[10px]"` 

app = app.replace('className="px-3 py-0 text-[10px]"', 'className="w-12 px-0 py-0 text-[10px]"')

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
