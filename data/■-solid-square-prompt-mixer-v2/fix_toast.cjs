const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove loadSuccessMessage state
code = code.replace(/const \[loadSuccessMessage, setLoadSuccessMessage\] = useState<string \| null>\(null\);\n\s*/, '');

// 2. Replace all setLoadSuccessMessage with setSaveSuccessMessage
code = code.replace(/setLoadSuccessMessage/g, 'setSaveSuccessMessage');

// 3. Remove the small inline UI in the sidebar
code = code.replace(/\{saveSuccessMessage && \(\<div className="mt-1 text-center text-\[10px\] font-mono text-accent-main animate-pulse font-bold">\{saveSuccessMessage\}<\/div>\)\}\n\s*/, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Updated success messages to use the big toast on the bottom right.");
