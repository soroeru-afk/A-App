import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# Fix App.tsx missing FONT selector state
appFontState = """  const [appFont, setAppFont] = useState<"GOTHIC" | "MARU" | "MEIRYO" | "MONO">(() => {
    const saved = localStorage.getItem("app_font");
    return (saved as "GOTHIC" | "MARU" | "MEIRYO" | "MONO") || "GOTHIC";
  });

  useEffect(() => {
    localStorage.setItem("app_font", appFont);
    document.documentElement.setAttribute("data-font", appFont);
  }, [appFont]);
"""

if "const [appFont, setAppFont]" not in app:
    app = app.replace('  const [theme, setTheme]', appFontState + '\n  const [theme, setTheme]')

with open("src/App.tsx", "w") as f:
    f.write(app)

