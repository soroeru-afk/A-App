import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# Add cycleTheme function
cycle_theme = """  const cycleTheme = () => {
    const themes: Array<"NAVY" | "BLACK" | "RED" | "LIGHT" | "PAPER"> = ["NAVY", "BLACK", "RED", "LIGHT", "PAPER"];
    setTheme((prev) => themes[(themes.indexOf(prev) + 1) % themes.length]);
  };

  return ("""
app = app.replace("  return (", cycle_theme)

# Update the THEME section in header
old_theme_section = """            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">
              THEME:
            </span>
            <div className="flex gap-1 h-full py-1">
              <SolidButton
                active={theme === "NAVY"}
                onClick={() => setTheme("NAVY")}
                className="w-12 px-0 py-0 text-[10px]"
              >
                NAVY
              </SolidButton>
              <SolidButton
                active={theme === "BLACK"}
                onClick={() => setTheme("BLACK")}
                className="w-12 px-0 py-0 text-[10px]"
              >
                BLACK
              </SolidButton>
              <SolidButton
                active={theme === "RED"}
                onClick={() => setTheme("RED")}
                className="w-12 px-0 py-0 text-[10px]"
              >
                RED
              </SolidButton>
              <SolidButton
                active={theme === "LIGHT"}
                onClick={() => setTheme("LIGHT")}
                className="w-12 px-0 py-0 text-[10px]"
              >
                LIGHT
              </SolidButton>
              <SolidButton
                active={theme === "PAPER"}
                onClick={() => setTheme("PAPER")}
                className="w-12 px-0 py-0 text-[10px]"
              >
                PAPER
              </SolidButton>
            </div>"""

new_theme_section = """            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">
              THEME:
            </span>
            <div className="flex gap-1 h-full py-1">
              <SolidButton
                active={true}
                onClick={cycleTheme}
                className="w-16 px-0 py-0 text-[10px]"
              >
                {theme}
              </SolidButton>
            </div>"""
app = app.replace(old_theme_section, new_theme_section)

# Insert the sliders into the header, right after the theme/font section and before language toggle
# Wait, let's put them before CANVAS or after FONT. Let's put them before CANVAS.
old_canvas_section = """        <div className="flex items-center gap-4 h-full">
          <div className="flex items-center gap-2 h-full mr-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">
              CANVAS:"""

new_canvas_section = """        <div className="flex items-center gap-4 h-full">
          <div className="flex flex-col justify-center w-20 gap-1 h-full mr-1">
            <div className="flex justify-between items-center text-[9px] font-mono leading-none text-text-muted">
              <span>SIZE</span><span className="text-accent">{itemScale}</span>
            </div>
            <input type="range" min="60" max="600" value={itemScale} onChange={(e) => setItemScale(Number(e.target.value))} />
          </div>
          <div className="flex flex-col justify-center w-20 gap-1 h-full mr-3">
            <div className="flex justify-between items-center text-[9px] font-mono leading-none text-text-muted">
              <span>GAP</span><span className="text-accent">{gridGap}</span>
            </div>
            <input type="range" min="0" max="120" value={gridGap} onChange={(e) => setGridGap(Number(e.target.value))} />
          </div>

          <div className="flex items-center gap-2 h-full mr-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">
              CANVAS:"""

app = app.replace(old_canvas_section, new_canvas_section)

# Remove the sliders from the FORMATION ENGINE panel
old_formation_sliders = """            <div className="mt-4 pt-4 border-t border-panel-border flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                  IMAGE SCALE
                </span>
                <span className="text-[10px] font-mono text-accent">
                  {itemScale} PX
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="600"
                value={itemScale}
                onChange={(e) => setItemScale(Number(e.target.value))}
              />
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                  GRID GAP
                </span>
                <span className="text-[10px] font-mono text-accent">
                  {gridGap} PX
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={gridGap}
                onChange={(e) => setGridGap(Number(e.target.value))}
              />
            </div>"""

app = app.replace(old_formation_sliders, "")

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
