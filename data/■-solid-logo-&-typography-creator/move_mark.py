import sys, re

file_path = '/app/applet/App.tsx'
with open(file_path, 'r') as f:
    content = f.read()

def extract_conditional_block(content, start_str):
    start = content.find(start_str)
    if start == -1: return "", content
    brace_count = 0
    end_idx = -1
    for i in range(start, len(content)):
        if content[i] == '{': brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break
    block = content[start:end_idx]
    new_content = content[:start] + content[end_idx:]
    return block, new_content

# We have two {attachedMark && ( ... ) blocks.
# The one we want is the one starting with `<div className="ss-panel p-3 animate-fade-in">`
# Let's find it.
start_idx = content.find('{attachedMark && (\n                  <div className="ss-panel p-3 animate-fade-in">')
if start_idx != -1:
    brace_count = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '{': brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break
    
    block = content[start_idx:end_idx]
    content = content[:start_idx] + content[end_idx:]
    
    # Insert it right after `{activeTab === "objects" && (\n              <>\n`
    insert_str = '{activeTab === "objects" && (\n              <>\n'
    insert_idx = content.find(insert_str)
    if insert_idx != -1:
        insert_idx += len(insert_str)
        content = content[:insert_idx] + block + '\n' + content[insert_idx:]
        
        with open(file_path, 'w') as f:
            f.write(content)
        print("Moved mark settings to top")
    else:
        print("Could not find objects tab insert point")
else:
    print("Could not find attachedMark panel")
