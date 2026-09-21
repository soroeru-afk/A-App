const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

// The ref element for tabs scroll
code = code.replace(
  /className="flex-1 flex items-center overflow-x-auto px-0 pt-0 pb-1 bg-transparent/g,
  'className="flex-1 flex items-center overflow-x-auto pl-0 pt-0 pb-1 pr-8 bg-transparent'
);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
