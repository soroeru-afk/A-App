import sys, re

file_path = '/app/applet/App.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# We need to extract the raw bodies of the 3 tabs.
def extract_tab_block(content, tab_name):
    target = f'{{activeTab === "{tab_name}" && ('
    start_idx = content.find(target)
    if start_idx == -1: return "", content
    
    end_idx = -1
    brace_count = 0
    for i in range(start_idx, len(content)):
        if content[i] == '{': brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break
    
    block = content[start_idx:end_idx]
    new_content = content[:start_idx] + content[end_idx:]
    
    block_inner = block.replace(target, '').strip()
    if block_inner.endswith(')}'):
        block_inner = block_inner[:-2].strip()
    if block_inner.startswith('<>'):
        block_inner = block_inner[2:].strip()
    if block_inner.endswith('</>'):
        block_inner = block_inner[:-3].strip()
        
    return block_inner, new_content

tab_objects, content = extract_tab_block(content, "objects")
tab_text, content = extract_tab_block(content, "text")
tab_style, content = extract_tab_block(content, "style")

# Now we have the inner contents. Let's parse them into panels.
# A panel usually starts with <div className="ss-panel..." or similar wrapper.
# Actually, the simplest way is to split by specific markers we know.

def split_by_marker(text, marker_regex):
    matches = list(re.finditer(marker_regex, text))
    if not matches:
        return [text]
    parts = []
    last_idx = 0
    for m in matches:
        parts.append(text[last_idx:m.start()])
        last_idx = m.start()
    parts.append(text[last_idx:])
    return [p for p in parts if p.strip()]

# Let's write the panels manually to avoid regex errors. We will just dump them to files to inspect.
with open("tab_text.tsx", "w") as f: f.write(tab_text)
with open("tab_objects.tsx", "w") as f: f.write(tab_objects)
with open("tab_style.tsx", "w") as f: f.write(tab_style)

