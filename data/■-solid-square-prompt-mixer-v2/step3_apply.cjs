const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

const target = `    categories.forEach(cat => {
      const val = (presets[cat.id] || DEFAULT_PRESETS[cat.id] || [])[selections[cat.id] || 0]?.value || '';
      if (val) {
        if (cat.isNegative) {
          negParts.push(val);
        } else {
          posParts.push(val);
        }
      }
    });`;

const replacement = `    categories.forEach(cat => {
      const selection = selections[cat.id];
      const currentIndices = Array.isArray(selection) ? selection : (selection !== undefined ? [selection as number] : [0]);
      currentIndices.forEach(idx => {
        const val = (presets[cat.id] || DEFAULT_PRESETS[cat.id] || [])[idx]?.value || '';
        if (val) {
          if (cat.isNegative) {
            negParts.push(val);
          } else {
            posParts.push(val);
          }
        }
      });
    });`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/AttributeMixer.tsx', content);
