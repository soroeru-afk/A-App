const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const oldLogic = `        if (cleanedLine.length > 0) {
          cleanedLine = cleanedLine.replace(/[\\s,]*$/, ',');
        }`;

const newLogic = `        if (cleanedLine.length > 0) {
          if (!/[。！？]$/.test(cleanedLine)) {
            cleanedLine = cleanedLine.replace(/[\\s,]*$/, ',');
          }
        }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/PreviewColumn.tsx', code);
console.log("Updated cleanString");
