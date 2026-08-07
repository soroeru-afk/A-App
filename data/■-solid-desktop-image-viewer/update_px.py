import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_sliders = """          <div className="flex items-center gap-2 h-full">
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

new_sliders = """          <div className="flex items-center gap-2 h-full">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">SIZE:</span>
            <div className="w-40 flex items-center">
              <input type="range" min="60" max="600" value={itemScale} onChange={(e) => setItemScale(Number(e.target.value))} />
            </div>
            <span className="text-[10px] font-mono text-text-primary w-10 text-right">{itemScale}px</span>
          </div>

          <div className="flex items-center gap-2 h-full">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">GAP:</span>
            <div className="w-40 flex items-center">
              <input type="range" min="0" max="120" value={gridGap} onChange={(e) => setGridGap(Number(e.target.value))} />
            </div>
            <span className="text-[10px] font-mono text-text-primary w-10 text-right">{gridGap}px</span>
          </div>"""

app = app.replace(old_sliders, new_sliders)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("done")
