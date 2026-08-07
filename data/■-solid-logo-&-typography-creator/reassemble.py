import sys, re

file_path = '/app/applet/App.tsx'
with open(file_path, 'r') as f:
    content = f.read()

def extract_block_by_start_end(content, start_str, end_str):
    start = content.find(start_str)
    if start == -1: return "", content
    
    # We need to find the matching </div> for the panel.
    # But for simplicity, we can just find the string that follows the block,
    # or balance the <div>s.
    brace_count = 0
    end_idx = -1
    for i in range(start, len(content)):
        if content[i:i+4] == '<div': brace_count += 1
        elif content[i:i+5] == '</div':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 6
                break
    
    if end_idx == -1:
        end_idx = content.find(end_str, start)
        if end_idx != -1:
            end_idx += len(end_str)
            
    block = content[start:end_idx]
    new_content = content[:start] + content[end_idx:]
    return block, new_content

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

# We have these tabs: {activeTab === "text" && ( ... )}, {activeTab === "objects" && ( ... )}, {activeTab === "style" && ( ... )}
def extract_tab_content(content, tab_name):
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

tab_objects, content = extract_tab_content(content, "objects")
tab_text, content = extract_tab_content(content, "text")
tab_style, content = extract_tab_content(content, "style")

# 1. From tab_text:
# - Offset block: <div className="ss-panel p-3 animate-fade-in">\n                  <div className="ss-label mb-2 mt-1">\n                    <span className="ss-title flex-1">{t("labelOffset")}</span>
offset_start = '<div className="ss-panel p-3 animate-fade-in">\n                  <div className="ss-label mb-2 mt-1">\n                    <span className="ss-title flex-1">{t("labelOffset")}'
offset_block, tab_text = extract_block_by_start_end(tab_text, offset_start, "")

# - Attached Mark block: {attachedMark && (
mark_settings_block, tab_text = extract_conditional_block(tab_text, '{attachedMark && (')

# - Main Text block: <div className="ss-panel p-3 animate-fade-in">\n                  <div className="ss-label mb-2 mt-1 flex justify-between items-center w-full">\n                    <div className="flex items-center gap-2 flex-1">\n                      <span className="ss-number">\n                        {attachedMark ? "02" : "01"}\n                      </span>\n                      <span className="ss-title flex-shrink-0">{t("labelMainText")}</span>
main_text_start = '<div className="ss-panel p-3 animate-fade-in">\n                  <div className="ss-label mb-2 mt-1 flex justify-between items-center w-full">\n                    <div className="flex items-center gap-2 flex-1">\n                      <span className="ss-number">'
# Wait, this might match Sub Text. Let's just find "labelMainText"
idx = tab_text.find('{t("labelMainText")}')
start = tab_text.rfind('<div className="ss-panel p-3 animate-fade-in">', 0, idx)
main_text_block, tab_text = extract_block_by_start_end(tab_text[start:], '<div className="ss-panel p-3 animate-fade-in">', "")
tab_text = tab_text.replace(main_text_block, "", 1) # remove from tab_text

idx = tab_text.find('{t("labelSubText")}')
start = tab_text.rfind('<div className="ss-panel p-3 animate-fade-in">', 0, idx)
sub_text_block, tab_text = extract_block_by_start_end(tab_text[start:], '<div className="ss-panel p-3 animate-fade-in">', "")
tab_text = tab_text.replace(sub_text_block, "", 1)

idx = tab_text.find('{t("labelCharSettings")}')
start = tab_text.rfind('<div className="ss-panel p-3 animate-fade-in">', 0, idx)
char_settings_block, tab_text = extract_block_by_start_end(tab_text[start:], '<div className="ss-panel p-3 animate-fade-in">', "")
tab_text = tab_text.replace(char_settings_block, "", 1)


# 2. From tab_style:
# - Color Settings: 
idx = tab_style.find('{t("labelColorSettings")}')
start = tab_style.rfind('<div className="ss-panel p-3 animate-fade-in">', 0, idx)
color_settings_block, tab_style = extract_block_by_start_end(tab_style[start:], '<div className="ss-panel p-3 animate-fade-in">', "")
tab_style = tab_style.replace(color_settings_block, "", 1)

# - Ornaments blocks
# There's a map: {ornaments.map((ornament, idx) => ( ... ))}
ornaments_start = '{ornaments.map((ornament, idx) => ('
ornaments_block, tab_style = extract_conditional_block(tab_style, ornaments_start)

# Reassemble!

# new tab_text:
new_tab_text = f"""
            {{activeTab === "text" && (
              <>
                {main_text_block}
                {sub_text_block}
                {char_settings_block}
              </>
            )}}
"""

# new tab_objects:
new_tab_objects = f"""
            {{activeTab === "objects" && (
              <>
                {tab_objects}
                {mark_settings_block}
                {ornaments_block}
              </>
            )}}
"""

# new tab_style:
# Note: tab_style still contains whatever was left (which should be the color preset grid, and Face/Edge colors)
# Actually, wait. The color preset grid and face/edge colors are INSIDE the color_settings_block.
# Let's check color_settings_block!
new_tab_style = f"""
            {{activeTab === "style" && (
              <>
                {offset_block}
                {color_settings_block}
                {tab_style}
              </>
            )}}
"""

# Now insert back into content!
# We find the place where the tabs were. 
# We can just append them where the old ones were extracted.
# Actually, we completely extracted them, so we just insert them before `<div className="p-3 border-t border-[var(--border-base)] shrink-0 bg-[var(--bg-panel)] backdrop-blur-md grid grid-cols-2 gap-2">`
insert_marker = '<div className="p-3 border-t border-[var(--border-base)] shrink-0 bg-[var(--bg-panel)] backdrop-blur-md grid grid-cols-2 gap-2">'
if insert_marker in content:
    content = content.replace(insert_marker, new_tab_text + new_tab_objects + new_tab_style + "\n          " + insert_marker)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Reassembled tabs successfully")
else:
    print("Insert marker not found")

