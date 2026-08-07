import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# I need to fix the area from <Trash2 size={14} /> down to the DROP ZONES

bad_section = """                          title="DELETE DATASET"
                          className="hover:text-red-500"
                        >
                 {/* DROP ZONES */}
            <div className="shrink-0 flex gap-2 pt-2 border-t border-panel-border mt-auto">
              {/* ADD TO ACTIVE DATASET AREA */}
              <div
                className={cn(
                  "flex-1 border border-dashed flex flex-col items-center justify-center transition-all duration-300 py-3 rounded cursor-pointer",
                  dragTarget === "add" ? "border-accent bg-accent/10" : "border-text-muted/50 bg-panel-bg text-text-muted hover:border-text-secondary hover:text-text-secondary"
                )}"""

good_section = """                          title="DELETE DATASET"
                          className="hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* DROP ZONES */}
            <div className="shrink-0 flex gap-2 pt-2 border-t border-panel-border mt-auto">
              {/* ADD TO ACTIVE DATASET AREA */}
              <div
                className={cn(
                  "flex-1 border border-dashed flex flex-col items-center justify-center transition-all duration-300 py-3 rounded cursor-pointer",
                  dragTarget === "add" ? "border-accent bg-accent/10" : "border-text-muted/50 bg-panel-bg text-text-muted hover:border-text-secondary hover:text-text-secondary"
                )}"""

app = app.replace(bad_section, good_section)

# Also fix the duplicate tailwind classes in the second dropzone:
bad_section_2 = """              {/* CREATE NEW DATASET AREA */}
              <div
                className={cn(
                  "flex-1 border border-dashed flex flex-col items-center justify-center transition-all duration-300 py-3 rounded cursor-pointer",
                  dragTarget === "new" ? "border-accent bg-accent/10" : "border-text-muted/50 bg-panel-bg text-text-muted hover:border-text-secondary hover:text-text-secondary"
                )}-center transition-all duration-300 py-3 rounded cursor-pointer",
                  dragTarget === "new" ? "border-accent bg-accent/10" : "border-panel-border bg-panel-bg text-text-muted hover:border-text-muted"
                )}"""

good_section_2 = """              {/* CREATE NEW DATASET AREA */}
              <div
                className={cn(
                  "flex-1 border border-dashed flex flex-col items-center justify-center transition-all duration-300 py-3 rounded cursor-pointer",
                  dragTarget === "new" ? "border-accent bg-accent/10" : "border-text-muted/50 bg-panel-bg text-text-muted hover:border-text-secondary hover:text-text-secondary"
                )}"""

app = app.replace(bad_section_2, good_section_2)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
