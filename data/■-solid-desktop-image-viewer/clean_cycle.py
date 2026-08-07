import re

with open("src/App.tsx", "r") as f:
    app = f.read()

pattern = re.compile(r'\s*const cycleTheme = \(\) => \{\n\s*const themes: Array<"NAVY" \| "BLACK" \| "RED" \| "LIGHT" \| "PAPER"> = \["NAVY", "BLACK", "RED", "LIGHT", "PAPER"\];\n\s*setTheme\(\(prev\) => themes\[\(themes\.indexOf\(prev\) \+ 1\) % themes\.length\]\);\n\s*\};')

cleaned = pattern.sub("", app)

# Add the real one after const [theme, setTheme]...
insertion_point = '  const [canvasBg, setCanvasBg] = useState<\n    "theme" | "black" | "white" | "checker"\n  >("white");'
real_cycleTheme = """
  const cycleTheme = () => {
    const themes: Array<"NAVY" | "BLACK" | "RED" | "LIGHT" | "PAPER"> = ["NAVY", "BLACK", "RED", "LIGHT", "PAPER"];
    setTheme((prev) => themes[(themes.indexOf(prev) + 1) % themes.length]);
  };
"""

cleaned = cleaned.replace(insertion_point, insertion_point + real_cycleTheme)

with open("src/App.tsx", "w") as f:
    f.write(cleaned)

print("done")
