const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const target = `{t('auto_optimize', lang)}: {effectiveAutoOptimize ? 'ON' : 'OFF'}`;
const replacement = `{effectiveAutoOptimize ? t('auto_optimize_on', lang) : t('auto_optimize_off', lang)}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/PreviewColumn.tsx', code);
