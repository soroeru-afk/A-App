import sys, re

file_path = '/app/applet/App.tsx'
with open(file_path, 'r') as f:
    content = f.read()

start_idx = content.find('{activeTab === "3d" && (')
if start_idx == -1:
    print("3D block not found")
    sys.exit(1)

# Find matching closing brace for this block
end_idx = -1
brace_count = 0
for i in range(start_idx, len(content)):
    if content[i] == '{':
        brace_count += 1
    elif content[i] == '}':
        brace_count -= 1
        if brace_count == 0:
            end_idx = i + 1
            break

block_3d = content[start_idx:end_idx]

# Remove from original
content = content[:start_idx] + content[end_idx:]

# We want to remove the `{activeTab === "3d" && (` and `)}` wrappers
block_3d_inner = block_3d.replace('{activeTab === "3d" && (', '').strip()
if block_3d_inner.endswith(')}'):
    block_3d_inner = block_3d_inner[:-2].strip()

# Now block_3d_inner has `<> ... </>`. Remove the fragment wrapper.
if block_3d_inner.startswith('<>'):
    block_3d_inner = block_3d_inner[2:].strip()
if block_3d_inner.endswith('</>'):
    block_3d_inner = block_3d_inner[:-3].strip()

# Now inject it into the right sidebar, right after `<aside className="w-48 ... overflow-y-auto">`
right_sidebar_marker = '<aside className="w-48 border-l border-[var(--border-base)] bg-[var(--bg-panel)]/40 backdrop-blur-sm p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">'

if right_sidebar_marker in content:
    content = content.replace(right_sidebar_marker, right_sidebar_marker + "\n" + block_3d_inner)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Moved 3D Engine to right sidebar")
else:
    print("Right sidebar marker not found")
