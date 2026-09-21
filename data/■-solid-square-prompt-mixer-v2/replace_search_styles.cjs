const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

// 1. Rewrite renderHighlightedText
const oldRenderHighlightedText = `  const renderHighlightedText = (text: string, isNegative: boolean) => {
    const isLight = paperMode || (theme === 'light' || theme === 'mono') || theme === 'paper' || theme === 'mono';
    const highlightColorClass = isLight ? 'text-[#059669] drop-shadow-sm' : 'text-[#34d399] drop-shadow-sm';
    
    // First, split by findText if it exists
    if (appliedFindText) {
      const searchRegex = new RegExp(\`(\\\${escapeRegExp(appliedFindText)})\`, 'gi');
      const searchParts = text.split(searchRegex);
      
      let currentGlobalIndex = 0;
      return searchParts.map((sPart, j) => {
        const partStartIndex = currentGlobalIndex;
        currentGlobalIndex += sPart.length;

        if (sPart.toLowerCase() === appliedFindText.toLowerCase()) {
          const cursorPos = isNegative ? negativeCursorPos : positiveCursorPos;
          const isActiveEditor = activeEditor === (isNegative ? 'negative' : 'positive');
          const isMatchActive = searchSelectionActive && isActiveEditor && cursorPos !== null && partStartIndex === cursorPos;
          
          return (
            <span 
              key={\`find-\${j}\`} 
              className={\`bg-amber-500/40 px-[2px] mx-[-2px] rounded-[3px] \${isMatchActive ? 'border-b-[3px] border-blue-500 z-10 relative' : ''}\`}
            >
              {sPart}
            </span>
          );
        }
        // Further split by parentheses
        const parts = sPart.split(/(\\([^)]+\\))/g);
        return parts.map((part, i) => {
          if (part.startsWith('(') && part.endsWith(')')) {
            return <span key={\`paren-\${j}-\${i}\`} className={highlightColorClass}>{part}</span>;
          }
          return <span key={\`text-\${j}-\${i}\`}>{part}</span>;
        });
      });
    }

    // No findText
    const parts = text.split(/(\\([^)]+\\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('(') && part.endsWith(')')) {
        return <span key={\`paren-\${i}\`} className={highlightColorClass}>{part}</span>;
      }
      return <span key={\`text-\${i}\`}>{part}</span>;
    });
  };`;

const newRenderHighlightedText = `  const renderHighlightedText = (text: string, isNegative: boolean) => {
    const isLight = paperMode || (theme === 'light' || theme === 'mono') || theme === 'paper';
    const highlightColorClass = isLight ? 'text-[#059669] drop-shadow-sm' : 'text-[#34d399] drop-shadow-sm';
    const highlightBgClass = isLight ? 'bg-[#059669]' : 'bg-[#34d399]';

    let currentGlobalIndex = 0;

    const parenParts = text.split(/(\\([^)]+\\))/g);

    return parenParts.map((parenPart, i) => {
      const isParen = parenPart.startsWith('(') && parenPart.endsWith(')');
      const baseClass = isParen ? highlightColorClass : '';

      if (appliedFindText) {
        const searchRegex = new RegExp(\`(\\\${escapeRegExp(appliedFindText)})\`, 'gi');
        const searchParts = parenPart.split(searchRegex);

        return searchParts.map((sPart, j) => {
          const partStartIndex = currentGlobalIndex;
          currentGlobalIndex += sPart.length;

          if (sPart.toLowerCase() === appliedFindText.toLowerCase()) {
            const cursorPos = isNegative ? negativeCursorPos : positiveCursorPos;
            const isActiveEditor = activeEditor === (isNegative ? 'negative' : 'positive');
            const isMatchActive = searchSelectionActive && isActiveEditor && cursorPos !== null && partStartIndex === cursorPos;

            if (isMatchActive) {
              const activeStyle = isParen
                ? \`\${highlightBgClass} text-white\`
                : \`bg-blue-600 text-white\`;

              return (
                <span key={\`find-\${i}-\${j}\`} className={\`\${activeStyle} rounded-[2px] z-10 relative\`}>
                  {sPart}
                </span>
              );
            } else {
              return (
                <span key={\`find-\${i}-\${j}\`} className={\`bg-amber-500/40 rounded-[2px] \${baseClass}\`}>
                  {sPart}
                </span>
              );
            }
          }

          return <span key={\`text-\${i}-\${j}\`} className={baseClass}>{sPart}</span>;
        });
      }

      currentGlobalIndex += parenPart.length;
      return <span key={\`text-\${i}\`} className={baseClass}>{parenPart}</span>;
    });
  };`;

