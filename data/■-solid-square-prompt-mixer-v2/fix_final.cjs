const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

// 1. Fix textarea classes
code = code.replace(
  /\$\{searchSelectionActive \? 'selection:bg-transparent selection:text-transparent' : 'selection:bg-blue-600 selection:text-white'\}/g,
  "${searchSelectionActive ? 'selection:bg-transparent selection:text-transparent' : 'selection:bg-blue-500/40 selection:text-transparent'}"
);
code = code.replace(
  /\$\{searchSelectionActive \? 'selection:bg-transparent selection:text-transparent' : 'selection:bg-red-600 selection:text-white'\}/g,
  "${searchSelectionActive ? 'selection:bg-transparent selection:text-transparent' : 'selection:bg-red-500/40 selection:text-transparent'}"
);

// 2. Add onDragStart to both textareas
// We look for `onDragOver={handleDragOver}` and add `onDragStart` right before it.
code = code.replace(
  /onDragOver=\{handleDragOver\}/g,
  "onDragStart={(e) => { e.dataTransfer.effectAllowed = 'copy'; }} onDragOver={handleDragOver}"
);

// 3. Add dropEffect = 'copy' to input's onDrop
const oldOnDrop = `onDrop={(e) => {
                  e.preventDefault();
                  const text = e.dataTransfer.getData('text/plain');`;
const newOnDrop = `onDrop={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                  const text = e.dataTransfer.getData('text/plain');`;
code = code.replace(oldOnDrop, newOnDrop);

// 4. Update Search button
const oldSearchBtn = `onClick={() => setAppliedFindText(findText)}
                className={\`shrink-0 flex items-center justify-center px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] border border-border-hover rounded-l text-text-dim transition-colors\`}
                title={lang === 'en' ? 'Search' : '検索'}`;

const newSearchBtn = `onClick={() => {
                  if (!findText) return;
                  handleFindNext();
                }}
                className={\`shrink-0 flex items-center justify-center px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] border border-border-hover rounded-l text-text-dim transition-colors\`}
                title={lang === 'en' ? 'Search' : '検索'}`;
code = code.replace(oldSearchBtn, newSearchBtn);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
console.log("Success");
