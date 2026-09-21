const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/全体バックアップ_\$\{dateStr\}\.json/g, 'PM-全体バックアップ_${dateStr}.json');
code = code.replace(/パーツ_\$\{dateStr\}\.json/g, 'PM-パーツ_${dateStr}.json');

fs.writeFileSync('src/App.tsx', code);
console.log("Updated filenames.");
