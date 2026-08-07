import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_block = """  // Preserve scale and rotation across image switch, and clamp x/y position to the new image bounds once loaded
  useEffect(() => {
    if (isFullscreen && imgDims.w > 0 && imgDims.h > 0) {
      const currentCW = typeof window !== "undefined" ? (isPortraitMode ? window.innerHeight : window.innerWidth) * (isAppFullscreen ? 1 : 0.95) : 1000;
      const currentCH = typeof window !== "undefined" ? (isPortraitMode ? window.innerWidth : window.innerHeight) * (isAppFullscreen ? 1 : 0.95) : 1000;

      const aspectImg = imgDims.w / imgDims.h;
      const aspectScreen = currentCW / currentCH;
      let renderedW, renderedH;
      if (aspectImg > aspectScreen) {
        renderedW = currentCW;
        renderedH = currentCW / aspectImg;
      } else {
        renderedH = currentCH;
        renderedW = currentCH * aspectImg;
      }
      const scaledW = renderedW * fullscreenScale;
      const scaledH = renderedH * fullscreenScale;
      const rotW = Math.abs(fullscreenRotation % 180) === 90 ? scaledH : scaledW;
      const rotH = Math.abs(fullscreenRotation % 180) === 90 ? scaledW : scaledH;
      const mX = Math.max(0, (rotW - currentCW) / 2);
      const mY = Math.max(0, (rotH - currentCH) / 2);

      let currentX = imgX.get();
      let currentY = imgY.get();

      if (fullscreenScale <= 1.0) {
        currentX = 0;
        currentY = 0;
      } else {
        if (currentX > mX) currentX = mX;
        if (currentX < -mX) currentX = -mX;
        if (currentY > mY) currentY = mY;
        if (currentY < -mY) currentY = -mY;
      }

      imgX.set(currentX);
      imgY.set(currentY);
      imgControls.start({
        scale: fullscreenScale,
        rotate: fullscreenRotation,
        x: currentX,
        y: currentY,
        transition: { duration: 0 }
      });
    }
  }, [imgDims, isFullscreen, fullscreenScale, fullscreenRotation, imgControls, imgX, imgY, isPortraitMode, isAppFullscreen]);"""

# 削除
app = app.replace(old_block, "")

# 追加場所: `const [notification, setNotification] = useState<string | null>(null);` の直後
insertion_point = """  const [notification, setNotification] = useState<string | null>(null);"""

app = app.replace(insertion_point, insertion_point + "\n\n" + old_block)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("Moved useEffect successfully")
