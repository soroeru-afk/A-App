const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = `      return newTabs.map((t, i) => ({ ...t, name: \`TAB \${String(i + 1).padStart(2, '0')}\` }));`;
const newCode = `      let normalCount = 0;
      return newTabs.map((t) => {
        if (t.isMemo) return t;
        normalCount++;
        return { ...t, name: \`TAB \${String(normalCount).padStart(2, '0')}\` };
      });`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/App.tsx', code);
