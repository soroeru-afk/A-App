import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# 1. Add Palette to lucide-react import
app = re.sub(r'from "lucide-react";', r'  Palette,\n} from "lucide-react";', app)

# 2. Rewrite header
old_header_start = """        <div className="flex items-center gap-4 h-full">
          <div className="flex flex-col justify-center w-20 gap-1 h-full mr-1">"""

old_header_end = """            <div className="w-px h-6 bg-panel-border mx-2" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">"""

# Let's find the exact block to replace.
header_match = re.search(r'(<div className="flex items-center gap-4 h-full">.*?)<div className="flex bg-root-bg rounded border border-panel-border overflow-hidden text-\[10px\] font-mono leading-none h-6 hidden sm:flex">', app, re.DOTALL)

if header_match:
    old_block = header_match.group(1)
    
    new_block = """<div className="flex items-center gap-4 h-full mr-4">
          <div className="flex items-center gap-2 h-full">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">SIZE:</span>
            <div className="w-24 flex items-center">
              <input type="range" min="60" max="600" value={itemScale} onChange={(e) => setItemScale(Number(e.target.value))} />
            </div>
            <span className="text-[10px] font-mono text-text-primary w-8 text-right">{itemScale}</span>
          </div>

          <div className="flex items-center gap-2 h-full">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">GAP:</span>
            <div className="w-24 flex items-center">
              <input type="range" min="0" max="120" value={gridGap} onChange={(e) => setGridGap(Number(e.target.value))} />
            </div>
            <span className="text-[10px] font-mono text-text-primary w-6 text-right">{gridGap}</span>
          </div>

          <div className="flex items-center gap-2 h-full">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">
              CANVAS:
            </span>
            <div className="flex gap-1 h-full py-2 items-center">
              <SolidButton active={canvasBg === "theme"} onClick={() => setCanvasBg("theme")} className="w-10 h-6 px-0 py-0 text-[10px]">AUTO</SolidButton>
              <SolidButton active={canvasBg === "black"} onClick={() => setCanvasBg("black")} className="w-10 h-6 px-0 py-0 text-[10px]">BLK</SolidButton>
              <SolidButton active={canvasBg === "white"} onClick={() => setCanvasBg("white")} className="w-10 h-6 px-0 py-0 text-[10px]">WHT</SolidButton>
              <SolidButton active={canvasBg === "checker"} onClick={() => setCanvasBg("checker")} className="w-10 h-6 px-0 py-0 text-[10px]">CHK</SolidButton>
            </div>
          </div>

          <div className="flex items-center gap-2 h-full">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">
              FONT:
            </span>
            <select
              value={appFont}
              onChange={(e) => setAppFont(e.target.value as any)}
              className="bg-panel-bg outline-none text-[10px] uppercase font-mono tracking-wider text-text-primary cursor-pointer border h-6 px-2 border-panel-border rounded"
            >
              <option value="GOTHIC">GOTHIC</option>
              <option value="MARU">MARU</option>
              <option value="MEIRYO">MEIRYO</option>
              <option value="MONO">MONO</option>
            </select>
          </div>

          <div className="flex items-center h-full">
            <SolidButton
              active={true}
              onClick={cycleTheme}
              className="h-6 px-3 py-0 text-[10px] flex items-center gap-2"
            >
              <Palette size={12} /> THEME: {theme}
            </SolidButton>
          </div>

          <div className="w-px h-6 bg-panel-border mx-1" />

          """
    app = app.replace(old_block, new_block)
else:
    print("Could not find header block")

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
