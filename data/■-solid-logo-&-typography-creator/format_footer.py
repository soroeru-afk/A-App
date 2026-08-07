import sys

file_path = '/app/applet/App.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Currently the footer is:
#      <footer className="p-3 border-t border-[var(--border-base)] bg-[var(--bg-panel)] shrink-0 flex gap-3 h-[60px]">
#        <button ...>COPY 3D SOURCE</button>
#        <div className="flex-[2] flex gap-3">
#          <button ...>PNG (SOLID)</button>
#          <button ...>PNG (ALPHA)</button>
#        </div>
#        <button ...>CLEAR ALL</button>
#      </footer>

import re
# We just need to remove the wrapper div around PNG (SOLID) and PNG (ALPHA)
# find the wrapper: <div className="flex-[2] flex gap-3">
# and the closing </div> before <button ... CLEAR ALL

content = content.replace('<div className="flex-[2] flex gap-3">\n          <button', '<button')
content = content.replace('          </button>\n        </div>\n                                \n        <button\n          onClick={clearAllTabs}', '          </button>\n        <button\n          onClick={clearAllTabs}')

# wait, I'll just use regex or exact replacement

div_start = '<div className="flex-[2] flex gap-3">'
if div_start in content:
    content = content.replace(div_start, '')
    
    # replace the </div> that comes right after PNG (ALPHA)
    # The structure:
    #           </button>
    #         </div>
    #                                 
    #         <button
    
    # regex to remove that closing div
    content = re.sub(r'</button>\s*</div>\s*<button\s*onClick={clearAllTabs}', r'</button>\n        <button\n          onClick={clearAllTabs}', content)

with open(file_path, 'w') as f:
    f.write(content)
print("Footer flattened.")
