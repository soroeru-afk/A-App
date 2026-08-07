import re

with open("src/App.tsx", "r") as f:
    app = f.read()

target = """            </div>
                  </Panel>"""

replacement = """            </div>
            {/* DROP ZONES */}
            <div className="shrink-0 flex gap-2 pt-2 border-t border-panel-border mt-auto">
              {/* ADD TO ACTIVE DATASET AREA */}
              <div
                className={cn(
                  "flex-1 border border-dashed flex flex-col items-center justify-center transition-all duration-300 py-3 rounded cursor-pointer",
                  dragTarget === "add" ? "border-accent bg-accent/10" : "border-panel-border bg-panel-bg text-text-muted hover:border-text-muted"
                )}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget("add"); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget("add"); e.dataTransfer.dropEffect = "copy"; }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget(null); }}
                onDrop={(e) => {
                   e.preventDefault(); e.stopPropagation();
                   handleFilesDrop(e, false);
                   setDragTarget(null);
                }}
              >
                <FolderPlus size={16} className={dragTarget === "add" ? "text-accent mb-1" : "mb-1"} />
                <span className={cn("text-[9px] tracking-widest text-center leading-tight font-mono", dragTarget === "add" ? "text-text-primary" : "")}>
                  ADD TO<br/>ACTIVE
                </span>
              </div>
              
              {/* CREATE NEW DATASET AREA */}
              <div
                className={cn(
                  "flex-1 border border-dashed flex flex-col items-center justify-center transition-all duration-300 py-3 rounded cursor-pointer",
                  dragTarget === "new" ? "border-accent bg-accent/10" : "border-panel-border bg-panel-bg text-text-muted hover:border-text-muted"
                )}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget("new"); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget("new"); e.dataTransfer.dropEffect = "copy"; }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget(null); }}
                onDrop={(e) => {
                   e.preventDefault(); e.stopPropagation();
                   handleFilesDrop(e, true);
                   setDragTarget(null);
                }}
              >
                <FolderOpen size={16} className={dragTarget === "new" ? "text-accent mb-1" : "mb-1"} />
                <span className={cn("text-[9px] tracking-widest text-center leading-tight font-mono", dragTarget === "new" ? "text-text-primary" : "")}>
                  CREATE<br/>NEW
                </span>
              </div>
            </div>
                  </Panel>"""

app = app.replace(target, replacement)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
