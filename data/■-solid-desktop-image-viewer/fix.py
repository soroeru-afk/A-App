import re

with open("src/index.css", "r") as f:
    css = f.read()

# Fix the missing opening root for colors
if "  :root {\n    --bg-app: #06090e;" not in css:
    css = css.replace('monospace;\n  }\n    --bg-app: #06090e;', 'monospace;\n  }\n  :root {\n    --bg-app: #06090e;')

with open("src/index.css", "w") as f:
    f.write(css)

with open("src/App.tsx", "r") as f:
    app = f.read()

# Fix App.tsx missing FONT selector
theme_ui_end = """              </SolidButton>
              <SolidButton
                active={theme === "PAPER"}
                onClick={() => setTheme("PAPER")}
                className="px-3 py-0 text-[10px]"
              >
                PAPER
              </SolidButton>
            </div>
          </div>
        </div>
      </div>"""

font_ui = """              </SolidButton>
            </div>
            <div className="w-px h-6 bg-panel-border mx-2" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">
              FONT:
            </span>
            <div className="flex gap-1 h-full py-1">
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
            </div>
          </div>
        </div>
      </div>"""

if "FONT:" not in app:
    app = app.replace(theme_ui_end, font_ui)

with open("src/App.tsx", "w") as f:
    f.write(app)

