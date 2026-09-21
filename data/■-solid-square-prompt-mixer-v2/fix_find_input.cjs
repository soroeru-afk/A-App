const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const targetInput = `              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (e.shiftKey) handleFindPrev();
                  else handleFindNext();
                }
              }}`;

const replacementInput = `              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (e.shiftKey) handleFindPrev();
                  else handleFindNext();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const text = e.dataTransfer.getData('text/plain');
                if (text) {
                  setFindText(text);
                  setActiveEditor('find');
                }
              }}`;

code = code.replace(targetInput, replacementInput);

const targetHighlight = `className={\`bg-amber-500/40 px-[2px] mx-[-2px] rounded-[3px] \${isMatchActive ? 'ring-[2px] ring-blue-500 z-10 relative' : ''}\`}`;
const replacementHighlight = `className={\`bg-amber-500/40 px-[2px] mx-[-2px] rounded-[3px] \${isMatchActive ? 'border-b-[3px] border-blue-500 z-10 relative' : ''}\`}`;

code = code.replace(targetHighlight, replacementHighlight);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
