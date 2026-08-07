import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# 3. Wrap UI in AnimatePresence
start_marker = "              {/* Overlay Meta */}"
end_marker = """              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>"""

search_pattern = start_marker + r"(.*?)" + re.escape(end_marker)

replacement = """              <AnimatePresence>
                {showFullscreenUI && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
              {/* Overlay Meta */}""" + r"\1" + """              </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>"""

app = re.sub(search_pattern, replacement, app, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("wrapped")
