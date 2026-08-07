import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# 1. Add states
insertion = "  const [sidebarOrder, setSidebarOrder] = useState(() => {"
new_states = """  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("app_sidebarWidth");
    return saved ? Math.max(300, parseInt(saved, 10)) : 300;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  
  useEffect(() => {
    localStorage.setItem("app_sidebarWidth", sidebarWidth.toString());
  }, [sidebarWidth]);

  const [sidebarOrder, setSidebarOrder] = useState(() => {"""
app = app.replace(insertion, new_states)

# 2. Update aside
old_aside = """        <aside
          className={cn(
            "flex flex-col gap-4 shrink-0 transition-all duration-300",
            sidebarVisible ? "w-[300px]" : "w-0 overflow-hidden opacity-0",
          )}
        >
          <ReactSortable"""

new_aside = """        <aside
          className={cn(
            "flex flex-col gap-4 shrink-0 relative",
            !isResizingSidebar && "transition-all duration-300",
            !sidebarVisible && "w-0 overflow-hidden opacity-0",
          )}
          style={sidebarVisible ? { width: `${sidebarWidth}px` } : undefined}
        >
          {sidebarVisible && (
            <div
              className={cn(
                "absolute top-0 bottom-0 w-2 cursor-col-resize z-50 hover:bg-white/5 transition-colors",
                sidebarPosition === "left" ? "-right-1" : "-left-1"
              )}
              onPointerDown={(e) => {
                e.preventDefault();
                setIsResizingSidebar(true);
                const startX = e.clientX;
                const startWidth = sidebarWidth;

                const onPointerMove = (eMove: PointerEvent) => {
                  const delta = sidebarPosition === "left" ? eMove.clientX - startX : startX - eMove.clientX;
                  setSidebarWidth(Math.max(300, startWidth + delta));
                };

                const onPointerUp = () => {
                  setIsResizingSidebar(false);
                  window.removeEventListener("pointermove", onPointerMove);
                  window.removeEventListener("pointerup", onPointerUp);
                };

                window.addEventListener("pointermove", onPointerMove);
                window.addEventListener("pointerup", onPointerUp);
              }}
            />
          )}
          <ReactSortable"""

if old_aside in app:
    app = app.replace(old_aside, new_aside)
    print("Replaced aside successfully")
else:
    print("Could not find aside block")

with open("src/App.tsx", "w") as f:
    f.write(app)

