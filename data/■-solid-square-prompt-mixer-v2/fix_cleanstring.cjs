const fs = require('fs');

const previewOld = `        let cleanedLine = line
          .replace(/[\\u3000]/g, ' ')
          .replace(/[ \\t]+/g, ' ')
          .replace(/\\.\\s*,/g, ',')
          .replace(/\\.\\s*$/g, '')
          .replace(/(^|,\\s*)\\.(?=$|\\s*,)/g, '$1')
          .replace(/[ \\t]+,/g, ',')
          .replace(/,+/g, ',')
          .replace(/,[ \\t]*,/g, ',')
          .replace(/,([^\\s])/g, ', $1')
          .trim();
        if (cleanedLine.length > 0) {
          if (!/[。！？]$/.test(cleanedLine)) {
            cleanedLine = cleanedLine.replace(/[\\s,]*$/, ',');
          }
        }`;

const appOld = `        let cleanedLine = line
          .replace(/[\\u3000]/g, ' ')
          .replace(/[ \\t]+/g, ' ')
          .replace(/[ \\t]+,/g, ',')
          .replace(/,+/g, ',')
          .replace(/,[ \\t]*,/g, ',')
          .replace(/,([^\\s])/g, ', $1')
          .trim();
        if (cleanedLine.length > 0) {
          cleanedLine = cleanedLine.replace(/[\\s,]*$/, ',');
        }`;

const newLogic = `        let cleanedLine = line
          .replace(/[\\u3000]/g, ' ')
          .replace(/[ \\t]+/g, ' ')
          .replace(/[ \\t]+,/g, ',')
          .replace(/,+/g, ',')
          .replace(/,[ \\t]*,/g, ',')
          .replace(/,([^\\s])/g, ', $1')
          .trim();
        if (cleanedLine.length > 0) {
          if (!/[。！？.!?]$/.test(cleanedLine)) {
            cleanedLine = cleanedLine.replace(/[\\s,]*$/, ',');
          }
        }`;

let previewCode = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');
previewCode = previewCode.replace(previewOld, newLogic);
fs.writeFileSync('src/components/PreviewColumn.tsx', previewCode);

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(appOld, newLogic);
fs.writeFileSync('src/App.tsx', appCode);

console.log("Updated both files");
