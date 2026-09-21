const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

code = code.replace(/const effectiveAutoOptimize = isMemoTab \? false : autoOptimize;/g, "");
code = code.replace(/!effectiveAutoOptimize/g, "!autoOptimize");
code = code.replace(/effectiveAutoOptimize/g, "autoOptimize");

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
console.log("Success");
