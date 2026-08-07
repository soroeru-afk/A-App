import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# 1. Add state
state_old = """  const [isPortraitMode, setIsPortraitMode] = useState(false);""" # Wait, let's find a reliable place
state_old = """  const [isFullscreen, setIsFullscreen] = useState(false);"""
state_new = """  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenUI, setShowFullscreenUI] = useState(true);"""
app = app.replace(state_old, state_new)

# 2. Add shortcut
key_old = """      // フルスクリーン時
      if (key === "Escape" || key === "Backspace") {"""
key_new = """      // フルスクリーン時
      if (key === "u" || key === "U") {
        e.preventDefault();
        setShowFullscreenUI(prev => !prev);
        return;
      }
      if (key === "Escape" || key === "Backspace") {"""
app = app.replace(key_old, key_new)

# 3. Wrap Overlay Meta to end
# We need to find ` {/* Overlay Meta */} ` and the closing `</motion.div>` of the fullscreen modal.
with open("src/App.tsx", "w") as f:
    f.write(app)
print("state and shortcut added")
