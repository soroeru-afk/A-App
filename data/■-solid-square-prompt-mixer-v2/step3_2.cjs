const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

const applyRegex = /const val = \\(presets\\[cat\\.id\\] \\|\\| DEFAULT_PRESETS\\[cat\\.id\\] \\|\\| \\[\\]\\)\\[selections\\[cat\\.id\\] \\|\\| 0\\]\\?\\.value \\|\\| '';\\s*if \\(val\\) \\{\\s*if \\(cat\\.isNegative\\) \\{\\s*negParts\\.push\\(val\\);\\s*\\} else \\{\\s*posParts\\.push\\(val\\);\\s*\\}\\s*\\}/g;

const applyReplacement = `const selection = selections[cat.id];
      const indices = Array.isArray(selection) ? selection : (selection !== undefined ? [selection as number] : [0]);
      indices.forEach(idx => {
        const val = (presets[cat.id] || DEFAULT_PRESETS[cat.id] || [])[idx]?.value || '';
        if (val) {
          if (cat.isNegative) {
            negParts.push(val);
          } else {
            posParts.push(val);
          }
        }
      });`;

content = content.replace(applyRegex, applyReplacement);
fs.writeFileSync('src/components/AttributeMixer.tsx', content);
