import re

with open("src/App.tsx", "r") as f:
    app = f.read()

container_block = """                    const containerProps = isSortable ? {
                      list: sortedImages.map(img => ({ ...img, id: img.id })),
                      setList: () => {},
                      onEnd: handleSortEnd,
                      animation: 150,
                      disabled: sortOrders[sortField] !== "asc",
                      delay: 150,
                      delayOnTouchOnly: true,
                    } : {};

  return (
                      <Container"""

new_container_block = """                    const containerProps = isSortable ? {
                      list: sortedImages.map(img => ({ ...img, id: img.id })),
                      setList: () => {},
                      onEnd: handleSortEnd,
                      animation: 150,
                      disabled: sortOrders[sortField] !== "asc",
                      delay: 150,
                      delayOnTouchOnly: true,
                    } : {};
                    
                    return (
                      <>
                        {searchQuery.trim() && (
                          <div className="absolute top-4 left-0 w-full z-50 flex items-center justify-center pointer-events-none mb-6">
                            <div className="bg-panel-bg/70 backdrop-blur-md border border-panel-border/50 shadow-lg rounded-full px-6 py-2.5 flex items-center gap-3">
                              <span className="font-mono text-accent uppercase tracking-widest text-xs font-bold drop-shadow-md">
                                SEARCH RESULTS: "{searchQuery}"
                              </span>
                              <div className="w-px h-4 bg-panel-border" />
                              <span className="font-mono text-text-muted text-[10px] uppercase tracking-widest drop-shadow-md">
                                {sortedImages.length} {sortedImages.length === 1 ? 'MATCH' : 'MATCHES'}
                              </span>
                            </div>
                          </div>
                        )}
                        <Container"""

if container_block in app:
    app = app.replace(container_block, new_container_block)
    closing_tags = """                  {sortedImages.length === 0 && !isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted font-mono text-xs pointer-events-none">"""
    
    new_closing_tags = """                      </>
                  {sortedImages.length === 0 && !isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted font-mono text-xs pointer-events-none">"""
    app = app.replace(closing_tags, new_closing_tags)
    print("Replaced container block successfully!")
else:
    print("Could not find container block.")

with open("src/App.tsx", "w") as f:
    f.write(app)

