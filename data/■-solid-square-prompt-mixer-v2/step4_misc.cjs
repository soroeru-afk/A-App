const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

// 1012: <div className="flex flex-col gap-2 p-2 border border-blue-500/30 rounded bg-blue-500/5">
content = content.replace(
  'className="flex flex-col gap-2 p-2 border border-blue-500/30 rounded bg-blue-500/5"',
  'className={`flex flex-col gap-2 p-2 border rounded ${cat.isNegative ? (theme === \'mono\' ? \'border-black/30 bg-black/5\' : \'border-red-500/30 bg-red-500/5\') : (theme === \'mono\' ? \'border-black/30 bg-black/5\' : \'border-blue-500/30 bg-blue-500/5\')}`}'
);

// 1114: <button className="flex items-center justify-center gap-1 w-full py-1.5 mt-1 border border-dashed border-blue-500/50 text-blue-500 hover:bg-blue-500/10 rounded text-[11px] transition-colors">
content = content.replace(
  'className="flex items-center justify-center gap-1 w-full py-1.5 mt-1 border border-dashed border-blue-500/50 text-blue-500 hover:bg-blue-500/10 rounded text-[11px] transition-colors"',
  'className={`flex items-center justify-center gap-1 w-full py-1.5 mt-1 border border-dashed rounded text-[11px] transition-colors ${cat.isNegative ? (theme === \'mono\' ? \'border-black/50 text-black hover:bg-black/10\' : \'border-red-500/50 text-red-500 hover:bg-red-500/10\') : (theme === \'mono\' ? \'border-black/50 text-black hover:bg-black/10\' : \'border-blue-500/50 text-blue-500 hover:bg-blue-500/10\')}`}'
);

// 1263: "Copy to Parts" button
content = content.replace(
  'className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0"',
  'className={`px-2 py-1 rounded text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0 ${theme === \'mono\' ? \'bg-black/10 hover:bg-black/20 text-black border border-black/30\' : \'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30\'}`}'
);

// 1346: Editing combination name input
content = content.replace(
  'className="flex-1 bg-bg-surface border border-blue-500/50 rounded px-1.5 py-0.5 text-[12px] text-text-main font-mono"',
  'className={`flex-1 bg-bg-surface border rounded px-1.5 py-0.5 text-[12px] text-text-main font-mono ${theme === \'mono\' ? \'border-black/50\' : \'border-blue-500/50\'}`}'
);

fs.writeFileSync('src/components/AttributeMixer.tsx', content);
