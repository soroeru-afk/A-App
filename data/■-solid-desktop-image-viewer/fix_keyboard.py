import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_key = """      if (e.key === "ArrowRight") {
        goToNextImage();
      } else if (e.key === "ArrowLeft") {
        goToPrevImage();
      } else if (e.code === "Numpad6" || e.key === "6") {
        if (fullscreenScale > 1) {
          e.preventDefault();
          const { mX } = getDragBounds();
          const newX = Math.max(imgX.get() - 20, -mX);
          imgControls.start({ x: newX, transition: { duration: 0.05, ease: "linear" } });
        }
      } else if (e.code === "Numpad4" || e.key === "4") {
        if (fullscreenScale > 1) {
          e.preventDefault();
          const { mX } = getDragBounds();
          const newX = Math.min(imgX.get() + 20, mX);
          imgControls.start({ x: newX, transition: { duration: 0.05, ease: "linear" } });
        }
      } else if (e.key === "ArrowUp" || e.code === "Numpad8" || e.key === "8") {
        e.preventDefault();
        if (fullscreenScale > 1) {
          const { mY } = getDragBounds();
          const newY = Math.min(imgY.get() + 20, mY);
          imgControls.start({ y: newY, transition: { duration: 0.05, ease: "linear" } });
        }
      } else if (e.key === "ArrowDown" || e.code === "Numpad2" || e.key === "2") {
        e.preventDefault();
        if (fullscreenScale > 1) {
          const { mY } = getDragBounds();
          const newY = Math.max(imgY.get() - 20, -mY);
          imgControls.start({ y: newY, transition: { duration: 0.05, ease: "linear" } });
        }
      }"""

new_key = """      const panX = (delta: number) => {
        if (fullscreenScale <= 1) return;
        const { mX } = getDragBounds();
        const newX = Math.max(-mX, Math.min(mX, imgX.get() + delta));
        imgControls.start({ x: newX, transition: { duration: 0.05, ease: "linear" } });
      };
      
      const panY = (delta: number) => {
        if (fullscreenScale <= 1) return;
        const { mY } = getDragBounds();
        const newY = Math.max(-mY, Math.min(mY, imgY.get() + delta));
        imgControls.start({ y: newY, transition: { duration: 0.05, ease: "linear" } });
      };

      const key = e.key;
      const code = e.code;
      
      let isNext = key === "ArrowRight";
      let isPrev = key === "ArrowLeft";
      let isPanRight = code === "Numpad6" || key === "6";
      let isPanLeft = code === "Numpad4" || key === "4";
      let isPanUp = key === "ArrowUp" || code === "Numpad8" || key === "8";
      let isPanDown = key === "ArrowDown" || code === "Numpad2" || key === "2";

      if (isPortraitMode) {
        // Map logical keys to physical portrait directions
        isNext = key === "ArrowDown";
        isPrev = key === "ArrowUp";
        isPanRight = key === "ArrowDown" || code === "Numpad2" || key === "2";
        isPanLeft = key === "ArrowUp" || code === "Numpad8" || key === "8";
        isPanUp = key === "ArrowLeft" || code === "Numpad4" || key === "4";
        isPanDown = key === "ArrowRight" || code === "Numpad6" || key === "6";
      }

      if (isNext && fullscreenScale <= 1) {
        e.preventDefault();
        goToNextImage();
      } else if (isPrev && fullscreenScale <= 1) {
        e.preventDefault();
        goToPrevImage();
      } else if (isPanRight) {
        e.preventDefault();
        isPortraitMode ? panY(20) : panX(-20);
      } else if (isPanLeft) {
        e.preventDefault();
        isPortraitMode ? panY(-20) : panX(20);
      } else if (isPanUp) {
        e.preventDefault();
        isPortraitMode ? panX(20) : panY(20);
      } else if (isPanDown) {
        e.preventDefault();
        isPortraitMode ? panX(-20) : panY(-20);
      }"""

app = app.replace(old_key, new_key)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("Applied key mapping fixes")
