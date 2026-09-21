const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

code = code.replace(/className="bg-blue-500\/40 rounded-\[2px\]"/g, 'className="bg-blue-400/30 px-[2px] mx-[-2px] rounded-[3px]"');

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
console.log("Updated highlight color and padding.");
