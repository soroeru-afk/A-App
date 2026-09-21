const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const oldFindInputEnd = `            className="bg-bg-input border border-border-main text-[11px] font-mono px-3 py-1.5 rounded focus:outline-none focus:border-blue-500 text-text-main placeholder-gray-600 w-[120px]"
          />
          <input 
            ref={replaceTextRef}`;

const newFindInputEnd = `            className="bg-bg-input border border-border-main text-[11px] font-mono px-3 py-1.5 rounded focus:outline-none focus:border-blue-500 text-text-main placeholder-gray-600 w-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleFindNext();
              }
            }}
          />
          <button 
            onClick={handleFindNext}
            className="px-3 py-1.5 bg-bg-surface hover:bg-border-main text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors"
          >
            {lang === 'en' ? 'Find Next' : '次を検索'}
          </button>
          <input 
            ref={replaceTextRef}`;

code = code.replace(oldFindInputEnd, newFindInputEnd);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
