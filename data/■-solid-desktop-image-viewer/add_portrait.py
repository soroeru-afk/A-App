import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# 1. Add MonitorSmartphone import
app = app.replace("  RefreshCw,", "  RefreshCw,\n  MonitorSmartphone,")

# 2. Add isPortraitMode state
state_insertion = "  const [isAppFullscreen, setIsAppFullscreen] = useState(false);"
new_state = """  const [isAppFullscreen, setIsAppFullscreen] = useState(false);
  const [isPortraitMode, setIsPortraitMode] = useState(false);"""
app = app.replace(state_insertion, new_state)

# 3. Update the fullscreen root wrapper
old_modal_root = """      {/* Fullscreen Modal overlay */}
      <AnimatePresence>
        {isFullscreen && selectedImage && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)", transition: { duration: 0.1 } }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0 } }}
            className={cn(
              "fixed inset-0 z-[100] bg-root-bg/90 flex items-center justify-center transition-all duration-300",
              isAppFullscreen ? "p-0" : "p-8"
            )}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) {
                setIsFullscreen(false);
              }
            }}
          >
            <motion.div
              className={cn(
                "relative w-full h-full rounded-none overflow-hidden flex items-center justify-center bg-panel-bg transition-all duration-300",
                isAppFullscreen
                  ? "max-w-[100vw] max-h-[100vh] border-0 shadow-none"
                  : "max-w-[95vw] max-h-[95vh] border border-panel-border shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              )}"""

new_modal_root = """      {/* Fullscreen Modal overlay */}
      <AnimatePresence>
        {isFullscreen && selectedImage && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)", transition: { duration: 0.1 } }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0 } }}
            className={cn(
              "fixed inset-0 z-[100] bg-root-bg/90 flex items-center justify-center transition-all duration-300",
              isAppFullscreen ? "p-0" : "p-8"
            )}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) {
                setIsFullscreen(false);
              }
            }}
          >
            <motion.div
              className={cn(
                "relative rounded-none overflow-hidden flex items-center justify-center bg-panel-bg transition-all duration-300 origin-center",
                isAppFullscreen ? "border-0 shadow-none" : "border border-panel-border shadow-[0_0_50px_rgba(0,0,0,0.8)]",
              )}
              style={
                isPortraitMode
                  ? {
                      width: isAppFullscreen ? "100vh" : "95vh",
                      height: isAppFullscreen ? "100vw" : "95vw",
                      transform: "rotate(-90deg)",
                    }
                  : {
                      width: "100%",
                      height: "100%",
                      maxWidth: isAppFullscreen ? "100vw" : "95vw",
                      maxHeight: isAppFullscreen ? "100vh" : "95vh",
                    }
              }"""

app = app.replace(old_modal_root, new_modal_root)

# 4. Add the toggle button
old_buttons = """              {/* Borderless Toggle Button */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleAppFullscreen(); }}"""

new_buttons = """              {/* Portrait Mode Toggle Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsPortraitMode(!isPortraitMode); }}
                className={cn(
                  "absolute top-6 right-[136px] p-2 transition-colors drop-shadow-md hover:scale-110 outline-none focus:outline-none",
                  isFullscreenDarkText
                    ? (isPortraitMode ? "text-black" : "text-black/50 hover:text-black")
                    : (isPortraitMode ? "text-white" : "text-white/50 hover:text-white"),
                )}
                title="TOGGLE PORTRAIT MODE"
              >
                <MonitorSmartphone size={28} />
              </button>

              {/* Borderless Toggle Button */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleAppFullscreen(); }}"""

app = app.replace(old_buttons, new_buttons)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("Applied portrait mode")
