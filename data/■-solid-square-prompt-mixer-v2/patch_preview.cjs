const fs = require('fs');

let content = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

// Add import
if (!content.includes('calculateCursorPos')) {
    content = content.replace("import { cleanString", "import { calculateCursorPos } from '../utils/cursorUtils';\nimport { cleanString");
}

const regex = /const after = currentText\.slice\(end\);\s*const isAtEnd = after\.replace\(\/\[\\s,\]\/g, ''\)\.length === 0;\s*let finalPos = isAtEnd \? newText\.length : start \+ content\.length;\s*if \(finalPos > newText\.length\) finalPos = newText\.length;/g;

content = content.replace(regex, `const after = currentText.slice(end);
      const isAtEnd = after.replace(/[\\s,]/g, '').length === 0;
      const before = currentText.slice(0, start);
      const finalPos = calculateCursorPos(before, content, newText, isAtEnd);`);

fs.writeFileSync('src/components/PreviewColumn.tsx', content);
