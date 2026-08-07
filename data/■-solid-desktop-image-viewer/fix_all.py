import re

with open("src/components/ui.tsx", "r") as f:
    ui = f.read()

old_button = """      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.05 }}
        className={cn("""
new_button = """      <motion.button
        ref={ref}
        className={cn("""
ui = ui.replace(old_button, new_button)

with open("src/components/ui.tsx", "w") as f:
    f.write(ui)

with open("src/App.tsx", "r") as f:
    app = f.read()

old_layout = "layout={false}"
new_layout = 'layout={viewMode === "grid-sq" || viewMode === "grid-ma"}'
app = app.replace(old_layout, new_layout)

old_sliders = """          <div className="flex items-center gap-2 h-full">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">SIZE:</span>
            <div className="w-32 flex items-center">
              <input type="range" min="60" max="600" value={itemScale} onChange={(e) => setItemScale(Number(e.target.value))} />
            </div>
            <span className="text-[10px] font-mono text-text-primary w-8 text-right">{itemScale}</span>
          </div>

          <div className="flex items-center gap-2 h-full">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">GAP:</span>
            <div className="w-32 flex items-center">
              <input type="range" min="0" max="120" value={gridGap} onChange={(e) => setGridGap(Number(e.target.value))} />
            </div>
            <span className="text-[10px] font-mono text-text-primary w-6 text-right">{gridGap}</span>
          </div>"""

new_sliders = """          <div className="flex items-center gap-2 h-full">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">SIZE:</span>
            <div className="w-40 flex items-center">
              <input type="range" min="60" max="600" value={itemScale} onChange={(e) => setItemScale(Number(e.target.value))} />
            </div>
            <span className="text-[10px] font-mono text-text-primary w-8 text-right">{itemScale}</span>
          </div>

          <div className="flex items-center gap-2 h-full">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">GAP:</span>
            <div className="w-40 flex items-center">
              <input type="range" min="0" max="120" value={gridGap} onChange={(e) => setGridGap(Number(e.target.value))} />
            </div>
            <span className="text-[10px] font-mono text-text-primary w-6 text-right">{gridGap}</span>
          </div>"""

app = app.replace(old_sliders, new_sliders)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("done")
