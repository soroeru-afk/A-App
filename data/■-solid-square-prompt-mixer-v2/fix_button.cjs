const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = "theme === 'mono' ? 'bg-gray-600 border-gray-500 hover:bg-gray-500' : 'bg-teal-600 border-teal-500 hover:opacity-80'";
const replacement = "theme === 'mono' ? 'bg-gray-600 border-gray-500 hover:bg-gray-500' : (theme === 'black' ? 'bg-accent-main border-accent-dim hover:opacity-80' : 'bg-teal-600 border-teal-500 hover:opacity-80')";

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated button colors.");
