const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

code = code.replace(
  /className="px-3 py-1\.5 bg-bg-surface hover:bg-border-main text-\[10px\] font-mono border border-border-hover rounded text-text-dim transition-colors"/g,
  'className={`px-3 py-1.5 ${theme === \'mono\' ? \'bg-bg-surface hover:bg-gray-500 hover:text-white\' : \'bg-bg-surface hover:bg-border-main\'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors`}'
);

code = code.replace(
  /className="ml-2 px-3 py-1\.5 bg-bg-surface hover:bg-border-main text-\[10px\] font-mono border border-border-hover rounded text-text-dim transition-colors shrink-0"/g,
  'className={`ml-2 px-3 py-1.5 ${theme === \'mono\' ? \'bg-bg-surface hover:bg-gray-500 hover:text-white\' : \'bg-bg-surface hover:bg-border-main\'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors shrink-0`}'
);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
console.log("Updated button hover styles.");
