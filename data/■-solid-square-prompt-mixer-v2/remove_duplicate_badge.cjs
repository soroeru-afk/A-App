const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

const regex = /\{isSelected && \(\s*<div className=\{\`absolute left-0 top-1\/2 -translate-y-1\/2 pointer-events-none min-w-\[16px\] h-4 px-1 flex items-center justify-center rounded-\[3px\] text-\[10px\] font-bold shadow-sm \$\{theme === 'mono' \? 'bg-black text-white' : 'bg-gray-500 text-white'\}\`\} title="選択数">\s*\{currentIndices\.filter\(idx => idx !== 0\)\.length\}\s*<\/div>\s*\)\}/;

if(regex.test(content)) {
  content = content.replace(regex, '');
  fs.writeFileSync('src/components/AttributeMixer.tsx', content);
  console.log("Replaced successfully!");
} else {
  console.log("Regex not found!");
}
