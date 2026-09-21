const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

code = code.replace(/className="w-20 h-8 /g, 'className="shrink-0 w-20 h-8 ');

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
