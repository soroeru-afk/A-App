const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const oldHeader = `      <div className="p-2 border-b border-border-main flex items-center justify-between bg-bg-panel shrink-0 gap-2">
        <div className="flex items-center gap-3">`;

const newHeader = `      <div className="p-2 border-b border-border-main flex flex-wrap items-center justify-between bg-bg-panel shrink-0 gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 flex-1">`;

code = code.replace(oldHeader, newHeader);

// Add shrink-0 whitespace-nowrap to all buttons inside the header
// We'll just manually replace specific buttons to make sure they don't shrink

code = code.replace(
/className="bg-bg-input border border-border-main text-\[11px\] font-mono px-3 py-1\.5 rounded focus:outline-none focus:border-blue-500 text-text-main placeholder-gray-600 w-\[120px\]"/g,
'className="bg-bg-input border border-border-main text-[11px] font-mono px-3 py-1.5 rounded focus:outline-none focus:border-blue-500 text-text-main placeholder-gray-600 w-[120px] shrink-0"'
);

// We should wrap the Find block and Replace block so they stay together
// Find block:
// <input ... findText ... />
// <div className="flex -space-x-px"> ... prev/next ... </div>
const findStart = `              <input 
                ref={findTextRef}`;
const findEnd = `                </button>
              </div>`;
const findBlockPattern = /              <input [\s\S]*?ref={findTextRef}[\s\S]*?<\/button>\s*<\/div>/;

const matchFind = code.match(findBlockPattern);
if (matchFind) {
  code = code.replace(findBlockPattern, `<div className="flex items-center gap-1 shrink-0">\n${matchFind[0]}\n            </div>`);
}

// Replace block:
// <input ... replaceText ... />
// <button ... handleReplace ... />
// <button ... handleReplaceAll ... />
const replaceBlockPattern = /          <input [\s\S]*?ref={replaceTextRef}[\s\S]*?<\/button>\s*<button [\s\S]*?onClick={handleReplaceAll}[\s\S]*?<\/button>/;
const matchReplace = code.match(replaceBlockPattern);
if (matchReplace) {
  code = code.replace(replaceBlockPattern, `<div className="flex items-center gap-1 shrink-0">\n${matchReplace[0]}\n          </div>`);
}

// And the divider:
code = code.replace(/<div className="w-px h-6 bg-border-main mx-1 shrink-0"><\/div>/g, '<div className="hidden xl:block w-px h-6 bg-border-main mx-1 shrink-0"></div>');

// Format buttons block
const formatBlockPattern = /                    {!showFormatOptions \? \([\s\S]*?<\/div>\s*\)\}/;
const matchFormat = code.match(formatBlockPattern);
if (matchFormat) {
  code = code.replace(formatBlockPattern, `<div className="flex flex-wrap items-center shrink-0">\n${matchFormat[0].replace('ml-2 ', '')}\n          </div>`);
}

// The buttons should have whitespace-nowrap and shrink-0
code = code.replace(/className={`px-3 py-1\.5 /g, 'className={`shrink-0 whitespace-nowrap px-3 py-1.5 ');
code = code.replace(/className={`px-2 py-1\.5 /g, 'className={`shrink-0 whitespace-nowrap px-2 py-1.5 ');
code = code.replace(/className={`ml-2 px-3 py-1\.5 /g, 'className={`shrink-0 whitespace-nowrap ml-2 px-3 py-1.5 ');

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
