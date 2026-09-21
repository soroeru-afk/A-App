const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

content = content.replace(/currentIdx !== 0/g, 'isSelected');
content = content.replace(/\{currentIdx/g, '{isSelected'); // To catch any potential leftovers

fs.writeFileSync('src/components/AttributeMixer.tsx', content);
