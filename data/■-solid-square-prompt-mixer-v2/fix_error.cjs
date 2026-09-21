const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{loadSuccessMessage && \(\<div className="mt-1 text-center text-\[10px\] font-mono text-accent-main animate-pulse font-bold">\{loadSuccessMessage\}<\/div>\)\}/;
code = code.replace(regex, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Removed lingering loadSuccessMessage reference.");
