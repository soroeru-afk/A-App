import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_scroll = """  const startScroll = (dir: "up" | "down") => {
    if (scrollIntervalRef.current || scrollTimeoutRef.current) return;
    const scrollStep = dir === "down" ? 25 : -25;
    const stepScroll = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ top: scrollStep, behavior: "auto" });
      }
    };
    stepScroll();
    scrollTimeoutRef.current = setTimeout(() => {
      scrollIntervalRef.current = setInterval(stepScroll, 16);
    }, 150);
  };"""

new_scroll = """  const startScroll = (dir: "up" | "down") => {
    if (scrollIntervalRef.current || scrollTimeoutRef.current) return;
    const scrollStep = dir === "down" ? 25 : -25;
    const stepScroll = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ top: scrollStep, behavior: "auto" });
      }
    };
    stepScroll();
    scrollIntervalRef.current = setInterval(stepScroll, 16);
  };"""

app = app.replace(old_scroll, new_scroll)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
