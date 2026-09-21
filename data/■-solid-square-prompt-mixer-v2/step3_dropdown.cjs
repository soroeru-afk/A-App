const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

const regex1 = /\{isSelected && \(\s*<div className="absolute left-0 top-1\/2 -translate-y-1\/2 text-blue-500 pointer-events-none" title="選択中">\s*<Check className="w-3\.5 h-3\.5" \/>\s*<\/div>\s*\)\}/;

const replace1 = `{isSelected && (
              <div className={\`absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none \${cat.isNegative ? (theme === 'mono' ? 'text-black' : 'text-red-500') : (theme === 'mono' ? 'text-black' : 'text-blue-500')}\`} title="選択中">
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </div>
            )}`;

content = content.replace(regex1, replace1);

const regex2 = /className=\{\`flex-1 min-w-0 bg-bg-input border \$\{isSelected \? 'border-blue-500\/50 shadow-\[0_0_8px_rgba\(59,130,246,0\.1\)\]' : 'border-border-main'\} rounded px-2 py-1\.5 text-\[13px\] text-text-main truncate transition-colors cursor-pointer flex justify-between items-center\`\}/;

const replace2 = `className={\`flex-1 min-w-0 bg-bg-input border \${isSelected ? (cat.isNegative ? (theme === 'mono' ? 'border-black shadow-[0_0_8px_rgba(0,0,0,0.1)]' : 'border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.1)]') : (theme === 'mono' ? 'border-black shadow-[0_0_8px_rgba(0,0,0,0.1)]' : 'border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.1)]')) : 'border-border-main'} rounded px-2 py-1.5 text-[13px] text-text-main truncate transition-colors cursor-pointer flex justify-between items-center\`}`;

content = content.replace(regex2, replace2);

const regex3 = /className="rounded bg-bg-surface border-border-main text-blue-500 focus:ring-blue-500\/50 cursor-pointer w-4 h-4"/;

const replace3 = `className={\`rounded bg-bg-surface border-border-main cursor-pointer w-4 h-4 \${cat.isNegative ? (theme === 'mono' ? 'text-black focus:ring-black' : 'text-red-500 focus:ring-red-500/50') : (theme === 'mono' ? 'text-black focus:ring-black' : 'text-blue-500 focus:ring-blue-500/50')}\`}`;

content = content.replace(regex3, replace3);

fs.writeFileSync('src/components/AttributeMixer.tsx', content);
