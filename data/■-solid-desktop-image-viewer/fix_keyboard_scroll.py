import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_keydown = """      if (!isFullscreen) {
        // 一覧画面での操作
        if (key === "ArrowRight") {
          e.preventDefault();
          goToNextImage();
        } else if (key === "ArrowLeft") {
          e.preventDefault();
          goToPrevImage();
        } else if (key === "Enter") {
          e.preventDefault();
          if (selectedImage) {
            setIsFullscreen(true);
          }
        }
        return;
      }"""

new_keydown = """      if (!isFullscreen) {
        // 一覧画面での操作
        if (key === "ArrowRight") {
          e.preventDefault();
          goToNextImage();
        } else if (key === "ArrowLeft") {
          e.preventDefault();
          goToPrevImage();
        } else if (key === "ArrowUp") {
          e.preventDefault();
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ top: -40, behavior: "auto" });
          }
        } else if (key === "ArrowDown") {
          e.preventDefault();
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ top: 40, behavior: "auto" });
          }
        } else if (key === "Enter") {
          e.preventDefault();
          if (selectedImage) {
            setIsFullscreen(true);
          }
        }
        return;
      }"""

app = app.replace(old_keydown, new_keydown)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
