const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

const target = /className=\{\`flex items-center justify-center min-w-\[16px\] h-4 px-1 rounded-\[3px\] shrink-0 text-\[10px\] font-bold shadow-sm \$\{theme === 'mono' \? 'bg-black text-white' : 'bg-gray-500 text-white'\}\`\} title="選択数">/;

const replacement = "className={`flex items-center justify-center min-w-[16px] h-4 px-1 rounded-[3px] shrink-0 text-[10px] font-bold shadow-sm ${theme === 'mono' ? 'bg-black text-white' : (theme === 'navy' ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white')}`} title=\"選択数\">";

if (target.test(content)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/AttributeMixer.tsx', content);
  console.log("Updated AttributeMixer.tsx successfully.");
} else {
  console.log("Target not found.");
}
