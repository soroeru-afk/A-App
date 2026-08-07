import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add appFont state
if "const [appFont, setAppFont]" not in content:
    content = content.replace(
        'const [theme, setTheme] = useState<"NAVY" | "LIGHT" | "PAPER" | "BLACK" | "RED">("NAVY");',
        'const [theme, setTheme] = useState<"NAVY" | "LIGHT" | "PAPER" | "BLACK" | "RED">("NAVY");\n  const [appFont, setAppFont] = useState<"GOTHIC" | "MARU" | "MEIRYO" | "MONO">("GOTHIC");\n\n  useEffect(() => {\n    document.documentElement.setAttribute("data-font", appFont);\n  }, [appFont]);'
    )

# Add font selector UI to the header
font_ui = """            <div className="w-px h-6 bg-panel-border mx-2" />
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
            </div>"""

theme_ui_end = """              </SolidButton>
            </div>
          </div>
        </div>
      </div>"""

if "FONT:" not in content:
    content = content.replace(theme_ui_end, """              </SolidButton>
            </div>\n""" + font_ui + """
          </div>
        </div>
      </div>""")

# Also need to add tabular-nums to numbers?
# The user said: （レイアウト崩れを防ぐための等幅数字設定のみ保持しています）
# K-Navigator used tabular-nums on numbers.
# I will just replace `font-mono text-[10px]` with `font-mono tabular-nums text-[10px]` on specific parts, but actually since `font-mono` is everywhere, I'll just add `tabular-nums` globally to `body` in index.css! It's much simpler.

with open("src/App.tsx", "w") as f:
    f.write(content)

with open("src/index.css", "r") as f:
    css = f.read()
    if "tabular-nums" not in css:
        css = css.replace("body {\n  background-color: var(--color-root-bg);\n  color: var(--color-text-primary);\n  font-family: var(--font-sans);\n  overflow-x: hidden;\n}", "body {\n  background-color: var(--color-root-bg);\n  color: var(--color-text-primary);\n  font-family: var(--font-sans);\n  overflow-x: hidden;\n  font-variant-numeric: tabular-nums;\n}")
with open("src/index.css", "w") as f:
    f.write(css)

