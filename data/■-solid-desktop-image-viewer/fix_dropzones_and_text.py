import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# Remove the DROP ZONES from the first panel (FORMATION ENGINE)
formation_pattern = re.compile(r'\{\/\* DROP ZONES \*\/\}.*?CREATE<br\/>NEW\n                <\/span>\n              <\/div>\n            <\/div>', re.DOTALL)

# Let's just find the first occurrence and replace it with empty string
matches = list(formation_pattern.finditer(app))
if len(matches) > 1:
    first_match = matches[0]
    app = app[:first_match.start()] + app[first_match.end():]

# Now for the remaining DROP ZONES in DATA SETS, let's translate the text using `t()`
old_add_text = 'ADD TO<br/>ACTIVE'
new_add_text = '{t("ADD TO", "現在のリストに")}<br/>{t("ACTIVE", "追加")}'

old_create_text = 'CREATE<br/>NEW'
new_create_text = '{t("CREATE", "新しいリストを")}<br/>{t("NEW", "作成")}'

app = app.replace(old_add_text, new_add_text)
app = app.replace(old_create_text, new_create_text)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
