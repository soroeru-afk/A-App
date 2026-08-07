import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# First, clean up the duplicate cycleTheme injections.
bad_injection = """    const cycleTheme = () => {
    const themes: Array<"NAVY" | "BLACK" | "RED" | "LIGHT" | "PAPER"> = ["NAVY", "BLACK", "RED", "LIGHT", "PAPER"];
    setTheme((prev) => themes[(themes.indexOf(prev) + 1) % themes.length]);
  };

  return ("""

bad_injection2 = """    const cycleTheme = () => {
    const themes: Array<"NAVY" | "BLACK" | "RED" | "LIGHT" | "PAPER"> = ["NAVY", "BLACK", "RED", "LIGHT", "PAPER"];
    setTheme((prev) => themes[(themes.indexOf(prev) + 1) % themes.length]);
  };
  return ("""

bad_injection3 = """  const cycleTheme = () => {
    const themes: Array<"NAVY" | "BLACK" | "RED" | "LIGHT" | "PAPER"> = ["NAVY", "BLACK", "RED", "LIGHT", "PAPER"];
    setTheme((prev) => themes[(themes.indexOf(prev) + 1) % themes.length]);
  };
  return ("""

app = app.replace(bad_injection, "return (")
app = app.replace(bad_injection2, "return (")
# wait, don't remove the real one which has correct indentation
# Let's use regex to find all cycleTheme definitions that are followed by `return (` and only keep the valid one.