code = code.replace(oldRenderHighlightedText, newRenderHighlightedText);

// 2. Modify positive textarea classes
const oldPosTextareaClass = `className={\`absolute inset-0 w-full h-full p-4 pt-2 m-0 border-none rounded-none appearance-none whitespace-pre-wrap break-words overflow-y-auto block tracking-normal focus:ring-0 shadow-none font-mono \${searchSelectionActive ? 'selection:bg-transparent' : 'selection:bg-blue-500/40'} selection:text-transparent bg-transparent text-transparent caret-text-main outline-none resize-none\`}`;
const newPosTextareaClass = `className={\`absolute inset-0 w-full h-full p-4 pt-2 m-0 border-none rounded-none appearance-none whitespace-pre-wrap break-words overflow-y-auto block tracking-normal focus:ring-0 shadow-none font-mono \${searchSelectionActive ? 'selection:bg-transparent selection:text-transparent' : 'selection:bg-blue-600 selection:text-white'} bg-transparent text-transparent caret-text-main outline-none resize-none\`}`;
code = code.replace(oldPosTextareaClass, newPosTextareaClass);

// 3. Modify negative textarea classes
const oldNegTextareaClass = `className={\`absolute inset-0 w-full h-full p-4 pt-2 m-0 border-none rounded-none appearance-none whitespace-pre-wrap break-words overflow-y-auto block tracking-normal focus:ring-0 shadow-none font-mono \${searchSelectionActive ? 'selection:bg-transparent' : 'selection:bg-red-500/40'} selection:text-transparent bg-transparent text-transparent caret-text-main outline-none resize-none\`}`;
const newNegTextareaClass = `className={\`absolute inset-0 w-full h-full p-4 pt-2 m-0 border-none rounded-none appearance-none whitespace-pre-wrap break-words overflow-y-auto block tracking-normal focus:ring-0 shadow-none font-mono \${searchSelectionActive ? 'selection:bg-transparent selection:text-transparent' : 'selection:bg-red-600 selection:text-white'} bg-transparent text-transparent caret-text-main outline-none resize-none\`}`;
code = code.replace(oldNegTextareaClass, newNegTextareaClass);

// 4. Wrap input with clear button
const oldInput = `<input 
              ref={findTextRef}
              type="text" 
              placeholder={t('find', lang)} 
              value={findText}
              onChange={e => {
                setFindText(e.target.value);
                if (e.target.value === '') setAppliedFindText('');
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
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const text = e.dataTransfer.getData('text/plain');
                if (text) {
                  setFindText(text);
                  if (text === '') setAppliedFindText('');
                  setActiveEditor('find');
                }
              }}
              className={\`w-28 px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-input text-text-main hover:bg-gray-500' : 'bg-bg-input text-text-main border-border-main hover:border-border-hover'} text-[10px] font-mono border rounded outline-none transition-colors\`}
            />`;

const newInput = `<div className="relative flex items-center">
              <input 
                ref={findTextRef}
                type="text" 
                placeholder={t('find', lang)} 
                value={findText}
                onChange={e => {
                  setFindText(e.target.value);
                  if (e.target.value === '') setAppliedFindText('');
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
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const text = e.dataTransfer.getData('text/plain');
                  if (text) {
                    setFindText(text);
                    if (text === '') setAppliedFindText('');
                    setActiveEditor('find');
                  }
                }}
                className={\`w-28 pl-2 pr-6 py-1.5 \${theme === 'mono' ? 'bg-bg-input text-text-main hover:bg-gray-500' : 'bg-bg-input text-text-main border-border-main hover:border-border-hover'} text-[10px] font-mono border rounded outline-none transition-colors\`}
              />
              {findText && (
                <button
                  onClick={() => {
                    setFindText('');
                    setAppliedFindText('');
                    setActiveEditor('find');
                    if (findTextRef.current) findTextRef.current.focus();
                  }}
                  className="absolute right-1 text-text-dim hover:text-text-main transition-colors"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>`;

code = code.replace(oldInput, newInput);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
