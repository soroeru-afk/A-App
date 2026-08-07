import re

with open("src/App.tsx", "r") as f:
    app = f.read()

start = app.find("              {/* Overlay Meta */}")
end = app.find("            </motion.div>\n          </motion.div>\n        )}\n      </AnimatePresence>\n\n      {/* New/Rename Dataset Modal */}")

if start != -1 and end != -1:
    before = app[:start]
    middle = app[start:end]
    after = app[end:]
    
    new_middle = """              <AnimatePresence>
                {showFullscreenUI && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
""" + middle + """                  </motion.div>
                )}
              </AnimatePresence>
"""
    app = before + new_middle + after
    with open("src/App.tsx", "w") as f:
        f.write(app)
    print("Wrapped!")
else:
    print("Not found", start, end)
