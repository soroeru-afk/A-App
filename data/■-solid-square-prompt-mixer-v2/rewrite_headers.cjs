const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const targetStart = "{/* Top Header: Title, Auto Optimize, Char count */}";
const targetEnd = "{/* Editor Toolbar (Rest) */}";

const oldBlockRegex = new RegExp(
  targetStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + targetEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
);

const newBlock = `{/* Top Header: Title, Auto Optimize, Char count */}
      <div className="p-2 border-b border-border-main flex items-center justify-between bg-bg-panel shrink-0 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-text-main font-bold uppercase tracking-widest hidden lg:inline">{t('output_synthesis', lang)}</span>
          <button 
            onClick={onToggleAutoOptimize}
            className={\`px-2 py-1 text-[9px] font-mono border rounded outline-none transition-colors \${effectiveAutoOptimize 
              ? (theme === 'mono' ? 'bg-text-main text-bg-base border-text-main' : 'bg-blue-500 text-white border-blue-500') 
              : 'bg-transparent border-border-main text-text-dim hover:text-text-main'}\`}
          >
            {t('auto_optimize', lang)}: {effectiveAutoOptimize ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="text-[10px] font-mono text-text-dim shrink-0">
          <span className="font-bold hidden sm:inline">CHAR:</span> {charCount} / {MAX_CHARS}
        </div>
      </div>

      {/* Tools Header: Search, Replace, Copy */}
      <div className="p-2 border-b border-border-main flex flex-wrap items-center justify-between bg-bg-panel shrink-0 gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 flex-1">
          <div className="flex items-center gap-1 shrink-0">
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
                className={\`shrink-0 whitespace-nowrap px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded-l text-text-dim transition-colors\`}
                title="Shift+Enter"
              >
                {lang === 'en' ? 'Prev' : '前へ'}
              </button>
              <button 
                onClick={handleFindNext}
                className={\`shrink-0 whitespace-nowrap px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded-r text-text-dim transition-colors\`}
                title="Enter"
              >
                {lang === 'en' ? 'Next' : '次へ'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <input 
              ref={replaceTextRef}
              type="text" 
              placeholder={t('replace', lang)} 
              value={replaceText}
              onChange={e => {
                setReplaceText(e.target.value);
                setActiveEditor('replace');
                setReplaceCursorPos(e.target.selectionStart || 0);
                setReplaceSelectionEnd(e.target.selectionEnd || 0);
              }}
              onSelect={(e) => {
                setActiveEditor('replace');
                setReplaceCursorPos(e.currentTarget.selectionStart || 0);
                setReplaceSelectionEnd(e.currentTarget.selectionEnd || 0);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const text = e.dataTransfer.getData('text/plain');
                if (text) setReplaceText(text);
              }}
              className="bg-bg-input border border-border-main text-[11px] font-mono px-3 py-1.5 rounded focus:outline-none focus:border-blue-500 text-text-main placeholder-gray-600 w-[120px] shrink-0"
            />
            <button 
              onClick={handleReplace}
              className={\`shrink-0 whitespace-nowrap px-3 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors\`}
            >
              {t('replace', lang)}
            </button>
            <button 
              onClick={handleReplaceAll}
              className={\`shrink-0 whitespace-nowrap px-3 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors\`}
            >
              {t('replace_all', lang)}
            </button>
          </div>

          <div className="flex flex-wrap items-center shrink-0">
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
          </div>
        </div>

        <div className="hidden xl:block w-px h-6 bg-border-main mx-1 shrink-0"></div>
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <span className="text-[10px] font-mono text-text-dim mr-1 flex items-center gap-1 font-bold">
            <Copy className="w-3.5 h-3.5" /> COPY
          </span>
          <button 
            onClick={() => handleCopy('main')}
            className="shrink-0 w-20 h-8 text-[10px] font-mono font-bold rounded transition-colors bg-gray-500 hover:bg-gray-400 active:bg-gray-600 text-white text-center"
          >
            {t('copy_main', lang)}
          </button>
          <button 
            onClick={() => handleCopy('negative')}
            className="shrink-0 w-20 h-8 text-[10px] font-mono font-bold rounded transition-colors bg-gray-500 hover:bg-gray-400 active:bg-gray-600 text-white text-center"
          >
            {t('copy_negative_only', lang)}
          </button>
          <button 
            onClick={() => handleCopy('all')}
            className="shrink-0 w-20 h-8 text-[10px] font-mono font-bold rounded transition-colors bg-gray-500 hover:bg-gray-400 active:bg-gray-600 text-white text-center"
          >
            {t('copy_all', lang)}
          </button>
        </div>
      </div>

      {/* Editor Toolbar (Rest) */}`;

code = code.replace(oldBlockRegex, newBlock);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
