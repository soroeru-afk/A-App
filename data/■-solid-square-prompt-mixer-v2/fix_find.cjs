const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const correctCode = `) : (
            <>
              <input 
                ref={findTextRef}
                type="text" 
                placeholder={t('find', lang)} 
                value={findText}
                onChange={e => {
                  setFindText(e.target.value);
                  setActiveEditor('find');
                  setFindCursorPos(e.target.selectionStart || 0);
                  setFindSelectionEnd(e.target.selectionEnd || 0);
                }}
                onSelect={(e) => {
                  setActiveEditor('find');
                  setFindCursorPos(e.currentTarget.selectionStart || 0);
                  setFindSelectionEnd(e.currentTarget.selectionEnd || 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.shiftKey) handleFindPrev();
                    else handleFindNext();
                  }
                }}
                className={\`w-28 px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-input text-text-main hover:bg-gray-500' : 'bg-bg-input text-text-main border-border-main hover:border-border-hover'} text-[10px] font-mono border rounded outline-none transition-colors\`}
              />
              <div className="flex -space-x-px">
                <button 
                  onClick={handleFindPrev}
                  className={\`px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded-l text-text-dim transition-colors\`}
                  title="Shift+Enter"
                >
                  {lang === 'en' ? 'Prev' : '前へ'}
                </button>
                <button 
                  onClick={handleFindNext}
                  className={\`px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded-r text-text-dim transition-colors\`}
                  title="Enter"
                >
                  {lang === 'en' ? 'Next' : '次へ'}
                </button>
              </div>`;

code = code.replace(/\) : \(\s*<button[\s\S]*?次へ'\}\s*<\/button>/, correctCode);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
