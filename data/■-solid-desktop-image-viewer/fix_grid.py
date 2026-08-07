import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_container = """                        <Container
                        {...containerProps}
                        className={cn(
                          "w-full h-auto",
                          viewMode === "grid-sq" &&
                            "grid content-start justify-center",
                          viewMode === "grid-ma" && "flex items-start",
                          viewMode === "list" && "flex flex-col",
                        )}
                        style={{
                          ...(viewMode === "grid-sq"
                            ? {
                                gridTemplateColumns: `repeat(auto-fill, minmax(${itemScale}px, 1fr))`,
                                gap: `${gridGap}px`,
                              }
                            : {}),
                          ...(viewMode === "grid-ma"
                            ? { gap: `${gridGap}px` }
                            : {}),
                          ...(viewMode === "list" ? { gap: `${gridGap}px` } : {}),
                        }}
                      >"""

new_container = """                        <Container
                        {...containerProps}
                        className={cn(
                          "w-full h-auto",
                          !searchQuery.trim() && viewMode === "grid-sq" &&
                            "grid content-start justify-center",
                          !searchQuery.trim() && viewMode === "grid-ma" && "flex items-start",
                          (!searchQuery.trim() && viewMode === "list") && "flex flex-col",
                        )}
                        style={{
                          ...(!searchQuery.trim() && viewMode === "grid-sq"
                            ? {
                                gridTemplateColumns: `repeat(auto-fill, minmax(${itemScale}px, 1fr))`,
                                gap: `${gridGap}px`,
                              }
                            : {}),
                          ...(!searchQuery.trim() && viewMode === "grid-ma"
                            ? { gap: `${gridGap}px` }
                            : {}),
                          ...(!searchQuery.trim() && viewMode === "list" ? { gap: `${gridGap}px` } : {}),
                        }}
                      >"""

if old_container in app:
    app = app.replace(old_container, new_container)
    print("Replaced container style.")
else:
    print("Container style not found.")

with open("src/App.tsx", "w") as f:
    f.write(app)

