import re

with open("src/index.css", "r") as f:
    content = f.read()

# Replace the first import
old_import = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600&family=Share+Tech+Mono&display=swap');"
new_import = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600&family=Share+Tech+Mono&family=M+PLUS+Rounded+1c:wght@400;500;700&display=swap');"
content = content.replace(old_import, new_import)
if new_import not in content:
    # try another way
    content = re.sub(r"@import url\([^)]+\);", new_import, content, count=1)

# Add font definitions
layer_base = """@layer base {
  :root {
    --font-primary: "Inter", "Outfit", ui-sans-serif, system-ui, sans-serif;
  }
  :root[data-font="GOTHIC"] {
    --font-primary: "Inter", "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif;
  }
  :root[data-font="MARU"] {
    --font-primary: "M PLUS Rounded 1c", "Hiragino Maru Gothic ProN", sans-serif;
  }
  :root[data-font="MEIRYO"] {
    --font-primary: Meiryo, "メイリオ", sans-serif;
  }
  :root[data-font="MONO"] {
    --font-primary: "Share Tech Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  }"""

content = content.replace("@layer base {\n  :root {", layer_base)

# Update theme
theme_old = """@theme {
  --font-sans: "Inter", "Outfit", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Share Tech Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;"""

theme_new = """@theme {
  --font-sans: var(--font-primary), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-primary), ui-monospace, SFMono-Regular, monospace;"""

content = content.replace(theme_old, theme_new)

# if theme_old not found
if theme_new not in content:
    content = content.replace('--font-sans: "Inter", "Outfit", ui-sans-serif, system-ui, sans-serif;', '--font-sans: var(--font-primary), ui-sans-serif, system-ui, sans-serif;')
    content = content.replace('--font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;', '--font-mono: var(--font-primary), ui-monospace, SFMono-Regular, monospace;')
    content = content.replace('--font-mono: "Share Tech Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;', '--font-mono: var(--font-primary), ui-monospace, SFMono-Regular, monospace;')

with open("src/index.css", "w") as f:
    f.write(content)

