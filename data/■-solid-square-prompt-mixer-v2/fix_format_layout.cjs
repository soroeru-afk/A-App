const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const oldBlock = `<div className="flex flex-wrap items-center shrink-0">
            {!showFormatOptions ? (
              <button 
                onClick={() => setShowFormatOptions(true)}
                className={\`shrink-0 whitespace-nowrap ml-2 px-3 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors shrink-0\`}
              >
                {lang === 'en' ? 'Format...' : 'テキスト整理...'}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                <button 
                  onClick={handleFormatComma}
                  className={\`px-3 h-[28px] \${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center gap-2\`}
                  title="Toggle periods and commas"
                >
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">.</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-text-dim opacity-80" />
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">,</span>
                </button>
                <button 
                  onClick={handleFormatHyphen}
                  className={\`px-3 h-[28px] \${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center gap-2\`}
                  title="Toggle periods and hyphens"
                >
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">.</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-text-dim opacity-80" />
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">-</span>
                </button>
                <button 
                  onClick={handleStripPunctuation}
                  className={\`px-3 h-[28px] \${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center gap-2\`}
                  title="Toggle punctuation and spaces"
                >
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">.,</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-text-dim opacity-80" />
                  <span className="text-[10px] font-bold text-text-dim leading-none">{lang === 'en' ? 'SPACE' : '空白'}</span>
                </button>
                <button
                  onClick={() => setShowFormatOptions(false)}
                  className={\`px-2 h-[28px] \${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center text-text-dim\`}
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>`;

const newBlock = `<div className="relative flex items-center shrink-0 ml-2">
            <button 
              onClick={() => setShowFormatOptions(!showFormatOptions)}
              className={\`shrink-0 whitespace-nowrap px-3 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded \${showFormatOptions ? 'text-text-main bg-border-main/50' : 'text-text-dim'} transition-colors shrink-0\`}
            >
              {lang === 'en' ? 'Format...' : 'テキスト整理...'}
            </button>
            
            {showFormatOptions && (
              <div className="absolute top-[calc(100%+4px)] left-0 bg-bg-panel border border-border-main rounded-md shadow-xl flex flex-col gap-1.5 p-2 z-[100] min-w-[200px]">
                <button 
                  onClick={handleFormatComma}
                  className={\`px-3 h-[28px] \${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center gap-2\`}
                  title="Toggle periods and commas"
                >
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">.</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-text-dim opacity-80" />
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">,</span>
                </button>
                <button 
                  onClick={handleFormatHyphen}
                  className={\`px-3 h-[28px] \${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center gap-2\`}
                  title="Toggle periods and hyphens"
                >
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">.</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-text-dim opacity-80" />
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">-</span>
                </button>
                <button 
                  onClick={handleStripPunctuation}
                  className={\`px-3 h-[28px] \${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center gap-2\`}
                  title="Toggle punctuation and spaces"
                >
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">.,</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-text-dim opacity-80" />
                  <span className="text-[10px] font-bold text-text-dim leading-none">{lang === 'en' ? 'SPACE' : '空白'}</span>
                </button>
              </div>
            )}
          </div>`;

// Using a slightly more robust replace in case whitespace differs
const lines = code.split('\n');
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('onClick={() => setShowFormatOptions(true)}') && lines[i-1].includes('!showFormatOptions')) {
        startIndex = i - 2; // getting up to <div className="flex flex-wrap items-center shrink-0">
    }
    if (startIndex !== -1 && lines[i].includes('<X size={12} />')) {
        endIndex = i + 4; // up to the closing div of the block
        break;
    }
}

if (startIndex !== -1 && endIndex !== -1) {
    const before = lines.slice(0, startIndex).join('\n');
    const after = lines.slice(endIndex + 1).join('\n');
    code = before + '\n' + newBlock + '\n' + after;
    fs.writeFileSync('src/components/PreviewColumn.tsx', code);
    console.log("Success replacing block using indices: ", startIndex, endIndex);
} else {
    console.log("Failed to find block boundaries. Trying direct string replace.");
    if (code.includes(oldBlock)) {
        code = code.replace(oldBlock, newBlock);
        fs.writeFileSync('src/components/PreviewColumn.tsx', code);
        console.log("Success with exact string replace.");
    } else {
        console.log("Could not find block to replace.");
    }
}
