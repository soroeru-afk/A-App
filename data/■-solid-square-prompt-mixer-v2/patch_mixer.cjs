const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

content = content.replace(
  /selections: Record<string, number>;/g,
  'selections: Record<string, number | number[]>;'
);

content = content.replace(
  /const \[selections, setSelections\] = useState<Record<string, number>>\(\(\) => \{/g,
  'const [selections, setSelections] = useState<Record<string, number | number[]>>(() => {'
);

fs.writeFileSync('src/components/AttributeMixer.tsx', content);
