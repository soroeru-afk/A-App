import re

with open("AGENTS.md", "r") as f:
    agents = f.read()

# Make sure we don't have duplicated entries if they exist
# Actually I don't need to change AGENTS.md, I already appended it earlier. But the user noticed it was duplicated in UI? 
# "今同じものがね、二つできちゃってるから上のやつはいらないな。" -> They mean the drag&drop zones were duplicated in the UI (in the FORMATION ENGINE and DATA SETS). I removed the one in FORMATION ENGINE! So I'm good.
