const fs = require('fs');
let content = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const target = /className="w-16 h-1 bg-border-main rounded-lg appearance-none cursor-pointer accent-blue-500"/;
const replacement = 'className="w-16 square-slider"';

if (target.test(content)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/PreviewColumn.tsx', content);
  console.log("Updated PreviewColumn.tsx successfully.");
} else {
  console.log("Could not find the target string in PreviewColumn.tsx.");
}
