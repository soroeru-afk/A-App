const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

const regex = /const selectedIdx = selections\[cat\.id\] \?\? 0;\s*if \(selectedIdx === 0\) return;\s*const items = presets\[cat\.id\] || DEFAULT_PRESETS\[cat\.id\] || \[\];\s*const selectedItem = items\[selectedIdx\];\s*if \(\!selectedItem || selectedItem\.value\.trim\(\) === ''\) return;\s*newParts\.push\(\{/g;

const replacement = `const selection = selections[cat.id];
        const currentIndices = Array.isArray(selection) ? selection : (selection !== undefined ? [selection] : [0]);
        currentIndices.forEach(idx => {
          if (idx === 0) return;
          const items = presets[cat.id] || DEFAULT_PRESETS[cat.id] || [];
          const selectedItem = items[idx];
          if (!selectedItem || selectedItem.value.trim() === '') return;
          newParts.push({`;

content = content.replace(regex, replacement);

content = content.replace(/isNegative: cat\.isNegative\s*\r?\n\s*\}\);\s*\r?\n\s*\}\);\s*\r?\n\s*if/g, 'isNegative: cat.isNegative\n        });\n        });\n      });\n\n      if');

fs.writeFileSync('src/components/AttributeMixer.tsx', content);
