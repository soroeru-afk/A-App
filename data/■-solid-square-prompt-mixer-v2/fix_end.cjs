const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

code = code.replace(
`              <button
                onClick={() => setShowFormatOptions(false)}
                className={\`px-2 h-[28px] \${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center text-text-dim\`}
              >
                <X size={12} />
              </button>
            </div>
          )}`, 
`              <button
                onClick={() => setShowFormatOptions(false)}
                className={\`px-2 h-[28px] \${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center text-text-dim\`}
              >
                <X size={12} />
              </button>
            </div>
          )}
          </>
          )`
);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
