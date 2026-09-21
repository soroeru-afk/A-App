const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const oldLogic = `            if (isMatchActive) {
              const activeStyle = isParen
                ? \`\${highlightBgClass} text-white\`
                : \`bg-blue-600 text-white\`;

              return (`;

const newLogic = `            if (isMatchActive) {
              const activeStyle = 'bg-blue-600 text-white';

              return (`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/PreviewColumn.tsx', code);
console.log("Success");
