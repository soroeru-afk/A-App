const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

// There is a second place where `currentIdx` was used:
// `const currentIdx = selections[key] ?? 0;` inside another function? No, the lint error from earlier mentioned:

