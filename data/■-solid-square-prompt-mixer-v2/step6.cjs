const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

const regex = /const currentIdx = selections\[key\] \?\? 0;/g;
const replacement = `const currentSelection = selections[key];
    const currentIndices = Array.isArray(currentSelection) ? currentSelection : (currentSelection !== undefined ? [currentSelection as number] : [0]);
    const isSelected = currentIndices.length > 0 && !(currentIndices.length === 1 && currentIndices[0] === 0);`;

content = content.replace(regex, replacement);

if (!content.includes('import React, { useState, useEffect, useRef }')) {
  content = content.replace("import React, { useState, useEffect }", "import React, { useState, useEffect, useRef }");
}

fs.writeFileSync('src/components/AttributeMixer.tsx', content);
