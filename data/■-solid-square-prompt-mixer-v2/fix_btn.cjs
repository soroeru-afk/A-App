const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const oldBtn = `className={\`px-2 py-1 text-[9px] font-mono border rounded outline-none transition-colors \${autoOptimize 
              ? (theme === 'mono' ? 'bg-text-main text-bg-base border-text-main' : 'bg-blue-500 text-white border-blue-500') 
              : 'bg-transparent border-border-main text-text-dim hover:text-text-main'}\`}`;

const newBtn = `className={\`px-2 py-1 text-[9px] font-mono border rounded outline-none transition-colors bg-transparent \${autoOptimize 
              ? 'border-border-main text-text-main' 
              : 'border-border-main/50 text-text-dim hover:text-text-main'}\`}`;

code = code.replace(oldBtn, newBtn);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
console.log("Success");
