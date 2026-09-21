const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

// 1. Fix the regex interpolation error
code = code.replace(
  /const searchRegex = new RegExp\(`\(\\\$\\{escapeRegExp\(appliedFindText\)\}\)`,\s*'gi'\);/,
  "const searchRegex = new RegExp(`(${escapeRegExp(appliedFindText)})`, 'gi');"
);

// Fallback if the above doesn't match due to exact slashes
code = code.replace(
  "const searchRegex = new RegExp(`(\\${escapeRegExp(appliedFindText)})`, 'gi');",
  "const searchRegex = new RegExp(`(${escapeRegExp(appliedFindText)})`, 'gi');"
);
code = code.replace(
  "const searchRegex = new RegExp(`(\\$\\{escapeRegExp(appliedFindText)\\})`, 'gi');",
  "const searchRegex = new RegExp(`(${escapeRegExp(appliedFindText)})`, 'gi');"
);

// 2. Fix textarea classes to restore the solid selection highlight
code = code.replace(
  /selection:bg-blue-500\/40 selection:text-transparent/g,
  "selection:bg-blue-600 selection:text-white"
);
code = code.replace(
  /selection:bg-red-500\/40 selection:text-transparent/g,
  "selection:bg-red-600 selection:text-white"
);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
console.log("Success");
