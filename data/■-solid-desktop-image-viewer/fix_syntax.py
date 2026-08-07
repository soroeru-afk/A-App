import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_closing = """                  </Container>
                    );
                  })()}
                      </>
                  {sortedImages.length === 0 && !isLoading && ("""

new_closing = """                  </Container>
                      </>
                    );
                  })()}
                  {sortedImages.length === 0 && !isLoading && ("""

if old_closing in app:
    app = app.replace(old_closing, new_closing)
    print("Fixed syntax.")
else:
    print("Could not find syntax block.")

with open("src/App.tsx", "w") as f:
    f.write(app)
