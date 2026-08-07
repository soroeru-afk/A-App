import re

with open("src/App.tsx", "r") as f:
    app = f.read()

font_ui_old = """            <div className="flex gap-1 h-full py-1">
              <SolidButton
                active={appFont === "GOTHIC"}
                onClick={() => setAppFont("GOTHIC")}
                className="px-3 py-0 text-[10px]"
              >
                GOTHIC
              </SolidButton>
              <SolidButton
                active={appFont === "MARU"}
                onClick={() => setAppFont("MARU")}
                className="px-3 py-0 text-[10px]"
              >
                MARU
              </SolidButton>
              <SolidButton
                active={appFont === "MEIRYO"}
                onClick={() => setAppFont("MEIRYO")}
                className="px-3 py-0 text-[10px]"
              >
                MEIRYO
              </SolidButton>
              <SolidButton
                active={appFont === "MONO"}
                onClick={() => setAppFont("MONO")}
                className="px-3 py-0 text-[10px]"
              >
                MONO
              </SolidButton>
            </div>"""

font_ui_new = """            <select
              value={appFont}
              onChange={(e) => setAppFont(e.target.value as any)}
              className="bg-transparent outline-none text-[10px] uppercase font-mono tracking-wider text-text-primary cursor-pointer border py-0.5 px-1 border-panel-border rounded"
            >
              <option value="GOTHIC" className="bg-root-bg text-text-primary">GOTHIC</option>
              <option value="MARU" className="bg-root-bg text-text-primary">MARU</option>
              <option value="MEIRYO" className="bg-root-bg text-text-primary">MEIRYO</option>
              <option value="MONO" className="bg-root-bg text-text-primary">MONO</option>
            </select>"""

if font_ui_old in app:
    app = app.replace(font_ui_old, font_ui_new)
    with open("src/App.tsx", "w") as f:
        f.write(app)
    print("Replaced successfully.")
else:
    print("Not found.")

