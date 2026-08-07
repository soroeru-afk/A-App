import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will define renderImageCard before the main return statement of App.tsx
# Main return starts with `return (` and then `<div className="h-screen w-screen`
return_index = content.find('  return (\n    <div className="h-screen w-screen')

if return_index == -1:
    print("Could not find main return")
    exit(1)

# Let's extract renderImageCard from its original location
start_str = "                      const renderImageCard = ("
end_str = "                        </motion.div>\n                      );\n"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx) + len(end_str)

if start_idx == -1 or end_idx == -1:
    print("Could not find renderImageCard bounds")
    exit(1)

render_card_code = content[start_idx:end_idx].replace("                      ", "  ")

# Now we construct the grouped render logic
grouped_render_logic = """
                    if (searchQuery.trim()) {
                      const groupedImages: Record<string, typeof sortedImages> = {};
                      sortedImages.forEach(img => {
                         if (!groupedImages[img.datasetId]) {
                            groupedImages[img.datasetId] = [];
                         }
                         groupedImages[img.datasetId].push(img);
                      });
                      
                      return (
                        <div className="flex flex-col gap-8 w-full h-auto">
                          {Object.entries(groupedImages).map(([datasetId, imgs]) => {
                             const dataset = datasets.find(d => d.id === datasetId);
                             const datasetName = dataset ? dataset.name : "UNKNOWN";
                             
                             return (
                               <div key={datasetId} className="flex flex-col gap-2">
                                 <div className="bg-panel-bg border border-panel-border px-4 py-2 font-mono text-accent text-sm tracking-widest font-bold border-l-2 border-l-accent uppercase flex items-center justify-between">
                                   <span>{datasetName}</span>
                                   <span className="text-xs text-text-muted">{imgs.length} IMAGES</span>
                                 </div>
                                 <div
                                   className={cn(
                                     "w-full h-auto",
                                     viewMode === "grid-sq" && "grid content-start justify-center",
                                     viewMode === "grid-ma" && "flex items-start",
                                     viewMode === "list" && "flex flex-col",
                                   )}
                                   style={{
                                      ...(viewMode === "grid-sq" ? { gridTemplateColumns: `repeat(auto-fill, minmax(${itemScale}px, 1fr))`, gap: `${gridGap}px` } : {}),
                                      ...(viewMode === "grid-ma" ? { gap: `${gridGap}px` } : {}),
                                      ...(viewMode === "list" ? { gap: `${gridGap}px` } : {}),
                                   }}
                                 >
                                    {viewMode === "grid-ma" ? (
                                        (() => {
                                          const colsCount = Math.max(1, Math.floor((containerWidth - 32 - 16 + gridGap) / (itemScale + gridGap)));
                                          const columns = Array.from({ length: colsCount }, () => [] as typeof sortedImages);
                                          imgs.forEach((img, index) => {
                                            columns[index % colsCount].push(img);
                                          });
                                          return columns.map((col, colIndex) => (
                                            <div key={colIndex} className="flex flex-col flex-1 min-w-0" style={{ gap: `${gridGap}px` }}>
                                              {col.map(img => {
                                                const globalIdx = sortedImages.findIndex(sim => sim.id === img.id);
                                                return renderImageCard(img, globalIdx, selectedImage?.id === img.id, isSelectionMode && selectedImageIds.has(img.id));
                                              })}
                                            </div>
                                          ));
                                        })()
                                    ) : (
                                        imgs.map(img => {
                                           const globalIdx = sortedImages.findIndex(sim => sim.id === img.id);
                                           return renderImageCard(img, globalIdx, selectedImage?.id === img.id, isSelectionMode && selectedImageIds.has(img.id));
                                        })
                                    )}
                                 </div>
                               </div>
                             );
                          })}
                        </div>
                      );
                    }
"""

# The IIFE for normal render is
old_render_logic_start = "                    {(() => {\n" + content[start_idx:end_idx]
old_render_logic_end = "                    })()}\n"
# Actually, the IIFE starts before renderImageCard and ends after the regular return sortedImages.map...
# Let's find it.
iife_start_idx = content.rfind("                    {(() => {\n", 0, start_idx)
iife_end_idx = content.find("                    })()}\n                  </Container>", end_idx) + len("                    })()}\n")

if iife_start_idx == -1 or iife_end_idx == -1:
    print("Could not find IIFE bounds")
    exit(1)
    
old_iife = content[iife_start_idx:iife_end_idx]

# Remove renderImageCard from old_iife
new_iife = old_iife.replace(content[start_idx:end_idx], grouped_render_logic)

# Replace in content
content = content[:iife_start_idx] + new_iife + content[iife_end_idx:]

# Insert renderImageCard before return
content = content[:return_index] + render_card_code + "\n" + content[return_index:]

# Also we need to remove the small tags we added earlier in list view and grid view since the grouped container handles dataset names now.
# Search for:
# {searchQuery && (
#   <span className="font-mono text-[10px] text-accent truncate block mt-0.5 uppercase tracking-widest">
#     SET: {datasets.find(d => d.id === img.datasetId)?.name || 'UNKNOWN'}
#   </span>
# )}
tag1 = """                                {searchQuery && (
                                  <span className="font-mono text-[10px] text-accent truncate block mt-0.5 uppercase tracking-widest">
                                    SET: {datasets.find(d => d.id === img.datasetId)?.name || 'UNKNOWN'}
                                  </span>
                                )}"""
tag2 = """                                {searchQuery && (
                                  <span className="text-accent text-[10px] font-mono truncate max-w-full uppercase tracking-widest border border-accent/30 bg-accent/10 px-1.5 py-0.5 rounded-sm shadow-sm backdrop-blur-sm">
                                    {datasets.find(d => d.id === img.datasetId)?.name || 'UNKNOWN'}
                                  </span>
                                )}"""
tag3 = """<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center justify-center p-2 text-center">"""

content = content.replace(tag1, "")
content = content.replace(tag2, "")
content = content.replace(tag3, """<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />""")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Refactor complete")
