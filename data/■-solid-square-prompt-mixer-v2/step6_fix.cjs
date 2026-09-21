const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

content = content.replace(
  "{t('reset', lang) || \"リセット\"}",
  "{lang === 'en' ? 'Reset' : 'リセット'}"
);
content = content.replace(
  "{t('apply', lang) || \"適用する\"}",
  "{lang === 'en' ? 'Apply' : '適用する'}"
);

fs.writeFileSync('src/components/AttributeMixer.tsx', content);
