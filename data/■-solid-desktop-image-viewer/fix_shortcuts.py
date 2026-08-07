import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_keydown = """      if (key === "p" || key === "P" || key === "r" || key === "R") {
        e.preventDefault();
        if (portraitMode === "off") setPortraitMode("left");
        else if (portraitMode === "left") setPortraitMode("right");
        else setPortraitMode("off");
        return;
      }"""

new_keydown = """      if (key === "p" || key === "P") {
        e.preventDefault();
        if (portraitMode === "off") setPortraitMode("left");
        else if (portraitMode === "left") setPortraitMode("right");
        else setPortraitMode("off");
        return;
      }
      if (key === "r" || key === "R") {
        e.preventDefault();
        if (isFullscreen) {
          setFullscreenRotation(r => {
            const next = r + 90;
            imgControls.start({ rotate: next, transition: { duration: 0.2 } });
            return next;
          });
        }
        return;
      }
      if (key === "h" || key === "H") {
        e.preventDefault();
        if (isFullscreen) {
          setFullscreenFlipX(flip => {
            const next = !flip;
            imgControls.start({ rotateY: next ? 180 : 0, transition: { duration: 0.2 } });
            return next;
          });
        }
        return;
      }"""

app = app.replace(old_keydown, new_keydown)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("keydown modified")
