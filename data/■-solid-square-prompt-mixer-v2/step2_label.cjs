const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

const regex = /<label\s*className=\{\`text-\[13px\] font-mono cursor-pointer hover:text-blue-500 truncate flex items-center gap-1\.5 \$\{isSelected \? 'text-blue-500 font-bold' : 'text-text-main'\}\`\}\s*title=\{lang === 'en' \? "Click to expand\/collapse" : "クリックして開閉"\}\s*>\s*\{cat\.isNegative && "⛔ "\}\s*\{isSelected && <span className="w-1\.5 h-1\.5 rounded-full bg-blue-500 inline-block shrink-0 shadow-\[0_0_5px_rgba\(59,130,246,0\.5\)\]"><\/span>\}\s*\{cat\.label\}\s*\{isSelected && currentIndices\.filter\(idx => idx !== 0\)\.length > 0 && \(\s*<span className="ml-1 px-1\.5 py-0\.5 rounded-full text-\[10px\] font-bold bg-blue-500\/10 text-blue-500 leading-none">\s*\{currentIndices\.filter\(idx => idx !== 0\)\.length\}\s*<\/span>\s*\)\}\s*<\/label>/m;

const replacement = `<label 
                className={\`text-[13px] font-mono cursor-pointer hover:opacity-70 truncate flex items-center gap-1.5 \${isSelected ? 'text-text-main font-bold' : 'text-text-main'}\`}
                title={lang === 'en' ? "Click to expand/collapse" : "クリックして開閉"}
              >
                {cat.isNegative && "⛔ "}
                {isSelected && (
                  <div className={\`flex items-center justify-center w-3.5 h-3.5 rounded-full shrink-0 \${cat.isNegative ? (theme === 'mono' ? 'bg-black text-white' : 'bg-red-500 text-white') : (theme === 'mono' ? 'bg-black text-white' : 'bg-blue-500 text-white')}\`}>
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </div>
                )}
                {cat.label}
                {isSelected && currentIndices.filter(idx => idx !== 0).length > 0 && (
                  <span className={\`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none \${cat.isNegative ? (theme === 'mono' ? 'bg-black text-white' : 'bg-red-500 text-white') : (theme === 'mono' ? 'bg-black text-white' : 'bg-blue-500 text-white')}\`}>
                    {currentIndices.filter(idx => idx !== 0).length}
                  </span>
                )}
              </label>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/AttributeMixer.tsx', content);
