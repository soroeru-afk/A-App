import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# We need to add a keyup listener and an interval for smooth keyboard scrolling
# Find the useEffect for handleKeyDown

search_block = """  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {"""

replace_block = """  useEffect(() => {
    const pressedKeys = new Set<string>();
    let kbdScrollInterval: ReturnType<typeof setInterval> | null = null;

    const startKbdScroll = () => {
      if (kbdScrollInterval) return;
      kbdScrollInterval = setInterval(() => {
        if (!scrollContainerRef.current) return;
        let dy = 0;
        let dx = 0;
        
        // For list scrolling
        if (!isFullscreen) {
          if (pressedKeys.has("ArrowUp")) dy -= 15;
          if (pressedKeys.has("ArrowDown")) dy += 15;
        }

        if (dy !== 0 || dx !== 0) {
          scrollContainerRef.current.scrollBy({ top: dy, left: dx, behavior: "auto" });
        }
      }, 16);
    };

    const stopKbdScroll = () => {
      if (kbdScrollInterval) {
        clearInterval(kbdScrollInterval);
        kbdScrollInterval = null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      pressedKeys.add(e.key);
      if (!isFullscreen && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        startKbdScroll();
      }"""

app = app.replace(search_block, replace_block)

search_block2 = """    };
    window.addEventListener("keydown", handleKeyDown);

  return () => window.removeEventListener("keydown", handleKeyDown);"""

replace_block2 = """    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key);
      if (!pressedKeys.has("ArrowUp") && !pressedKeys.has("ArrowDown")) {
        stopKbdScroll();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    stopKbdScroll();
  };"""

app = app.replace(search_block2, replace_block2)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
