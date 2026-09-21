const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

const regex = /\{cat\.label\}\s*<\/label>/;
const replacement = `{cat.label}
                {isSelected && currentIndices.filter(idx => idx !== 0).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 leading-none">
                    {currentIndices.filter(idx => idx !== 0).length}
                  </span>
                )}
              </label>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/AttributeMixer.tsx', content);
