const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex1 = /const cleaned = cleanString\(before \+ insertedStr \+ after\);\s*const isAtEnd = after\.replace\(\/\[\\s,\]\/g, ''\)\.length === 0;\s*let finalPos = isAtEnd \? cleaned\.length : start \+ insertedStr\.length;\s*if \(finalPos > cleaned\.length\) finalPos = cleaned\.length;/g;

content = content.replace(regex1, `const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);`);

const regex2 = /const cleaned = cleanString\(before \+ insertedStr \+ after\);\s*const finalPos = \(end === safePrev\.length\) \? cleaned\.length : start \+ insertedStr\.length;/g;

content = content.replace(regex2, `const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);`);

fs.writeFileSync('src/App.tsx', content);
