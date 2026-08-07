with open("src/App.tsx", "r") as f:
    app = f.read()

app = app.replace('className="fixed inset-0 z-[60]', 'className="fixed inset-0 z-[110]')

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
